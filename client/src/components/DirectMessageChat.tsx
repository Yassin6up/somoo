import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Phone, Video, MoreVertical } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { getSocket } from "@/lib/socket";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const currentUserType = localStorage.getItem("userType");

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
    }
  }, [initialMessages]);

  // Socket.IO listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join direct chat room
    socket.emit("join:direct", roomId);

    // Listen for new messages
    const handleNewMessage = (newMessage: any) => {
      // Prevent duplicate messages by checking if message already exists
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

    socket.on("direct:message", handleNewMessage);

    return () => {
      socket.off("direct:message", handleNewMessage);
      socket.emit("leave:direct", roomId);
    };
  }, [socket, roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          receiverId,
          receiverType,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Don't emit socket, the server will broadcast it
      setMessage("");
      // Invalidate query to refresh
      queryClient.invalidateQueries({ queryKey: [`/api/direct-messages/${receiverId}`] });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
            <AvatarImage src={receiverInfo?.profileImage} />
            <AvatarFallback className="bg-white text-blue-600 font-bold">
              {receiverInfo?.fullName?.substring(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white font-bold text-lg">
              {receiverInfo?.fullName || "مستخدم"}
            </h2>
            <p className="text-blue-100 text-sm">متصل الآن</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Send className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-semibold">لا توجد رسائل بعد</p>
            <p className="text-gray-400 text-sm mt-2">ابدأ المحادثة بإرسال رسالة</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSender = msg.senderId === currentUser?.id;
            const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
            
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 items-end ${isSender ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-md">
                    <AvatarImage src={isSender ? currentUser?.profileImage : receiverInfo?.profileImage} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {isSender 
                        ? currentUser?.fullName?.substring(0, 2) 
                        : receiverInfo?.fullName?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10" />
                )}
                
                {/* Message Bubble */}
                <div
                  className={`flex flex-col max-w-[70%] ${
                    isSender ? "items-end" : "items-start"
                  }`}
                >
                  {showAvatar && (
                    <span className={`text-xs font-semibold mb-1 px-1 ${
                      isSender ? "text-blue-600" : "text-gray-700"
                    }`}>
                      {isSender ? "أنت" : receiverInfo?.fullName || "مستخدم"}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${
                      isSender
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className={`text-xs mt-1 px-1 ${
                    isSender ? "text-gray-400" : "text-gray-500"
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
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 rounded-full border-2 border-gray-200 focus:border-blue-500 px-6 py-3 text-sm"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="rounded-full h-12 w-12 p-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
