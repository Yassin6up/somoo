import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSocket, joinConversation, leaveConversation, sendConversationMessage, startTyping, stopTyping } from '@/lib/socket';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'wouter';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    fullName: string;
    profileImage?: string;
    type: string;
  };
}

interface ConversationChatProps {
  conversationId: string;
  currentUserId: string;
  currentUserType: 'product_owner' | 'freelancer';
  recipientName?: string;
  recipientImage?: string;
  groupName?: string;
}

export function ConversationChat({
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
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
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <Link href={currentUserType === 'product_owner' ? '/product-owner-dashboard/conversations' : '/freelancer-dashboard/conversations'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar>
          <AvatarImage src={recipientImage} />
          <AvatarFallback>{recipientName?.charAt(0) || '؟'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{recipientName}</h3>
          {groupName && <p className="text-sm text-muted-foreground">{groupName}</p>}
        </div>
        {!isConnected && (
          <div className="text-sm text-yellow-600">جارٍ الاتصال...</div>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
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
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4 ml-2" />
            إرسال
          </Button>
        </div>
      </form>
    </Card>
  );
}
