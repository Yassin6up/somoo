import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DirectMessageChat } from "@/components/DirectMessageChat";

export default function DirectChat() {
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const [conversationId, setConversationId] = useState<string | null>(null);

  console.log("DirectChat - userId from params:", userId);

  // Get current user
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  const userType = localStorage.getItem("userType");

  console.log("DirectChat - currentUser:", currentUser);
  console.log("DirectChat - userType:", userType);

  // Determine the other user's type - assume freelancer by default
  const otherUserType = "freelancer";

  // Fetch receiver info
  const { data: receiverInfo, isLoading: loadingReceiver, error: receiverError } = useQuery({
    queryKey: [`/api/freelancers/${userId}`],
    queryFn: async () => {
      console.log("Fetching freelancer info for userId:", userId);
      const response = await fetch(`/api/freelancers/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch receiver info - Status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return null;
      }
      
      const data = await response.json();
      console.log("✅ Successfully fetched receiver info:", data);
      return data;
    },
    enabled: !!userId,
  });

  console.log("DirectChat - receiverInfo state:", receiverInfo);
  console.log("DirectChat - loadingReceiver:", loadingReceiver);
  console.log("DirectChat - receiverError:", receiverError);

  // Set a room ID for socket communication
  useEffect(() => {
    if (userId) {
      // Create a unique room ID by sorting user IDs
      const roomId = [currentUser?.id, userId].sort().join('-');
      setConversationId(roomId);
    }
  }, [userId, currentUser?.id]);

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // If userId is invalid or receiver not found, show error
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600 font-bold text-xl mb-2">خطأ</p>
          <p className="text-gray-600">معرف المستخدم غير صحيح</p>
          <button 
            onClick={() => navigate("/groups")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة للمجموعات
          </button>
        </div>
      </div>
    );
  }

  if (!conversationId || loadingReceiver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If receiver info failed to load after loading is done
  if (!loadingReceiver && !receiverInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-red-600 font-bold text-xl mb-2">خطأ</p>
          <p className="text-gray-600 mb-4">لم يتم العثور على المستخدم</p>
          <p className="text-sm text-gray-500 mb-4">معرف المستخدم: {userId}</p>
          <button 
            onClick={() => navigate("/groups")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة للمجموعات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/freelancers")}
            className="rounded-full hover:bg-white/50"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Component - Full Height */}
        <div className="flex-1 overflow-hidden">
          <DirectMessageChat 
            roomId={conversationId} 
            receiverId={userId!}
            receiverType={otherUserType}
            receiverInfo={receiverInfo}
          />
        </div>
      </div>
    </div>
  );
}
