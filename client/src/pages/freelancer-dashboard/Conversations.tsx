import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Loader2 } from "lucide-react";
import { DirectMessageChat } from "@/components/DirectMessageChat";

export default function FreelancerConversations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Fetch conversation history
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/direct-messages"],
    queryFn: async () => {
      const response = await fetch("/api/direct-messages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    },
  });

  // Fetch user details for each conversation
  const { data: conversationsWithDetails } = useQuery({
    queryKey: ["/api/direct-messages", "with-details", conversations],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return [];

      const details = await Promise.all(
        conversations.map(async (conv: any) => {
          const response = await fetch(`/api/freelancers/${conv.otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) return conv;

          const userDetails = await response.json();
          return {
            ...conv,
            userDetails,
          };
        })
      );

      return details;
    },
    enabled: !!conversations && conversations.length > 0,
  });

  const filteredConversations = conversationsWithDetails?.filter((conv: any) =>
    conv.userDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          المحادثات
        </h1>
        <p className="text-gray-600 mt-2">تواصل مع أعضاء المجموعات</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Conversations List */}
        <Card className="w-96 flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="ابحث عن محادثة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!conversationsWithDetails || conversationsWithDetails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold">لا توجد محادثات</p>
                <p className="text-gray-400 text-sm mt-2">
                  ابدأ محادثة جديدة من صفحة المجموعات
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations?.map((conv: any) => (
                  <div
                    key={conv.otherUserId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${
                      selectedConversation?.otherUserId === conv.otherUserId
                        ? "bg-blue-50 border-r-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={conv.userDetails?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {conv.userDetails?.fullName?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.userDetails?.fullName || "مستخدم"}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(conv.lastMessageAt).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {selectedConversation ? (
            <DirectMessageChat
              roomId={[currentUser?.id, selectedConversation.otherUserId].sort().join('-')}
              receiverId={selectedConversation.otherUserId}
              receiverType={selectedConversation.otherUserType}
              receiverInfo={selectedConversation.userDetails}
            />
          ) : (
            <Card className="h-full flex items-center justify-center shadow-xl">
              <div className="text-center p-6">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-8 mb-4 inline-block">
                  <MessageSquare className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  اختر محادثة للبدء
                </h3>
                <p className="text-gray-600">
                  اختر محادثة من القائمة لعرض الرسائل
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
