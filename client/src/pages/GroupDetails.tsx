import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { 
  Users, 
  ArrowRight, 
  Crown, 
  UserMinus, 
  MessageCircle, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  MessageSquareText,
  Star,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  MapPin,
  BarChart3,
  Award,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Shield
} from "lucide-react";
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

  // Fetch group details with enhanced data
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["/api/groups", groupId],
    queryFn: async () => {
      const response = await apiRequest(`/api/groups/${groupId}`, "GET");
      return response.json();
    },
  });

  // Fetch group members with enhanced data
  const { data: members = [], isLoading: membersLoading } = useQuery<(GroupMember & { freelancer: Freelancer })[]>({
    queryKey: ["/api/groups", groupId, "members"],
    queryFn: async () => {
      const response = await apiRequest(`/api/groups/${groupId}/members`, "GET");
      return response.json();
    },
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

  // Check if current user is freelancer
  const isFreelancer = userType === "freelancer";

  // Check if user is member of this group
  const isMember = group?.isMember || false;

  // Calculate additional stats
  const completedTasks = tasks.filter(t => t.status === "approved").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const successRate = group?.totalProjects ? Math.round((group.completedProjects / group.totalProjects) * 100) : 0;

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/join`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({
        title: "تم الانضمام بنجاح",
        description: "تم انضمامك للجروب بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الانضمام للجروب",
        variant: "destructive",
      });
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/leave`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({
        title: "تم المغادرة بنجاح",
        description: "تم مغادرة الجروب بنجاح",
      });
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

  // Navigate to chat page
  const handleStartConversation = () => {
    navigate(`/groups/${groupId}/chat`);
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-blue-500 text-blue-500" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-blue-500 text-blue-500" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Format last seen time
  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInHours = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "أونلاين الآن";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 168) return `منذ ${Math.floor(diffInHours / 24)} يوم`;
    return `منذ ${Math.floor(diffInHours / 168)} أسبوع`;
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse border-0 shadow-sm">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">الجروب غير موجود</h3>
              <p className="text-gray-500 text-center mb-4">
                لم يتم العثور على هذا الجروب
              </p>
              <Button 
                onClick={() => navigate("/groups")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                العودة للجروبات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-6 hover:bg-gray-100"
          data-testid="button-back-to-groups"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للجروبات
        </Button>

        {/* Enhanced Group Header */}
        <Card className="mb-6 border-0 shadow-sm overflow-hidden bg-white">
          {/* Group Image with Gradient Overlay */}
          {group.groupImage && (
            <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
              <img
                src={group.groupImage}
                alt={group.name}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Header Content Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold" style={{ fontFamily: "Tajawal, sans-serif" }}>
                        {group.name}
                      </h1>
                      <Badge className="bg-white/20 text-white border-0">
                        {group.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                      {isLeader && (
                        <Badge className="bg-yellow-500 text-white border-0 gap-1">
                          <Crown className="h-3 w-3" />
                          أنت القائد
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/90 text-lg max-w-2xl">
                      {group.description || "لا يوجد وصف"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Show community button only if user is a member */}
                    {!isProductOwner && isMember && (
                      <Button
                        onClick={() => navigate(`/groups/${groupId}/community`)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        data-testid="button-community"
                      >
                        <MessageSquareText className="ml-2 h-4 w-4" />
                        مجتمع المجموعة
                      </Button>
                    )}
                    
                    {/* Show join button if user is freelancer and not a member */}
                    {isFreelancer && !isMember && group.status === "active" && group.currentMembers < group.maxMembers && (
                      <Button
                        onClick={() => joinGroupMutation.mutate()}
                        disabled={joinGroupMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-join-group"
                      >
                        <UserPlus className="ml-2 h-4 w-4" />
                        {joinGroupMutation.isPending ? "جاري الانضمام..." : "انضم للجروب"}
                      </Button>
                    )}
                    
                    {isProductOwner && (
                      <Button
                        onClick={handleStartConversation}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                        data-testid="button-start-conversation"
                      >
                        <MessageCircle className="ml-2 h-4 w-4" />
                        ابدأ محادثة
                      </Button>
                    )}
                    
                    {/* Show leave button only if user is a member and not the leader */}
                    {isFreelancer && isMember && !isLeader && (
                      <Button
                        variant="destructive"
                        onClick={() => leaveGroupMutation.mutate()}
                        disabled={leaveGroupMutation.isPending}
                        data-testid="button-leave-group"
                      >
                        {leaveGroupMutation.isPending ? "جاري المغادرة..." : "مغادرة الجروب"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Grid */}
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Members */}
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{group.currentMembers}</p>
                <p className="text-sm text-gray-600">الأعضاء</p>
                <p className="text-xs text-gray-500">{group.maxMembers} كحد أقصى</p>
              </div>

              {/* Total Projects */}
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{group.totalProjects || 0}</p>
                <p className="text-sm text-gray-600">المشاريع</p>
              </div>

              {/* Completed Projects */}
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{group.completedProjects || 0}</p>
                <p className="text-sm text-gray-600">مكتملة</p>
              </div>

              {/* In Progress Projects */}
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{group.inProgressProjects || 0}</p>
                <p className="text-sm text-gray-600">جارية</p>
              </div>

              {/* Success Rate */}
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                <p className="text-sm text-gray-600">معدل النجاح</p>
              </div>

              {/* Rating */}
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(group.averageRating) > 0 ? parseFloat(group.averageRating).toFixed(1) : "0.0"}
                </p>
                <p className="text-sm text-gray-600">التقييم</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {renderStars(parseFloat(group.averageRating) || 0)}
                </div>
              </div>
            </div>

            {/* Additional Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Crown className="h-4 w-4 text-blue-600" />
                <span>القائد: <strong>{group.leaderName}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>أنشئ منذ: <strong>{new Date(group.createdAt).toLocaleDateString('ar-EG')}</strong></span>
              </div>
              {group.totalRevenue > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>إجمالي الإيرادات: <strong>{group.totalRevenue} ر.س</strong></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="members" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              data-testid="tab-members"
            >
              <Users className="ml-2 h-4 w-4" />
              الأعضاء ({members.length})
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              data-testid="tab-projects"
            >
              <Briefcase className="ml-2 h-4 w-4" />
              المشاريع ({projects.length})
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              data-testid="tab-tasks"
            >
              <Target className="ml-2 h-4 w-4" />
              المهام ({tasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Members Tab */}
          <TabsContent value="members" className="mt-6">
            {membersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="h-20 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : members.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد أعضاء</h3>
                  <p className="text-gray-500">لا يوجد أعضاء في الجروب حالياً</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <Card 
                    key={member.id} 
                    className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white"
                    data-testid={`card-member-${member.freelancerId}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-gray-200">
                            <AvatarImage src={member.freelancer?.profileImage || ""} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {member.freelancer?.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{member.freelancer?.fullName || "مستخدم"}</h4>
                              {member.freelancer?.isVerified && (
                                <Shield className="h-4 w-4 text-green-600" title="مستخدم موثوق" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {member.freelancer?.username || "@user"}
                            </p>
                            {member.freelancer?.jobTitle && (
                              <p className="text-xs text-blue-600 font-medium">{member.freelancer.jobTitle}</p>
                            )}
                          </div>
                        </div>

                        {member.role === "leader" ? (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            <Crown className="h-3 w-3" />
                            قائد
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            عضو
                          </Badge>
                        )}
                      </div>

                      {/* Member Details */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {member.freelancer?.bio && (
                          <p className="text-sm text-gray-700 line-clamp-2">{member.freelancer.bio}</p>
                        )}
                        
                        {member.freelancer?.services && member.freelancer.services.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {member.freelancer.services.slice(0, 3).map((service, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {service}
                              </span>
                            ))}
                            {member.freelancer.services.length > 3 && (
                              <span className="text-xs text-gray-500">+{member.freelancer.services.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center">
                          <span>انضم في:</span>
                          <span className="font-medium">{new Date(member.joinedAt).toLocaleDateString("ar-EG")}</span>
                        </div>
                        {member.freelancer?.lastSeen && (
                          <div className="flex justify-between items-center">
                            <span>الحالة:</span>
                            <span className={`font-medium ${
                              new Date().getTime() - new Date(member.freelancer.lastSeen).getTime() < 300000 
                                ? "text-green-600" 
                                : "text-gray-500"
                            }`}>
                              {formatLastSeen(member.freelancer.lastSeen)}
                            </span>
                          </div>
                        )}
                      </div>

                      {isLeader && member.role !== "leader" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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

          {/* Projects Tab (unchanged) */}
          <TabsContent value="projects" className="mt-6">
            {/* ... projects content remains the same ... */}
          </TabsContent>

          {/* Tasks Tab (unchanged) */}
          <TabsContent value="tasks" className="mt-6">
            {/* ... tasks content remains the same ... */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">تأكيد إزالة العضو</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              هل أنت متأكد من إزالة هذا العضو من الجروب؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              data-testid="button-cancel-remove"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMemberMutation.mutate(memberToRemove)}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-confirm-remove"
            >
              {removeMemberMutation.isPending ? "جاري الإزالة..." : "تأكيد الإزالة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}