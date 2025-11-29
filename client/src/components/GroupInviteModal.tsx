import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Crown, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup: (groupId: string, groupName: string) => void;
}

interface Group {
  id: string;
  name: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  privacy: string;
  status: string;
  role?: 'leader' | 'member';
}

export function GroupInviteModal({ isOpen, onClose, onSelectGroup }: GroupInviteModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Get user ID - handle both 'id' and 'userId' properties
  const userId = currentUser?.id || currentUser?.userId;

  // Fetch freelancer's groups where they are leader
  const { data: groups, isLoading, error } = useQuery<Group[]>({
    queryKey: [`/api/groups/my/leader`],
    queryFn: async () => {
      console.log("Fetching leader groups");
      console.log("Current user object:", currentUser);
      
      const response = await fetch(`/api/groups/my/leader`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "فشل في جلب المجموعات" }));
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "فشل في جلب المجموعات");
      }

      const data = await response.json();
      console.log("Groups fetched:", data);
      return data;
    },
    enabled: isOpen && !!userId,
  });

  // Log error if any
  if (error) {
    console.error("Query error:", error);
  }

  const handleSendInvite = () => {
    if (!selectedGroupId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار مجموعة",
        variant: "destructive",
      });
      return;
    }

    const selectedGroup = groups?.find(g => g.id === selectedGroupId);
    if (selectedGroup) {
      onSelectGroup(selectedGroupId, selectedGroup.name);
      onClose();
      setSelectedGroupId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">دعوة للانضمام كمراقب</DialogTitle>
          <DialogDescription>
            اختر مجموعة لإرسال دعوة انضمام إلى صاحب المنتج كمراقب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!userId ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">لم يتم العثور على معلومات المستخدم</p>
              <p className="text-sm text-muted-foreground mt-2">
                الرجاء تسجيل الدخول مرة أخرى
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mr-3 text-muted-foreground">جارٍ تحميل المجموعات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">حدث خطأ في تحميل المجموعات</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message || "حاول مرة أخرى"}
              </p>
            </div>
          ) : !groups || groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد مجموعات متاحة</p>
              <p className="text-sm text-muted-foreground mt-2">
                انضم إلى مجموعة أو أنشئ مجموعة جديدة أولاً
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                معرف المستخدم: {userId}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedGroupId === group.id
                      ? "border-2 border-primary bg-primary/5"
                      : "border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        {group.role === 'leader' && (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            قائد
                          </Badge>
                        )}
                        {group.privacy === 'private' && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            خاص
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {group.currentMembers} / {group.maxMembers} عضو
                          </span>
                        </div>
                        
                        <Badge
                          variant={group.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {group.status === "active" ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroupId(group.id);
                          onSelectGroup(group.id, group.name);
                          onClose();
                          setSelectedGroupId(null);
                        }}
                      >
                        إرسال هذه المجموعة
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={!selectedGroupId || isLoading}
            className="flex-1"
          >
            إرسال الدعوة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
