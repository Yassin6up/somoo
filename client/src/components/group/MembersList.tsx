import { useLocation } from "wouter";
import { Users, MessageSquare, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GroupMember {
  id: string;
  groupId: string;
  freelancerId: string;
  joinedAt: Date;
  role: 'member' | 'admin' | 'moderator';
}

interface MembersListProps {
  members: GroupMember[];
  getMemberInfo: (id: string) => any;
  isOnline: (lastSeen: Date | null) => boolean;
  checkIsLeader: (id: string) => boolean;
}

export function MembersList({ members, getMemberInfo, isOnline, checkIsLeader }: MembersListProps) {
  const [, navigate] = useLocation();
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Get first 8 members
  const displayedMembers = members.slice(0, 8);

  return (
    <Card className="border border-gray-200 rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">أعضاء المجموعة</h3>
          </div>
          <Badge className="bg-gray-100 text-gray-800 px-2 py-1">
            {members.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {displayedMembers.map((member) => {
            const info = getMemberInfo(member.freelancerId);
            if (!info) return null;

            const online = isOnline(info.lastSeen);

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar className="w-9 h-9 border border-gray-200">
                      <AvatarImage src={info.profileImage} />
                      <AvatarFallback className="text-xs bg-gray-100">
                        {info.fullName?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{info.fullName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {checkIsLeader(member.freelancerId) ? (
                        <>
                          <Star className="w-3 h-3 text-yellow-500" />
                          قائد المجموعة
                        </>
                      ) : (
                        info.jobTitle || 'عضو'
                      )}
                    </p>
                  </div>
                </div>
                {currentUser?.id !== member.freelancerId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/chat/${member.freelancerId}`)}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {members.length > 8 && (
          <Button variant="ghost" className="w-full mt-3 text-gray-600 hover:text-gray-900 text-sm font-medium">
            عرض كل الأعضاء ({members.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
