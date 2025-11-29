import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getSocket, joinConversation, leaveConversation, sendConversationMessage, startTyping, stopTyping } from '@/lib/socket';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'wouter';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderType: string;
    content: string;
    messageType?: string;
    projectProposalId?: string;
    isRead: boolean;
    createdAt: Date;
    sender?: {
        id: string;
        fullName: string;
        profileImage?: string;
        type: string;
    };
}

interface Proposal {
    id: string;
    title: string;
    description: string;
    price: string;
    status: string;
    leaderId: string;
    productOwnerId: string;
    leaderEarnings?: string;
    platformFee?: string;
    memberEarnings?: string;
    createdAt: Date;
}

interface ConversationChatProps {
    conversationId: string;
    currentUserId: string;
    currentUserType: 'product_owner' | 'freelancer';
    recipientId: string;
    recipientName?: string;
    recipientImage?: string;
    groupName?: string;
    leaderId?: string;
}

export default function ConversationChat({
    conversationId,
    currentUserId,
    currentUserType,
    recipientId,
    recipientName,
    recipientImage,
    groupName,
    leaderId,
}: ConversationChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const { toast } = useToast();

    // Helper to resolve relative uploads to absolute URLs
    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return undefined;
        if (imagePath.startsWith('http')) return imagePath;
        return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    // Fetch recipient online status
    const { data: statusData } = useQuery<{ userId: string; isOnline: boolean; lastSeen: Date | null }>({
        queryKey: [`/api/freelancers/${recipientId}/status`],
        refetchInterval: 30000, // Refetch every 30 seconds
        enabled: !!recipientId,
    });

    // Update online status when data changes
    useEffect(() => {
        if (statusData) {
            setIsOnline(statusData.isOnline);
        }
    }, [statusData]);

    // Report chat mutation
    const reportChatMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/conversations/${conversationId}/report`, 'POST', {
                reason: 'inappropriate_content'
            });
        },
        onSuccess: () => {
            toast({
                title: 'تم',
                description: 'تم تقرير المحادثة بنجاح',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'خطأ',
                description: error.message || 'حدث خطأ أثناء تقرير المحادثة',
                variant: 'destructive',
            });
        },
    });

    // Fetch initial messages
    const { data: initialMessages, isLoading } = useQuery<Message[]>({
        queryKey: [`/api/conversations/${conversationId}/messages`],
    });

    // Fetch direct messages with the leader if leaderId is provided
    const { data: directMessages = [] } = useQuery<any[]>({
        queryKey: [`/api/direct-messages/${leaderId || recipientId}`],
        queryFn: async () => {
            if (!leaderId && currentUserType !== 'product_owner') return [];
            const targetId = leaderId || recipientId;
            const response = await fetch(
                `/api/direct-messages/${targetId}?userType=freelancer`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.ok) return [];
            return response.json();
        },
        enabled: currentUserType === 'product_owner' && !!(leaderId || recipientId),
    });

    // Log initial messages to debug
    useEffect(() => {
        if (initialMessages) {
            console.log("=== ConversationChat Initial Messages ===");
            console.log("Total conversation messages:", initialMessages.length);
            console.log("Total direct messages:", directMessages.length);
            initialMessages.forEach((msg, i) => {
                console.log(`Conversation Message ${i}:`, {
                    id: msg.id,
                    content: msg.content?.substring(0, 100),
                    hasProposal: msg.content?.includes("[PROPOSAL]")
                });
            });
            directMessages.forEach((msg, i) => {
                const content = typeof msg.content === 'string' ? msg.content : msg.content?.content || '';
                console.log(`Direct Message ${i}:`, {
                    id: msg.id,
                    content: content?.substring(0, 100),
                    hasProposal: content?.includes("[PROPOSAL]")
                });
            });
        }
    }, [initialMessages, directMessages]);

    // Fetch proposals for this conversation
    const { data: proposals = [] } = useQuery<Proposal[]>({
        queryKey: [`/api/proposals/conversation/${conversationId}`],
    });

    // Accept proposal mutation
    const acceptProposalMutation = useMutation({
        mutationFn: async ({ proposalData, messageId }: { proposalData: any; messageId: string }) => {
            console.log('🚀 Starting accept proposal mutation...');
            console.log('📋 Proposal Data:', proposalData);
            console.log('💬 Conversation ID:', conversationId);
            console.log('👤 Leader ID:', leaderId || recipientId);

            try {
                const requestBody = {
                    conversationId,
                    leaderId: leaderId || recipientId,
                    title: proposalData.title,
                    description: proposalData.description,
                    budget: proposalData.budget,
                    deliveryTime: proposalData.deliveryTime,
                    skills: proposalData.skills,
                    serviceType: proposalData.serviceType,
                };

                console.log('📤 Request Body:', requestBody);

                const res = await apiRequest(`/api/proposals/accept`, 'POST', requestBody);

                console.log('📥 Response Status:', res.status);
                console.log('📥 Response OK:', res.ok);

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ error: 'حدث خطأ غير متوقع' }));
                    console.error('❌ Error Response:', errorData);
                    throw new Error(errorData.error || 'فشل قبول العرض');
                }

                const data = await res.json();
                console.log('✅ Success Response:', data);
                return data;
            } catch (error) {
                console.error('💥 Exception in mutation:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('🎉 Mutation Success Handler Called');
            console.log('📊 Data received:', data);

            // Force refetch messages immediately
            queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
            queryClient.invalidateQueries({ queryKey: [`/api/direct-messages/${leaderId || recipientId}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/product-owners/${localStorage.getItem('userId')}/wallet`] });

            // Force immediate refetch
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
            }, 100);

            // Show success alert
            alert(
                `✅ تم قبول العرض بنجاح!\n\n` +
                `📋 المشروع: ${data.project?.title}\n` +
                `💰 المبلغ المخصوم: ${data.project?.budget} ريال\n\n` +
                `💼 تم تجميد المبلغ في الضمان حتى إتمام المشروع\n\n` +
                `📊 توزيع الأرباح:\n` +
                `• 30% لقائد المجموعة\n` +
                `• 10% رسوم المنصة\n` +
                `• 60% لأعضاء الفريق (يتم التوزيع بعد إكمال المهام)\n\n` +
                `سيتم تحرير الأموال وتوزيعها تلقائياً عند إتمام جميع المهام.`
            );

            toast({
                title: '✅ تم قبول العرض',
                description: 'تم إنشاء المشروع وتجميد المبلغ في الضمان',
                duration: 5000,
            });
        },
        onError: (error: any) => {
            console.error('🔴 Mutation Error Handler Called');
            console.error('❌ Error object:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);

            // Show error alert with details
            alert(
                `❌ فشل قبول العرض\n\n` +
                `السبب: ${error.message}\n\n` +
                `الرجاء التحقق من:\n` +
                `• رصيدك الحالي في المحفظة\n` +
                `• صحة بيانات العرض\n` +
                `• اتصالك بالإنترنت\n\n` +
                `إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.`
            );

            toast({
                variant: 'destructive',
                title: '❌ خطأ في قبول العرض',
                description: error.message,
                duration: 6000,
            });
        }
    });

    // Reject proposal mutation
    const rejectProposalMutation = useMutation({
        mutationFn: async ({ proposalData, messageId }: { proposalData: any; messageId: string }) => {
            const res = await apiRequest(`/api/proposals/reject`, 'POST', {
                conversationId,
                leaderId: leaderId || recipientId,
                proposalData,
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
            queryClient.invalidateQueries({ queryKey: [`/api/direct-messages/${leaderId || recipientId}`] });
            toast({ title: 'تم رفض العرض', description: 'تم إرسال إشعار للفريلانسر' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message || 'فشل رفض العرض' });
        }
    });

    // Complete project mutation
    const completeProjectMutation = useMutation({
        mutationFn: async (proposalId: string) => {
            const res = await apiRequest(`/api/proposals/${proposalId}/complete`, 'POST');
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/proposals/conversation/${conversationId}`] });
            toast({ title: 'تم', description: 'تم تحديد المشروع كمكتمل' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        }
    });

    // Confirm complete mutation
    const confirmCompleteMutation = useMutation({
        mutationFn: async (proposalId: string) => {
            const res = await apiRequest(`/api/proposals/${proposalId}/confirm-complete`, 'POST');
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/proposals/conversation/${conversationId}`] });
            toast({ title: 'تم', description: 'تم توزيع الأرباح بنجاح' });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        }
    });

    // Initialize socket and join conversation
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        setIsConnected(socket.connected);

        // Join conversation room
        joinConversation(conversationId);

        // Handle connection events
        const handleConnect = () => {
            setIsConnected(true);
            joinConversation(conversationId);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        // Handle incoming messages
        const handleConversationMessage = (message: Message) => {
            setMessages((prev) => [...prev, message]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        // Handle typing indicators
        const handleTypingStart = ({ userId }: { userId: string }) => {
            if (userId !== currentUserId) {
                setIsTyping(true);
            }
        };

        const handleTypingStop = ({ userId }: { userId: string }) => {
            if (userId !== currentUserId) {
                setIsTyping(false);
            }
        };

        // Handle errors
        const handleError = ({ message }: { message: string }) => {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: message,
            });
        };

        // Handle user online/offline status changes
        const handleUserOnline = ({ userId }: { userId: string }) => {
            if (userId === recipientId) {
                setIsOnline(true);
            }
        };

        const handleUserOffline = ({ userId }: { userId: string }) => {
            if (userId === recipientId) {
                setIsOnline(false);
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('conversation:message', handleConversationMessage);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);
        socket.on('error', handleError);
        socket.on('user:online', handleUserOnline);
        socket.on('user:offline', handleUserOffline);

        // Load initial messages - merge conversation and direct messages
        if (initialMessages || directMessages.length > 0) {
            const convMsgs = initialMessages || [];
            const allMessages = [...convMsgs, ...directMessages].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(allMessages);
            setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('conversation:message', handleConversationMessage);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
            socket.off('error', handleError);
            socket.off('user:online', handleUserOnline);
            socket.off('user:offline', handleUserOffline);
            leaveConversation(conversationId);
        };
    }, [conversationId, currentUserId, initialMessages, directMessages, toast, recipientId]);

    // Handle sending message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected) return;

        sendConversationMessage(conversationId, newMessage.trim());
        setNewMessage('');
        stopTyping('conversation', conversationId);
    };

    // Handle typing
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!typingTimeoutRef.current) {
            startTyping('conversation', conversationId);
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping('conversation', conversationId);
            typingTimeoutRef.current = undefined;
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Chat header */}
            <div className="border-b px-6 py-4 flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <Link href={currentUserType === 'product_owner' ? '/product-owner-dashboard/conversations' : '/freelancer-dashboard/conversations'}>
                    <Button variant="ghost" size="icon" data-testid="button-back">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={recipientImage} />
                            <AvatarFallback>{recipientName?.charAt(0) || '؟'}</AvatarFallback>
                        </Avatar>
                        {/* Online/Offline status indicator */}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{recipientName}</h3>
                        <div className="flex items-center gap-2">
                            {groupName && <p className="text-sm text-muted-foreground">{groupName}</p>}
                            <p className="text-xs font-medium">
                                {isOnline ? (
                                    <span className="text-green-600">متصل الآن</span>
                                ) : (
                                    <span className="text-gray-500">غير متصل</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {!isConnected && (
                    <div className="text-sm text-yellow-600">جارٍ الاتصال...</div>
                )}

                {/* Report menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid="button-menu-options">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => reportChatMutation.mutate()}
                            disabled={reportChatMutation.isPending}
                            className="text-red-600"
                            data-testid="menu-report-chat"
                        >
                            <Flag className="h-4 w-4 ml-2" />
                            تقرير هذه المحادثة
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && proposals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <p className="text-lg font-medium">لا توجد رسائل بعد</p>
                        <p className="text-sm">ابدأ المحادثة الآن!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            const isOwnMessage = message.senderId === currentUserId;

                            // Extract content string - handle both string and object formats
                            let contentString = typeof message.content === 'string' ? message.content : (message.content as any)?.content || '';

                            console.log("=== ConversationChat Message Debug ===");
                            console.log("Message ID:", message.id);
                            console.log("Message content type:", typeof message.content);
                            console.log("Content string:", contentString?.substring(0, 100));
                            console.log("Has [PROPOSAL]:", contentString?.includes("[PROPOSAL]"));
                            console.log("Has [/PROPOSAL]:", contentString?.includes("[/PROPOSAL]"));

                            // Check if this is a proposal message
                            const isProposal = contentString?.includes("[PROPOSAL]") && contentString?.includes("[/PROPOSAL]");
                            let proposalData = null;

                            // Check if this is a group invite message
                            const isGroupInvite = contentString?.includes('[GROUP_INVITE]') && contentString?.includes('[/GROUP_INVITE]');
                            let groupInviteData: any = null;

                            console.log("Is proposal:", isProposal);

                            if (isProposal) {
                                try {
                                    const match = contentString.match(/\[PROPOSAL\](.*?)\[\/PROPOSAL\]/s);
                                    console.log("Regex match result:", match);
                                    if (match) {
                                        console.log("Match[1] (JSON raw):", match[1]);

                                        // Try to clean the string before parsing
                                        let jsonString = match[1].trim();
                                        // Unescape if needed
                                        if (jsonString.includes('\\"')) {
                                            jsonString = jsonString.replace(/\\\"/g, '"');
                                            console.log("After unescape:", jsonString.substring(0, 50));
                                        }

                                        proposalData = JSON.parse(jsonString);
                                        console.log("Parsed proposal data:", proposalData);
                                    } else {
                                        console.error("No match found for proposal tags");
                                    }
                                } catch (e) {
                                    console.error("Failed to parse proposal:", e);
                                    console.error("Raw message.content was:", message.content);
                                }
                            }

                            // If it's a proposal but parsing failed, don't show the raw JSON
                            if (isProposal && !proposalData) {
                                console.log("Hiding failed proposal message");
                                return null;
                            }

                            // Parse group invite payload
                            if (isGroupInvite) {
                                try {
                                    const match = contentString.match(/\[GROUP_INVITE\](.*?)\[\/GROUP_INVITE\]/s);
                                    if (match) {
                                        let jsonString = match[1].trim();
                                        if (jsonString.includes('\\"')) jsonString = jsonString.replace(/\\\"/g, '"');
                                        if (!jsonString.includes('"') && /\{[^}]*\}/.test(jsonString)) {
                                            jsonString = jsonString
                                                .replace(/'(\s*\w+\s*)':/g, '"$1":')
                                                .replace(/: '([^']*)'/g, ': "$1"');
                                        }
                                        groupInviteData = JSON.parse(jsonString);
                                    }
                                } catch (e) {
                                    console.error('Failed to parse group invite:', e);
                                }
                            }

                            if (isGroupInvite && !groupInviteData) {
                                return null;
                            }

                            // If it's a successfully parsed proposal, show the proposal card
                            if (proposalData) {
                                return (
                                    <div key={message.id} className="w-full max-w-2xl mx-auto my-4">
                                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-md">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl text-blue-900 mb-1">
                                                                {proposalData.title}
                                                            </CardTitle>
                                                        </div>
                                                    </div>
                                                    {/* Status Badge */}
                                                    <Badge
                                                        variant={proposalData.status === "accepted" ? "default" : "secondary"}
                                                        className={proposalData.status === "accepted"
                                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-bold shadow-md"
                                                            : "bg-yellow-100 text-yellow-800 px-4 py-2 text-sm font-bold"}
                                                    >
                                                        {proposalData.status === "accepted" ? "✓ تم القبول" : "⏳ قيد المراجعة"}
                                                    </Badge>
                                                </div>
                                                <div className="mr-[60px]">
                                                    {proposalData.serviceType && (
                                                        <p className="text-sm text-blue-700 font-medium mb-1">
                                                            {(() => {
                                                                const servicesList = [
                                                                    { id: "google_play_review", name: "تقييم تطبيقك على Google Play" },
                                                                    { id: "ios_review", name: "تقييم تطبيقك على iOS" },
                                                                    { id: "website_review", name: "تقييم موقعك الإلكتروني" },
                                                                    { id: "ux_testing", name: "اختبار تجربة المستخدم لتطبيقك أو موقعك" },
                                                                    { id: "software_testing", name: "اختبار أنظمة السوفت وير" },
                                                                    { id: "social_media_engagement", name: "التفاعل مع منشورات السوشيال ميديا" },
                                                                    { id: "google_maps_review", name: "تقييمات خرائط جوجل ماب (Google Maps Reviews)" },
                                                                ];
                                                                const service = servicesList.find(s => s.id === proposalData.serviceType);
                                                                return service?.name || proposalData.serviceType;
                                                            })()}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-blue-600">
                                                        {new Date(proposalData.createdAt).toLocaleDateString('ar-SA')}
                                                    </p>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                        <span>📝</span> الوصف
                                                    </h4>
                                                    <p className="text-gray-600 leading-relaxed">{proposalData.description}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                                                        <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-1 text-sm">
                                                            <span>⏱️</span> مدة التسليم
                                                        </h4>
                                                        <p className="text-purple-600 font-bold">{proposalData.deliveryTime}</p>
                                                    </div>

                                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                                                        <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-1 text-sm">
                                                            <span>💰</span> الميزانية
                                                        </h4>
                                                        <p className="text-green-600 font-bold">{proposalData.budget} ريال</p>
                                                    </div>
                                                </div>

                                                {proposalData.skills && (
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-100">
                                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                            <span>🎯</span> المهارات المطلوبة
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(Array.isArray(proposalData.skills)
                                                                ? proposalData.skills
                                                                : proposalData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
                                                            ).map((skill: string, index: number) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-sm"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {currentUserType === "product_owner" && proposalData.status !== "accepted" && proposalData.status !== "approved" && (
                                                    <div className="flex gap-3 pt-2">
                                                        <Button
                                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
                                                            disabled={acceptProposalMutation.isPending}
                                                            onClick={() => {
                                                                console.log('🖱️ Accept button clicked!');
                                                                console.log('📋 Current Proposal Data:', proposalData);
                                                                console.log('💬 Message ID:', message.id);
                                                                console.log('⏳ Mutation Pending:', acceptProposalMutation.isPending);

                                                                // Show confirmation dialog
                                                                const confirmed = window.confirm(
                                                                    `⚠️ هل أنت متأكد من قبول هذا العرض؟\n\n` +
                                                                    `📋 المشروع: ${proposalData.title}\n` +
                                                                    `💰 المبلغ الإجمالي: ${proposalData.budget} ريال\n\n` +
                                                                    `سيتم خصم المبلغ من محفظتك وتجميده في الضمان حتى إتمام المشروع.\n\n` +
                                                                    `📊 توزيع الأرباح:\n` +
                                                                    `• 30% لقائد المجموعة (${(parseFloat(proposalData.budget) * 0.3).toFixed(2)} ريال)\n` +
                                                                    `• 10% رسوم المنصة (${(parseFloat(proposalData.budget) * 0.1).toFixed(2)} ريال)\n` +
                                                                    `• 60% لأعضاء الفريق (${(parseFloat(proposalData.budget) * 0.6).toFixed(2)} ريال)\n\n` +
                                                                    `سيتم توزيع أرباح الأعضاء تلقائياً عند إكمال جميع المهام.\n\n` +
                                                                    `هل تريد المتابعة؟`
                                                                );

                                                                console.log('✅ User confirmed:', confirmed);

                                                                if (confirmed) {
                                                                    console.log('🚀 Calling acceptProposalMutation.mutate...');
                                                                    try {
                                                                        acceptProposalMutation.mutate({ proposalData, messageId: message.id });
                                                                        console.log('✅ Mutation called successfully');
                                                                    } catch (error) {
                                                                        console.error('💥 Error calling mutation:', error);
                                                                    }
                                                                } else {
                                                                    console.log('❌ User cancelled');
                                                                }
                                                            }}
                                                        >
                                                            {acceptProposalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '✓ قبول العرض'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-sm hover:shadow-md transition-all"
                                                            disabled={rejectProposalMutation.isPending}
                                                            onClick={() => {
                                                                rejectProposalMutation.mutate({ proposalData, messageId: message.id });
                                                            }}
                                                        >
                                                            {rejectProposalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '✗ رفض العرض'}
                                                        </Button>
                                                    </div>
                                                )}

                                                {proposalData.status === "approved" && (
                                                    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3 text-center">
                                                        <p className="text-green-700 font-semibold">✓ تم قبول العرض</p>
                                                    </div>
                                                )}

                                                {proposalData.status === "rejected" && (
                                                    <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 text-center">
                                                        <p className="text-red-700 font-semibold">✗ تم رفض العرض</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            }

                            // Group invitation card
                            if (groupInviteData) {
                                return (
                                    <div key={message.id} className="w-full max-w-2xl mx-auto my-4">
                                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v16h5" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a5 5 0 100-10 5 5 0 000 10zM20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl text-green-900 mb-1">
                                                                دعوة للانضمام كمراقب
                                                            </CardTitle>
                                                            <p className="text-sm text-green-700">المجموعة: {groupInviteData.groupName}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-100">
                                                    <p className="text-sm text-gray-700">
                                                        تم إرسال دعوة من {groupInviteData.invitedBy}. يمكنك مشاهدة المجموعة والانضمام كمراقب.
                                                    </p>
                                                </div>

                                                {currentUserType === 'product_owner' && (
                                                    <div className="flex gap-3 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-2 border-green-300 text-green-700 hover:bg-green-50"
                                                            onClick={() => (window.location.href = `/groups/${groupInviteData.groupId}/community`)}
                                                        >
                                                            عرض المجموعة
                                                        </Button>
                                                        <Button
                                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch(`/api/groups/${groupInviteData.groupId}/spectators`, {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                        },
                                                                    });
                                                                    const data = await res.json();
                                                                    if (!res.ok) throw new Error(data.error || 'تعذر الانضمام كمراقب');
                                                                    window.location.href = `/groups/${groupInviteData.groupId}/community`;
                                                                } catch (e: any) {
                                                                    toast({ variant: 'destructive', title: 'خطأ', description: e.message || 'فشل الانضمام كمراقب' });
                                                                }
                                                            }}
                                                        >
                                                            انضم كمراقب
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            }

                            // Regular message display
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                    data-testid={`message-${message.id}`}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={getImageUrl(message.sender?.profileImage)} />
                                        <AvatarFallback>
                                            {message.sender?.fullName?.charAt(0) || '؟'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">
                                                {isOwnMessage ? 'أنت' : message.sender?.fullName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(message.createdAt), 'p', { locale: ar })}
                                            </span>
                                        </div>
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${isOwnMessage
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{contentString}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Display Proposals */}
                        {/* {proposals.length > 0 && (
              <div className="space-y-3 mt-6">
                <p className="text-sm font-medium text-muted-foreground">المقترحات المرسلة:</p>
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="bg-muted p-4" data-testid={`proposal-card-${proposal.id}`}>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{proposal.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">السعر: {proposal.price} ريال</div>
                        <Badge
                          variant={
                            proposal.status === 'accepted'
                              ? 'default'
                              : proposal.status === 'rejected'
                              ? 'destructive'
                              : proposal.status === 'completed'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {proposal.status === 'pending' && 'قيد الانتظار'}
                          {proposal.status === 'accepted' && 'مقبول'}
                          {proposal.status === 'rejected' && 'مرفوض'}
                          {proposal.status === 'completed' && 'مكتمل'}
                          {proposal.status === 'paid_out' && 'تم الدفع'}
                        </Badge>
                      </div>

                      {proposal.status === 'accepted' && (
                        <div className="flex gap-2">
                          {currentUserType === 'freelancer' && proposal.leaderId === currentUserId && (
                            <Button
                              size="sm"
                              onClick={() => completeProjectMutation.mutate(proposal.id)}
                              disabled={completeProjectMutation.isPending}
                              data-testid={`button-mark-complete-${proposal.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 ml-1" />
                              تحديد كمكتمل
                            </Button>
                          )}
                          {currentUserType === 'product_owner' && proposal.productOwnerId === currentUserId && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              data-testid={`status-in-progress-${proposal.id}`}
                            >
                              <Clock className="h-4 w-4 ml-1" />
                              قيد التنفيذ
                            </Button>
                          )}
                        </div>
                      )}

                      {proposal.status === 'completed' && (
                        <div className="flex gap-2">
                          {currentUserType === 'product_owner' && proposal.productOwnerId === currentUserId && (
                            <Button
                              size="sm"
                              onClick={() => confirmCompleteMutation.mutate(proposal.id)}
                              disabled={confirmCompleteMutation.isPending}
                              data-testid={`button-confirm-complete-${proposal.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 ml-1" />
                              تأكيد الإكمال و توزيع الأرباح
                            </Button>
                          )}
                          {currentUserType === 'freelancer' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              data-testid={`status-awaiting-confirmation-${proposal.id}`}
                            >
                              <Clock className="h-4 w-4 ml-1" />
                              في انتظار التأكيد
                            </Button>
                          )}
                        </div>
                      )}

                      {proposal.status === 'paid_out' && (
                        <div className="text-sm font-semibold text-green-600">
                          تم توزيع الأرباح بنجاح
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )} */}

                        <div ref={messagesEndRef} />
                    </>
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>جارٍ الكتابة...</span>
                    </div>
                )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="border-t p-6">
                <div className="flex gap-3">
                    <Input
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="اكتب رسالتك..."
                        className="flex-1"
                        disabled={!isConnected}
                        dir="rtl"
                        data-testid="input-message"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected}
                        data-testid="button-send"
                    >
                        <Send className="h-4 w-4 ml-2" />
                        إرسال
                    </Button>
                </div>
            </form>
        </Card>
    );
}
