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

  // Get current user
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  const userType = localStorage.getItem("userType");

  // Determine the other user's type - assume freelancer by default
  const otherUserType = "freelancer";

  // Fetch receiver info
  const { data: receiverInfo } = useQuery({
    queryKey: [`/api/freelancers/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/freelancers/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      return response.json();
    },
    enabled: !!userId,
  });

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

  if (!conversationId) {
    return null;
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
