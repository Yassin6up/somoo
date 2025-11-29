import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Loader2, User, FileText, Briefcase } from "lucide-react";
import { DirectMessageChat } from "@/components/DirectMessageChat";
import { ProjectProposalModal } from "@/components/ProjectProposalModal";
import { useLocation } from "wouter";

export default function FreelancerConversations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [, navigate] = useLocation();

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Fetch conversation history
  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ["direct-messages"],
    queryFn: async () => {
      console.log("Fetching conversations...");
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");
      const user = localStorage.getItem("user");
      console.log("Token exists:", !!token);
      console.log("UserType:", userType);
      console.log("User:", user);
      
      const response = await fetch("/api/direct-messages", {
        credentials: "include",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        console.error("Failed to fetch conversations:", response.status);
        const errorText = await response.text();
        console.error("Error text:", errorText);
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      console.log("Received conversations:", data);
      return data;
    },
    refetchInterval: 5000,
  });

  console.log("Conversations state:", { conversations, isLoading, error });

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true; // Show all when no search
    const otherUser = conv.otherUserType === "product_owner" ? conv.productOwner : conv.freelancer;
    const fullName = otherUser?.fullName || "";
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  console.log("Total conversations:", conversations.length);
  console.log("Filtered conversations:", filteredConversations.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4 p-4" dir="rtl">
      {/* Conversations List */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            المحادثات
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن محادثة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>لا توجد محادثات حالياً</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conv: any) => {
                const isProductOwner = conv.otherUserType === "product_owner";
                const otherUser = isProductOwner ? conv.productOwner : conv.freelancer;
                const unreadCount = conv.unreadCount || 0;

                return (
                  <div
                    key={conv.conversationKey}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                      selectedConversation?.conversationKey === conv.conversationKey
                        ? "bg-accent"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {otherUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate">
                            {otherUser?.fullName || "مستخدم"}
                          </span>
                          {isProductOwner && (
                            <Badge variant="secondary" className="text-xs">
                              صاحب عمل
                            </Badge>
                          )}
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {(() => {
                              const content = conv.lastMessage.content;
                              // Check if it's a proposal
                              if (content?.includes("[PROPOSAL]") && content?.includes("[/PROPOSAL]")) {
                                try {
                                  const match = content.match(/\[PROPOSAL\]([\s\S]*?)\[\/PROPOSAL\]/);
                                  if (match) {
                                    const proposalData = JSON.parse(match[1]);
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
      </Card>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header with User Info and Actions */}
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={
                          selectedConversation.otherUserType === "freelancer"
                            ? selectedConversation.freelancer?.profileImage
                            : selectedConversation.productOwner?.profileImage
                        } 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
                        {(selectedConversation.otherUserType === "product_owner"
                          ? selectedConversation.productOwner?.fullName
                          : selectedConversation.freelancer?.fullName)?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      selectedConversation.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedConversation.otherUserType === "product_owner"
                        ? selectedConversation.productOwner?.fullName || "صاحب عمل"
                        : selectedConversation.freelancer?.fullName || "مستقل"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selectedConversation.isOnline ? (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          متصل الآن
                        </span>
                      ) : (
                        <span>غير متصل</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Show for Product Owners */}
                {selectedConversation.otherUserType === "product_owner" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/freelancer-dashboard/projects`)}
                      className="gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      المشاريع المتاحة
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowProposalModal(true)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      إرسال عرض مشروع
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <DirectMessageChat
                roomId={[currentUser?.id, selectedConversation.otherUserId].sort().join("-")}
                receiverId={selectedConversation.otherUserId}
                receiverType={selectedConversation.otherUserType}
                receiverInfo={
                  selectedConversation.otherUserType === "product_owner"
                    ? selectedConversation.productOwner
                    : selectedConversation.freelancer
                }
              />
            </div>

            {/* Project Proposal Modal */}
            {showProposalModal && (
              <ProjectProposalModal
                isOpen={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                receiverId={selectedConversation.otherUserId}
                receiverType={selectedConversation.otherUserType}
                receiverName={
                  selectedConversation.otherUserType === "product_owner"
                    ? selectedConversation.productOwner?.fullName || "صاحب عمل"
                    : selectedConversation.freelancer?.fullName || "مستقل"
                }
                onSendMessage={(content: string) => {
                  // Get the DirectMessageChat component's send function
                  // We'll emit a socket event to send the message
                  const socket = (window as any).socket;
                  if (socket) {
                    fetch("/api/direct-messages", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({
                        receiverId: selectedConversation.otherUserId,
                        receiverType: selectedConversation.otherUserType,
                        content,
                      }),
                    }).catch(err => console.error("Failed to send proposal:", err));
                  }
                }}
              />
            )}
          </>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center p-6">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">اختر محادثة</h3>
              <p className="text-sm text-muted-foreground">
                اختر محادثة من القائمة لعرض الرسائل
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
