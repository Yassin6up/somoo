import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Users, ArrowRight, Crown, UserMinus, MessageCircle, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group, GroupMember, Project, Task, Freelancer } from "@shared/schema";

export default function GroupDetails() {
  const params = useParams();
  const groupId = params.id as string;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
  });

  // Fetch group members
  const { data: members = [], isLoading: membersLoading } = useQuery<(GroupMember & { freelancer: Freelancer })[]>({
    queryKey: ["/api/groups", groupId, "members"],
  });

  // Fetch group projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects/group", groupId],
  });

  // Fetch group tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/groups", groupId, "tasks"],
  });

  // Check if current user is the leader
  const isLeader = user && group && user.userId === group.leaderId;

  // Check if current user is product owner
  const userType = localStorage.getItem("userType");
  const isProductOwner = userType === "product_owner";

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/leave`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "تم المغادرة بنجاح",
        description: "تم مغادرة الجروب بنجاح",
      });
      navigate("/groups");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء مغادرة الجروب",
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (freelancerId: string) => {
      return await apiRequest(`/api/groups/${groupId}/members/${freelancerId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      toast({
        title: "تم الإزالة بنجاح",
        description: "تم إزالة العضو من الجروب",
      });
      setMemberToRemove(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إزالة العضو",
        variant: "destructive",
      });
      setMemberToRemove(null);
    },
  });

  // Start conversation mutation (for product owners)
  const startConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/conversations`, { groupId });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم فتح المحادثة",
        description: "جاري الانتقال إلى صفحة المحادثات...",
      });
      navigate("/product-owner-dashboard/conversations");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء فتح المحادثة",
        variant: "destructive",
      });
    },
  });

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">الجروب غير موجود</h3>
              <p className="text-muted-foreground text-center mb-4">
                لم يتم العثور على هذا الجروب
              </p>
              <Button onClick={() => navigate("/groups")}>
                العودة للجروبات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-6"
          data-testid="button-back-to-groups"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للجروبات
        </Button>

        {/* Group Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Group Image */}
          {group.groupImage && (
            <div className="w-full h-64 overflow-hidden bg-muted">
              <img
                src={group.groupImage}
                alt={group.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {group.name}
                  </CardTitle>
                  <Badge variant={group.status === "active" ? "default" : "secondary"}>
                    {group.status === "active" ? "نشط" : "غير نشط"}
                  </Badge>
                  {isLeader && (
                    <Badge variant="outline" className="gap-1">
                      <Crown className="h-3 w-3 text-yellow-600" />
                      أنت القائد
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  {group.description || "لا يوجد وصف"}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                {isProductOwner && (
                  <Button
                    onClick={() => startConversationMutation.mutate()}
                    disabled={startConversationMutation.isPending}
                    data-testid="button-start-conversation"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" />
                    ابدأ محادثة
                  </Button>
                )}
                {!isLeader && !isProductOwner && (
                  <Button
                    variant="destructive"
                    onClick={() => leaveGroupMutation.mutate()}
                    disabled={leaveGroupMutation.isPending}
                    data-testid="button-leave-group"
                  >
                    مغادرة الجروب
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأعضاء</p>
                  <p className="text-xl font-bold">
                    {group.currentMembers} / {group.maxMembers}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المشاريع</p>
                  <p className="text-xl font-bold">{projects.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                  <p className="text-xl font-bold">
                    {tasks.filter(t => t.status === "approved").length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المهام الجارية</p>
                  <p className="text-xl font-bold">
                    {tasks.filter(t => t.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" data-testid="tab-members">
              الأعضاء ({members.length})
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">
              المشاريع ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              المهام ({tasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            {membersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : members.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد أعضاء</h3>
                  <p className="text-muted-foreground">لا يوجد أعضاء في الجروب حالياً</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <Card key={member.id} data-testid={`card-member-${member.freelancerId}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.freelancer?.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{member.freelancer?.fullName || "مستخدم"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.freelancer?.username || "@user"}
                            </p>
                          </div>
                        </div>

                        {member.role === "leader" && (
                          <Crown className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الدور:</span>
                          <Badge variant={member.role === "leader" ? "default" : "secondary"}>
                            {member.role === "leader" ? "قائد" : "عضو"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">انضم في:</span>
                          <span>{new Date(member.joinedAt).toLocaleDateString("ar")}</span>
                        </div>
                      </div>

                      {isLeader && member.role !== "leader" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => setMemberToRemove(member.freelancerId)}
                          data-testid={`button-remove-member-${member.freelancerId}`}
                        >
                          <UserMinus className="ml-2 h-4 w-4" />
                          إزالة من الجروب
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
                  <p className="text-muted-foreground">لم يتم قبول أي مشاريع بعد</p>
                  {isLeader && (
                    <Button 
                      className="mt-4"
                      onClick={() => navigate("/projects")}
                    >
                      تصفح المشاريع المتاحة
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover-elevate cursor-pointer" data-testid={`card-project-${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge>
                          {project.status === "pending" ? "معلق" :
                           project.status === "accepted" ? "مقبول" :
                           project.status === "in_progress" ? "جاري" :
                           project.status === "completed" ? "مكتمل" : "ملغي"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الميزانية:</span>
                          <span className="font-semibold">{project.budget} ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">عدد المهام:</span>
                          <span>{project.tasksCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-6">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مهام</h3>
                  <p className="text-muted-foreground">لم يتم إنشاء أي مهام بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} data-testid={`card-task-${task.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge>
                          {task.status === "available" ? "متاحة" :
                           task.status === "assigned" ? "معينة" :
                           task.status === "in_progress" ? "جارية" :
                           task.status === "submitted" ? "مُسلّمة" :
                           task.status === "approved" ? "مُوافق عليها" : "مرفوضة"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          المكافأة: <span className="font-semibold text-foreground">{task.reward} ر.س</span>
                        </div>
                        {task.status === "available" && (
                          <Button size="sm">
                            تعيين المهمة
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إزالة العضو</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة هذا العضو من الجروب؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMemberMutation.mutate(memberToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-remove"
            >
              {removeMemberMutation.isPending ? "جاري الإزالة..." : "إزالة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
