import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSocket, joinGroupChat, leaveGroupChat, sendGroupMessage, startTyping, stopTyping } from '@/lib/socket';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: Date;
  sender?: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
}

interface GroupChatProps {
  groupId: string;
  currentUserId: string;
}

export function GroupChat({ groupId, currentUserId }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery<Message[]>({
    queryKey: [`/api/groups/${groupId}/messages`],
  });

  // Initialize socket and join group chat
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setIsConnected(socket.connected);

    // Join group chat room
    joinGroupChat(groupId);

    // Handle connection events
    const handleConnect = () => {
      setIsConnected(true);
      joinGroupChat(groupId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Handle incoming messages
    const handleGroupMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle typing indicators
    const handleTypingStart = ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
    socket.on('group:message', handleGroupMessage);
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
      socket.off('group:message', handleGroupMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('error', handleError);
      leaveGroupChat(groupId);
    };
  }, [groupId, currentUserId, initialMessages, toast]);

  // Handle sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    sendGroupMessage(groupId, newMessage.trim());
    setNewMessage('');
    stopTyping('group', groupId);
  };

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!typingTimeoutRef.current) {
      startTyping('group', groupId);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping('group', groupId);
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
    <Card className="flex flex-col h-[600px]">
      {/* Connection status */}
      {!isConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center">
          جارٍ الاتصال بالخادم...
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-lg font-medium">لا توجد رسائل بعد</p>
            <p className="text-sm">كن أول من يبدأ المحادثة!</p>
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
                  <Avatar className="h-8 w-8">
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
                      className={`rounded-2xl px-4 py-2 ${
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
        {typingUsers.size > 0 && (
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
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
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
            size="icon"
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
