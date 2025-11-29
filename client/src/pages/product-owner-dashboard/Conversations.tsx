import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from "lucide-react";
import type { Conversation } from "@shared/schema";
import ConversationChat from "@/components/ConversationChat";
import { DirectMessageChat } from "@/components/DirectMessageChat";

type ConversationWithDetails = Conversation & {
  group?: {
    id: string;
    name: string;
    leaderId: string;
  };
  leader?: {
    id: string;
    fullName: string;
  };
  productOwner?: {
    id: string;
    fullName: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
  };
};

export default function Conversations() {
  const [location] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Get current user from localStorage
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Extract conversationId from query params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const conversationId = params.get('conversationId');
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [location]);

  // Fetch all conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
  });

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">المحادثات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              قائمة المحادثات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  لا توجد محادثات حالياً
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => {
                    // Determine conversation type and display info
                    const isDirect = conv.type === 'direct_message';
                    const displayName = isDirect 
                      ? conv.otherUser?.fullName || "مستخدم"
                      : conv.group?.name || "جروب غير معروف";
                    const subtitle = isDirect
                      ? (conv.otherUserType === 'freelancer' ? 'فريلانسر' : 'صاحب عمل')
                      : conv.leader?.fullName || "قائد غير معروف";
                    
                    // Show indicator if this group conversation also has direct messages
                    const hasDirectChats = !isDirect && conv.hasDirectMessages;
                    
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover-elevate active-elevate-2 ${
                          selectedConversation === conv.id
                            ? "bg-accent"
                            : ""
                        }`}
                        data-testid={`conversation-item-${conv.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {displayName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold truncate">
                                {displayName}
                              </div>
                              {hasDirectChats && (
                                <Badge variant="secondary" className="text-xs">
                                  {conv.directMessageCount} رسالة مباشرة
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {subtitle}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {(() => {
                                  const content = typeof conv.lastMessage.content === 'string' 
                                    ? conv.lastMessage.content 
                                    : conv.lastMessage.content?.content || '';
                                  // Check if it's a proposal
                                  if (content?.includes("[PROPOSAL]") && content?.includes("[/PROPOSAL]")) {
                                    try {
                                      const match = content.match(/\[PROPOSAL\](.*?)\[\/PROPOSAL\]/s);
                                      if (match) {
                                        let jsonString = match[1].trim();
                                        if (jsonString.includes('\\"')) {
                                          jsonString = jsonString.replace(/\\"/g, '"');
                                        }
                                        const proposalData = JSON.parse(jsonString);
                                        return `💼 عرض مشروع: ${proposalData.title}`;
                                      }
                                    } catch (e) {
                                      return "💼 عرض مشروع";
                                    }
                                  }
                                  return content;
                                })()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation && selectedConvData ? (
            selectedConvData.type === 'direct_message' ? (
              <DirectMessageChat
                roomId={`${currentUser?.id}-${selectedConvData.otherUserId}`}
                receiverId={selectedConvData.otherUserId}
                receiverType={selectedConvData.otherUserType}
                receiverInfo={{
                  fullName: selectedConvData.otherUser?.fullName || "مستخدم",
                  profileImage: selectedConvData.otherUser?.profileImage
                }}
              />
            ) : (
              <ConversationChat
                conversationId={selectedConversation}
                currentUserId={currentUser?.id || ''}
                currentUserType="product_owner"
                recipientId={selectedConvData.leader?.id || ''}
                recipientName={selectedConvData.leader?.fullName || "قائد غير معروف"}
                groupName={selectedConvData.group?.name}
                leaderId={selectedConvData.leader?.id}
              />
            )
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>اختر محادثة لعرضها</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
