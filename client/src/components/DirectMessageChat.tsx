import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MoreVertical, Flag, CheckCircle, XCircle, Clock, FileText, Briefcase, Plus, UserPlus, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getSocket } from "@/lib/socket";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import { ProjectProposalModal } from "./ProjectProposalModal";
import { GroupInviteModal } from "./GroupInviteModal";

interface DirectMessageChatProps {
    roomId: string;
    receiverId: string;
    receiverType: string;
    receiverInfo?: {
        fullName: string;
        profileImage?: string;
    };
}

export function DirectMessageChat({ roomId, receiverId, receiverType, receiverInfo }: DirectMessageChatProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [lastSeen, setLastSeen] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showGroupInviteModal, setShowGroupInviteModal] = useState(false);
    const [hasShownModal, setHasShownModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();
    const { toast } = useToast();

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)
        : null;
    const currentUserType = localStorage.getItem("userType");

    // Format last seen time
    const formatLastSeen = (lastSeenStr: string) => {
        const date = new Date(lastSeenStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "الآن";
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) {
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        if (diffDays === 1) return "أمس";
        if (diffDays < 7) return `منذ ${diffDays} أيام`;
        return date.toLocaleDateString('ar-EG');
    };

    // Fetch receiver online status
    const { data: statusData } = useQuery<{ userId: string; isOnline: boolean; lastSeen: Date | null }>({
        queryKey: [receiverType === "freelancer" ? "/api/freelancers" : "/api/product-owners", receiverId, "status"],
        queryFn: async () => {
            const endpoint = receiverType === "freelancer"
                ? `/api/freelancers/${receiverId}/status`
                : `/api/product-owners/${receiverId}/status`;

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) return null;
            return response.json();
        },
        enabled: !!receiverId,
        refetchInterval: 30000,
    });

    // Update online status when data changes
    useEffect(() => {
        if (statusData) {
            setIsOnline(statusData.isOnline);
            if (!statusData.isOnline && statusData.lastSeen) {
                setLastSeen(typeof statusData.lastSeen === 'string' ? statusData.lastSeen : new Date(statusData.lastSeen).toISOString());
            }
        }
    }, [statusData]);

    // Fetch initial messages
    const { data: initialMessages, isLoading } = useQuery({
        queryKey: [`/api/direct-messages/${receiverId}`],
        queryFn: async () => {
            const response = await fetch(
                `/api/direct-messages/${receiverId}?userType=${receiverType}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                return [];
            }

            return response.json();
        },
    });

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);

            // Mark messages as seen via Socket.IO
            if (socket && initialMessages.length > 0) {
                const hasUnreadMessages = initialMessages.some((msg: any) => 
                    msg.receiverId === currentUser?.id && !msg.isRead
                );
                
                if (hasUnreadMessages) {
                    socket.emit('direct:seen', {
                        senderId: receiverId,
                        senderType: receiverType,
                    });
                }
            }

            // Show service details modal if product owner and no messages yet
            if (currentUserType === "product_owner" && initialMessages.length === 0 && !hasShownModal) {
                setShowServiceModal(true);
                setHasShownModal(true);
            }
        }
    }, [initialMessages, currentUserType, hasShownModal, currentUser?.id, receiverId, receiverType, socket]);

    // Socket.IO listeners
    useEffect(() => {
        if (!socket || !roomId) return;

        // Join direct chat room
        socket.emit("join:direct", roomId);

        // Listen for new messages
        const handleNewMessage = (newMessage: any) => {
            setMessages((prev) => {
                const exists = prev.some(m =>
                    m.id === newMessage.id ||
                    (m.content === newMessage.content &&
                        m.senderId === newMessage.senderId &&
                        Math.abs(new Date(m.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000)
                );
                if (exists) return prev;
                return [...prev, newMessage];
            });
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        // Listen for user online/offline status
        const handleUserOnline = ({ userId }: { userId: string }) => {
            if (userId === receiverId) {
                setIsOnline(true);
            }
        };

        const handleUserOffline = ({ userId }: { userId: string }) => {
            if (userId === receiverId) {
                setIsOnline(false);
            }
        };

        const handleTyping = ({ userId }: { userId: string }) => {
            if (userId === receiverId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socket.on("direct:message", handleNewMessage);
        socket.on("user:online", handleUserOnline);
        socket.on("user:offline", handleUserOffline);
        socket.on("direct:typing", handleTyping);

        return () => {
            socket.off("direct:message", handleNewMessage);
            socket.off("user:online", handleUserOnline);
            socket.off("user:offline", handleUserOffline);
            socket.off("direct:typing", handleTyping);
            socket.emit("leave:direct", roomId);
        };
    }, [socket, roomId, receiverId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Report user mutation
    const reportUserMutation = useMutation({
        mutationFn: async () => {
            console.log(`Reporting user ${receiverId}`);
            return Promise.resolve({ success: true });
        },
        onSuccess: () => {
            toast({
                title: "تم",
                description: "تم تقرير المستخدم بنجاح",
            });
        },
        onError: (error: any) => {
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء تقرير المستخدم",
                variant: "destructive",
            });
        },
    });

    const handleSend = (content?: string) => {
        const messageToSend = content || message.trim();
        if (!messageToSend || isSending || !socket) return;
        
        setIsSending(true);
        socket.emit('direct:message', {
            receiverId,
            receiverType,
            content: messageToSend,
            roomId
        });
        
        if (!content) {
            setMessage("");
        }
        
        setTimeout(() => setIsSending(false), 500);
    };

    // Handle service details submission
    const handleServiceDetailsSubmit = (details: {
        serviceType: string;
        serviceName: string;
        description: string;
        budget: string;
        timeline: string;
        requirements: string;
    }) => {
        const servicesList = [
            { id: "google_play_review", name: "تقييم تطبيقك على Google Play" },
            { id: "ios_review", name: "تقييم تطبيقك على iOS" },
            { id: "website_review", name: "تقييم موقعك الإلكتروني" },
            { id: "ux_testing", name: "اختبار تجربة المستخدم لتطبيقك أو موقعك" },
            { id: "software_testing", name: "اختبار أنظمة السوفت وير" },
            { id: "social_media_engagement", name: "التفاعل مع منشورات السوشيال ميديا" },
            { id: "google_maps_review", name: "تقييمات خرائط جوجل ماب" },
        ];

        const selectedService = servicesList.find(s => s.id === details.serviceType);
        const serviceTypeName = selectedService?.name || details.serviceType;

        const formattedMessage = `
📋 **طلب خدمة جديد**

**نوع الخدمة:** ${serviceTypeName}
**الخدمة:** ${details.serviceName}
**الوصف:** ${details.description}
${details.budget ? `**الميزانية:** ${details.budget}` : ''}
${details.timeline ? `**المدة المطلوبة:** ${details.timeline}` : ''}
${details.requirements ? `**متطلبات إضافية:** ${details.requirements}` : ''}

---
أرجو منك مراجعة هذه التفاصيل وإعطائي عرض سعر مناسب. شكراً 🙏
    `.trim();

        handleSend(formattedMessage);
        setShowServiceModal(false);
    };

    const handleSkipModal = () => {
        setShowServiceModal(false);
    };

    // Construct full image URL if it's a relative path
    const getImageUrl = (imagePath: string | undefined | null) => {
        if (!imagePath) return undefined;
        if (imagePath.startsWith('http')) return imagePath;
        return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-200">
                            {receiverInfo?.profileImage && (
                                <AvatarImage
                                    src={getImageUrl(receiverInfo.profileImage)}
                                    alt={receiverInfo.fullName}
                                    className="object-cover"
                                />
                            )}
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                                {receiverInfo?.fullName?.substring(0, 2).toUpperCase() || "UN"}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online status indicator dot */}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>
                    <div>
                        <h2 className="text-gray-900 font-semibold">
                            {receiverInfo?.fullName || "مستخدم"}
                        </h2>
                        <p className={`text-sm ${isOnline ? "text-green-600" : "text-gray-500"}`}>
                            {isOnline ? "متصل الآن" : lastSeen ? `آخر ظهور ${formatLastSeen(lastSeen)}` : "غير متصل"}
                        </p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => reportUserMutation.mutate()}
                            disabled={reportUserMutation.isPending}
                            className="text-red-600"
                        >
                            <Flag className="h-4 w-4 ml-2" />
                            تقرير هذا المستخدم
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <Send className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-semibold">لا توجد رسائل بعد</p>
                        <p className="text-gray-400 text-sm mt-2">ابدأ المحادثة بإرسال رسالة</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isSender = msg.senderId === currentUser?.id;
                        const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;

                        let contentString = typeof msg.content === 'string' ? msg.content : (msg.content as any)?.content || '';

                        // Check if this is a proposal message
                        const isProposal = contentString?.includes("[PROPOSAL]") && contentString?.includes("[/PROPOSAL]");
                        let proposalData = null;

                        // Check if this is a group invitation message
                        const isGroupInvite = contentString?.includes("[GROUP_INVITE]") && contentString?.includes("[/GROUP_INVITE]");
                        let groupInviteData = null;

                        if (isProposal) {
                            try {
                                const match = contentString.match(/\[PROPOSAL\]([\s\S]*?)\[\/PROPOSAL\]/);
                                if (match) {
                                    let jsonString = match[1].trim();
                                    if (jsonString.includes('\\"')) {
                                        jsonString = jsonString.replace(/\\\"/g, '"');
                                    }
                                    proposalData = JSON.parse(jsonString);
                                }
                            } catch (e) {
                                console.error("Failed to parse proposal:", e);
                            }
                        }

                        if (isGroupInvite) {
                            try {
                                const match = contentString.match(/\[GROUP_INVITE\]([\s\S]*?)\[\/GROUP_INVITE\]/);
                                if (match) {
                                    let jsonString = match[1].trim();
                                    if (jsonString.includes('\\"')) {
                                        jsonString = jsonString.replace(/\\\"/g, '"');
                                    }
                                    if (!jsonString.includes('"') && /\{[^}]*\}/.test(jsonString)) {
                                        jsonString = jsonString
                                            .replace(/'(\s*\w+\s*)':/g, '"$1":')
                                            .replace(/: '([^']*)'/g, ': "$1"');
                                    }
                                    groupInviteData = JSON.parse(jsonString);
                                }
                            } catch (e) {
                                console.error("Failed to parse group invite:", e);
                            }
                        }

                        if ((isProposal && !proposalData) || (isGroupInvite && !groupInviteData)) {
                            return null;
                        }

                        return (
                            <div
                                key={msg.id || index}
                                className={`flex gap-3 items-end ${isSender ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Avatar */}
                                {showAvatar ? (
                                    <Avatar className="h-8 w-8 border border-gray-200">
                                        {isSender && currentUser?.profileImage && (
                                            <AvatarImage src={getImageUrl(currentUser.profileImage)} className="object-cover" />
                                        )}
                                        {!isSender && receiverInfo?.profileImage && (
                                            <AvatarImage src={getImageUrl(receiverInfo.profileImage)} className="object-cover" />
                                        )}
                                        <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                            {isSender
                                                ? currentUser?.fullName?.substring(0, 2).toUpperCase() || "أن"
                                                : receiverInfo?.fullName?.substring(0, 2).toUpperCase() || "UN"}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="w-8" />
                                )}

                                {/* Message Bubble or Proposal Card */}
                                <div
                                    className={`flex flex-col ${isProposal ? "max-w-[85%]" : "max-w-[70%]"
                                        } ${isSender ? "items-end" : "items-start"}`}
                                >
                                    {showAvatar && (
                                        <span className={`text-xs font-medium mb-1 px-1 ${isSender ? "text-blue-600" : "text-gray-700"
                                            }`}>
                                            {isSender ? "أنت" : receiverInfo?.fullName || "مستخدم"}
                                        </span>
                                    )}

                                    {isProposal && proposalData ? (
                                        // Proposal Card
                                        <Card className="w-full p-4 border border-gray-200 bg-white">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {proposalData.title}
                                                        </h4>
                                                        <Badge
                                                            variant={
                                                                proposalData.status === "approved" ? "default" :
                                                                    proposalData.status === "rejected" ? "destructive" :
                                                                        "secondary"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {proposalData.status === "approved" ? "✓ تمت الموافقة" :
                                                                proposalData.status === "rejected" ? "✗ مرفوض" :
                                                                    "⏳ قيد المراجعة"}
                                                        </Badge>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                            {proposalData.description}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <p className="text-xs text-gray-600 mb-1">⏱️ مدة التسليم</p>
                                                            <p className="font-semibold text-gray-900">{proposalData.deliveryTime}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <p className="text-xs text-gray-600 mb-1">💰 الميزانية</p>
                                                            <p className="font-semibold text-green-700">{proposalData.budget} ر.س</p>
                                                        </div>
                                                    </div>

                                                    {proposalData.skills && (
                                                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                                                            <p className="text-xs text-gray-600 mb-2">🎯 المهارات المطلوبة</p>
                                                            <p className="text-sm text-gray-800">{proposalData.skills}</p>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons for Receiver (Product Owner) */}
                                                    {!isSender && proposalData.status !== "accepted" && proposalData.status !== "approved" && (
                                                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                                                                onClick={() => {
                                                                    const confirmed = window.confirm(
                                                                        `هل أنت متأكد من قبول هذا العرض؟\n\n` +
                                                                        `📋 المشروع: ${proposalData.title}\n` +
                                                                        `💰 الميزانية: ${proposalData.budget} ر.س\n` +
                                                                        `⏱️ المدة: ${proposalData.deliveryTime}`
                                                                    );

                                                                    if (!confirmed) return;

                                                                    fetch('/api/proposals/accept', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                        },
                                                                        body: JSON.stringify({
                                                                            conversationId: roomId,
                                                                            leaderId: msg.senderId,
                                                                            title: proposalData.title,
                                                                            description: proposalData.description,
                                                                            budget: proposalData.budget,
                                                                            deliveryTime: proposalData.deliveryTime,
                                                                            skills: proposalData.skills,
                                                                            serviceType: proposalData.serviceType,
                                                                        }),
                                                                    })
                                                                        .then(async (res) => {
                                                                            const data = await res.json();
                                                                            if (!res.ok) {
                                                                                throw new Error(data.error || 'فشل في قبول العرض');
                                                                            }

                                                                            alert('تم قبول العرض بنجاح');
                                                                            queryClient.invalidateQueries({ queryKey: [`/api/direct-messages/${receiverId}`] });
                                                                        })
                                                                        .catch((error) => {
                                                                            alert(`حدث خطأ في قبول العرض: ${error.message}`);
                                                                        });
                                                                }}
                                                            >
                                                                <CheckCircle className="h-4 w-4 ml-2" />
                                                                قبول العرض
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                onClick={() => {
                                                                    const confirmed = window.confirm(
                                                                        `هل أنت متأكد من رفض هذا العرض؟\n\n` +
                                                                        `📋 المشروع: ${proposalData.title}\n` +
                                                                        `💰 الميزانية: ${proposalData.budget} ر.س`
                                                                    );

                                                                    if (!confirmed) return;

                                                                    fetch('/api/proposals/reject', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                        },
                                                                        body: JSON.stringify({
                                                                            conversationId: roomId,
                                                                            leaderId: msg.senderId,
                                                                        }),
                                                                    })
                                                                        .then(async (res) => {
                                                                            const data = await res.json();
                                                                            if (!res.ok) {
                                                                                throw new Error(data.error || 'فشل في رفض العرض');
                                                                            }

                                                                            alert('تم رفض العرض');
                                                                            queryClient.invalidateQueries({ queryKey: [`/api/direct-messages/${receiverId}`] });
                                                                        })
                                                                        .catch((error) => {
                                                                            alert(`حدث خطأ في رفض العرض: ${error.message}`);
                                                                        });
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4 ml-2" />
                                                                رفض العرض
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ) : isGroupInvite && groupInviteData ? (
                                        // Group Invitation Card
                                        <Card className="w-full border border-gray-200 bg-white">
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Users className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            دعوة للانضمام كمراقب
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {isSender ? "لقد" : receiverInfo?.fullName} أرسل دعوة للانضمام إلى مجموعة
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <p className="text-sm font-medium text-gray-600 mb-1">📌 اسم المجموعة</p>
                                                        <p className="font-semibold text-gray-900">{groupInviteData.groupName}</p>
                                                    </div>

                                                    {/* Action Buttons for Receiver (Product Owner) */}
                                                    {!isSender && (
                                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                onClick={() => {
                                                                    window.location.href = `/groups/${groupInviteData.groupId}/community`;
                                                                }}
                                                            >
                                                                <Users className="h-4 w-4 ml-2" />
                                                                عرض المجموعة
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
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
                                                                        if (!res.ok) {
                                                                            throw new Error(data.error || 'تعذر الانضمام كمراقب');
                                                                        }
                                                                        window.location.href = `/groups/${groupInviteData.groupId}/community`;
                                                                    } catch (e: any) {
                                                                        alert(e.message || 'حدث خطأ أثناء الانضمام كمراقب');
                                                                    }
                                                                }}
                                                            >
                                                                انضم كمراقب
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ) : (
                                        // Regular Message Bubble
                                        <div
                                            className={`rounded-lg px-4 py-2 ${isSender
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-white border border-gray-200 text-gray-800"
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{contentString}</p>
                                        </div>
                                    )}

                                    <span className={`text-xs mt-1 px-1 ${isSender ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                        {new Date(msg.createdAt).toLocaleTimeString("ar-EG", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 py-3">
                {/* Typing/Seen Indicator */}
                {isOnline && (
                    <div className="text-xs text-gray-500 mb-2 px-1 h-4">
                        {isTyping ? (
                            <span className="flex items-center gap-1">
                                <span className="animate-pulse">●</span>
                                <span>يكتب الآن...</span>
                            </span>
                        ) : messages.length > 0 && messages[messages.length - 1]?.senderId === currentUser?.id ? (
                            <span className="text-blue-600">✓✓ تم الاستلام</span>
                        ) : null}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {/* Actions Menu - Show only for freelancers chatting with product owners */}
                    {currentUserType === "freelancer" && receiverType === "product_owner" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top">
                                <DropdownMenuItem
                                    onClick={() => setShowProposalModal(true)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Briefcase className="h-4 w-4 text-gray-600" />
                                    <span>إرسال مقترح مشروع</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowGroupInviteModal(true)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <UserPlus className="h-4 w-4 text-gray-600" />
                                    <span>إرسال طلب انضمام كمراقب</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Input
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            // Emit typing event
                            if (socket && e.target.value.length > 0) {
                                socket.emit('direct:typing', { roomId, userId: currentUser?.id });
                            }
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 rounded-lg border-gray-300 focus:border-gray-400"
                        disabled={isSending}
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={!message.trim() || isSending}
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                        size="sm"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Service Details Modal */}
            <ServiceDetailsModal
                open={showServiceModal}
                onSubmit={handleServiceDetailsSubmit}
                onSkip={handleSkipModal}
            />

            {/* Project Proposal Modal */}
            <ProjectProposalModal
                isOpen={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                receiverId={receiverId}
                receiverType={receiverType}
                receiverName={receiverInfo?.fullName || "صاحب عمل"}
                onSendMessage={(content: string) => {
                    handleSend(content);
                }}
            />

            {/* Group Invite Modal */}
            <GroupInviteModal
                isOpen={showGroupInviteModal}
                onClose={() => setShowGroupInviteModal(false)}
                onSelectGroup={(groupId: string, groupName: string) => {
                    const inviteData = {
                        groupId,
                        groupName,
                        invitedBy: currentUser?.fullName,
                        timestamp: new Date().toISOString(),
                    };

                    const inviteMessage = `[GROUP_INVITE]${JSON.stringify(inviteData)}[/GROUP_INVITE]`;
                    handleSend(inviteMessage);

                    toast({
                        title: "تم إرسال الدعوة",
                        description: `تم إرسال دعوة للانضمام إلى ${groupName}`,
                    });
                }}
            />
        </div>
    );
}