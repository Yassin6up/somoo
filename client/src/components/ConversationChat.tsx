import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
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
  recipientName?: string;
  recipientImage?: string;
  groupName?: string;
}

export default function ConversationChat({
  conversationId,
  currentUserId,
  currentUserType,
  recipientName,
  recipientImage,
  groupName,
}: ConversationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

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

  // Fetch proposals for this conversation
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: [`/api/proposals/conversation/${conversationId}`],
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

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('conversation:message', handleConversationMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('error', handleError);

    // Load initial messages
    if (initialMessages) {
      setMessages(initialMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('conversation:message', handleConversationMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('error', handleError);
      leaveConversation(conversationId);
    };
  }, [conversationId, currentUserId, initialMessages, toast]);

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
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
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
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  data-testid={`message-${message.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={message.sender?.profileImage} />
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
                      className={`rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Display Proposals */}
            {proposals.length > 0 && (
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

                      {/* Action buttons based on status and user type */}
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
            )}

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
