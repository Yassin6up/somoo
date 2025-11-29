import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
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
  Eye,
  UserPlus,
  Shield,
  Award,
  Palette
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

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["/api/groups", groupId],
    queryFn: async () => {
      const response = await apiRequest(`/api/groups/${groupId}`, "GET");
      return response.json();
    },
  });

  // Fetch group members
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
  const isFreelancer = userType === "freelancer";

  // Check if user is member of this group
  const isMember = group?.isMember || false;

  // Check spectator status for product owners
  const { data: spectatorStatus } = useQuery({
    queryKey: ["/api/groups", groupId, "spectator-status"],
    queryFn: async () => {
      const response = await apiRequest(`/api/groups/${groupId}/spectator-status`, "GET");
      return response.json();
    },
    enabled: isProductOwner && !!groupId,
  });

  const isSpectator = spectatorStatus?.isSpectator || false;

  // Calculate stats
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

  // Join as spectator mutation
  const joinAsSpectatorMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/spectators`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "spectator-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      toast({
        title: "تم الانضمام كمراقب",
        description: "يمكنك الآن مشاهدة منشورات المجموعة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الانضمام كمراقب",
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

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-500" />);
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

  // Get group image with fallback
  const getGroupImage = (group: any) => {
    if (group.groupImage) return group.groupImage;
    if (group.portfolioImages && group.portfolioImages.length > 0) return group.portfolioImages[0];
    return `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name || 'Group')}`;
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">الجروب غير موجود</h3>
              <p className="text-gray-600 text-center mb-6">
                لم يتم العثور على هذا الجروب أو قد تم إزالته
              </p>
              <Button 
                onClick={() => navigate("/groups")}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للجروبات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/groups")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للجروبات
            </Button>
            
            <div className="flex items-center gap-3">
              {isLeader && (
                <Badge className="bg-yellow-100 text-yellow-800 border-0">
                  <Crown className="h-3 w-3 ml-1" />
                  أنت القائد
                </Badge>
              )}
              <Badge className={
                group.status === "active" 
                  ? "bg-green-100 text-green-800 border-0"
                  : "bg-gray-100 text-gray-800 border-0"
              }>
                {group.status === "active" ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Group Image */}
            <div className="w-full lg:w-1/3">
              <div className="relative h-64 lg:h-80 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                <img
                  src={getGroupImage(group)}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Group Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">{group.name}</h1>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {group.description || "لا يوجد وصف للجروب حالياً"}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {(isMember || (isProductOwner && isSpectator)) && (
                  <Button
                    onClick={() => navigate(`/groups/${groupId}/community`)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <MessageSquareText className="ml-2 h-4 w-4" />
                    مجتمع المجموعة
                  </Button>
                )}
                
                {isFreelancer && !isMember && group.status === "active" && group.currentMembers < group.maxMembers && (
                  <Button
                    onClick={() => joinGroupMutation.mutate()}
                    disabled={joinGroupMutation.isPending}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <UserPlus className="ml-2 h-4 w-4" />
                    {joinGroupMutation.isPending ? "جاري الانضمام..." : "انضم للجروب"}
                  </Button>
                )}
                
                {/* {isProductOwner && !isSpectator && (
                  <Button
                    onClick={() => joinAsSpectatorMutation.mutate()}
                    disabled={joinAsSpectatorMutation.isPending}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    {joinAsSpectatorMutation.isPending ? "جارٍ الانضمام..." : "انضم كمراقب"}
                  </Button>
                )} */}
                
                {isFreelancer && isMember && !isLeader && (
                  <Button
                    variant="outline"
                    onClick={() => leaveGroupMutation.mutate()}
                    disabled={leaveGroupMutation.isPending}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {leaveGroupMutation.isPending ? "جاري المغادرة..." : "مغادرة الجروب"}
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-900">{group.currentMembers}</span>
                  </div>
                  <p className="text-sm text-gray-600">الأعضاء</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-900">{group.totalProjects || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">المشاريع</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-900">{successRate}%</span>
                  </div>
                  <p className="text-sm text-gray-600">معدل النجاح</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-900">
                      {parseFloat(group.averageRating) > 0 ? parseFloat(group.averageRating).toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">التقييم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-lg">
              <TabsTrigger 
                value="members" 
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-md py-2"
              >
                <Users className="ml-2 h-4 w-4" />
                الأعضاء ({members.length})
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-md py-2"
              >
                <Briefcase className="ml-2 h-4 w-4" />
                المشاريع ({projects.length})
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-md py-2"
              >
                <Target className="ml-2 h-4 w-4" />
                المهام ({tasks.length})
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-6">
              {membersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse border border-gray-200 rounded-lg">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <Card className="border border-gray-200 rounded-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد أعضاء</h3>
                    <p className="text-gray-600 text-center">
                      لا يوجد أعضاء في الجروب حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <Card key={member.id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarImage src={member.freelancer?.profileImage || ""} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {member.freelancer?.fullName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{member.freelancer?.fullName || "مستخدم"}</h4>
                                {member.freelancer?.isVerified && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {member.freelancer?.username || "@user"}
                              </p>
                            </div>
                          </div>
                          {member.role === "leader" ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-0">
                              <Crown className="h-3 w-3 ml-1" />
                              قائد
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              عضو
                            </Badge>
                          )}
                        </div>

                        {member.freelancer?.jobTitle && (
                          <p className="text-sm text-gray-600 mb-3">{member.freelancer.jobTitle}</p>
                        )}

                        {member.freelancer?.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{member.freelancer.bio}</p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>انضم في: {new Date(member.joinedAt).toLocaleDateString("ar-EG")}</span>
                          {member.freelancer?.lastSeen && (
                            <span className={
                              new Date().getTime() - new Date(member.freelancer.lastSeen).getTime() < 300000 
                                ? "text-green-600" 
                                : "text-gray-500"
                            }>
                              {formatLastSeen(member.freelancer.lastSeen)}
                            </span>
                          )}
                        </div>

                        {isLeader && member.role !== "leader" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => setMemberToRemove(member.freelancerId)}
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
                <Card className="border border-gray-200 rounded-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مشاريع</h3>
                    <p className="text-gray-600 text-center">
                      لا يوجد مشاريع مرتبطة بهذا الجروب حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-lg">{project.title}</h4>
                          <Badge className={
                            project.status === "completed" 
                              ? "bg-green-100 text-green-800 border-0"
                              : project.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 border-0"
                              : "bg-gray-100 text-gray-800 border-0"
                          }>
                            {project.status === "completed" ? "مكتمل" : project.status === "in_progress" ? "جاري" : "معلق"}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <DollarSign className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-gray-900">{project.budget} ر.س</p>
                            <p className="text-xs text-gray-600">الميزانية</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Target className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-gray-900">{project.tasksCount}</p>
                            <p className="text-xs text-gray-600">المهام</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                          <span>تاريخ الإنشاء: {new Date(project.createdAt).toLocaleDateString('ar-EG')}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </Button>
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
                <Card className="border border-gray-200 rounded-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مهام</h3>
                    <p className="text-gray-600 text-center">
                      لا يوجد مهام مرتبطة بهذا الجروب حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <Badge className={
                            task.status === "approved" 
                              ? "bg-green-100 text-green-800 border-0"
                              : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 border-0"
                              : task.status === "submitted"
                              ? "bg-orange-100 text-orange-800 border-0"
                              : "bg-gray-100 text-gray-800 border-0"
                          }>
                            {task.status === "approved" ? "معتمدة" : task.status === "in_progress" ? "قيد التنفيذ" : task.status === "submitted" ? "مقدمة" : "متاحة"}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">المكافأة:</span>
                            <span className="font-semibold text-gray-900">{task.reward} ر.س</span>
                          </div>
                          
                          {task.deadline && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">الموعد النهائي:</span>
                              <span className="font-semibold text-gray-900">{new Date(task.deadline).toLocaleDateString('ar-EG')}</span>
                            </div>
                          )}
                          
                          {task.rating && task.rating > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">التقييم:</span>
                              <div className="flex items-center gap-1">
                                {renderStars(task.rating)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                          <span>{new Date(task.createdAt).toLocaleDateString('ar-EG')}</span>
                          {task.serviceType && (
                            <span className="text-blue-600">{task.serviceType}</span>
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
      </section>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="border border-gray-200 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إزالة العضو</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة هذا العضو من الجروب؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMemberMutation.mutate(memberToRemove)}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {removeMemberMutation.isPending ? "جاري الإزالة..." : "تأكيد الإزالة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}