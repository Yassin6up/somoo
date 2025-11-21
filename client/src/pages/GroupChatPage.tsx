import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GroupChat } from "@/components/GroupChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "wouter";

interface Group {
  id: string;
  name: string;
  groupImage?: string;
}

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = id!;

  // Get current user from localStorage
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Get group details
  const { data: group, isLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">المجموعة غير موجودة</p>
            <Link href="/groups">
              <Button className="mt-4">العودة للمجموعات</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/groups/${groupId}/community`}>
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                محادثة المجموعة
              </h1>
              <p className="text-muted-foreground mt-1">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <GroupChat groupId={groupId} currentUserId={currentUser?.id || ''} />
      </div>
    </div>
  );
}
