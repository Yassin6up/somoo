import { useState, useRef, useEffect } from "react";
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
  Shield,
  Sparkles,
  Zap,
  Rocket,
  ArrowUpRight,
  Eye,
  FileText,
  Settings,
  Palette
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group, GroupMember, Project, Task, Freelancer } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animated section wrapper with GSAP
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="opacity-0">
      {children}
    </div>
  );
}

// Professional gradient background component
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

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

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="animate-pulse border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">الجروب غير موجود</h3>
              <p className="text-gray-600 text-lg text-center mb-8 max-w-md">
                لم يتم العثور على هذا الجروب أو قد تم إزالته
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate("/groups")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <ArrowRight className="ml-3 h-5 w-5" />
                  العودة للجروبات
                  <Rocket className="mr-2 h-5 w-5" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Back Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/groups")}
            className="hover:bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
          >
            <ArrowRight className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            العودة للجروبات
          </Button>
        </motion.div>

        {/* Enhanced Group Header */}
        <FadeInSection delay={0.1}>
          <Card className="mb-8 border-0 rounded-2xl shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            {/* Enhanced Group Image with Gradient Overlay */}
            {group.groupImage && (
              <div className="relative w-full h-80 overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600">
                <img
                  src={group.groupImage}
                  alt={group.name}
                  className="w-full h-full object-cover opacity-90"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Enhanced Header Content Overlay */}
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl font-bold" style={{ fontFamily: "Tajawal, sans-serif" }}>
                          {group.name}
                        </h1>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {group.status === "active" ? "نشط" : "غير نشط"}
                          </Badge>
                          {isLeader && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 gap-2 px-3 py-1.5 rounded-full shadow-lg">
                              <Crown className="h-4 w-4" />
                              أنت القائد
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-white/90 text-xl max-w-3xl leading-relaxed">
                        {group.description || "لا يوجد وصف للجروب حالياً"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-max">
                      {/* Show community button only if user is a member */}
                      {!isProductOwner && isMember && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => navigate(`/groups/${groupId}/community`)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-2xl px-6 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            data-testid="button-community"
                          >
                            <MessageSquareText className="ml-3 h-5 w-5" />
                            مجتمع المجموعة
                            <ArrowUpRight className="mr-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Show join button if user is freelancer and not a member */}
                      {isFreelancer && !isMember && group.status === "active" && group.currentMembers < group.maxMembers && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => joinGroupMutation.mutate()}
                            disabled={joinGroupMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl px-6 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            data-testid="button-join-group"
                          >
                            <UserPlus className="ml-3 h-5 w-5" />
                            {joinGroupMutation.isPending ? "جاري الانضمام..." : "انضم للجروب"}
                            <Rocket className="mr-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      )}
                      
                      {isProductOwner && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleStartConversation}
                            className="bg-white text-blue-600 hover:bg-gray-100 rounded-2xl px-6 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            data-testid="button-start-conversation"
                          >
                            <MessageCircle className="ml-3 h-5 w-5" />
                            ابدأ محادثة
                            <ArrowUpRight className="mr-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Show leave button only if user is a member and not the leader */}
                      {isFreelancer && isMember && !isLeader && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            onClick={() => leaveGroupMutation.mutate()}
                            disabled={leaveGroupMutation.isPending}
                            className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-2xl px-6 py-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                            data-testid="button-leave-group"
                          >
                            {leaveGroupMutation.isPending ? "جاري المغادرة..." : "مغادرة الجروب"}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Stats Grid */}
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {/* Members */}
                <FadeInSection delay={0.2}>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                    <Users className="h-10 w-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">{group.currentMembers}</p>
                    <p className="text-sm font-semibold text-gray-700">الأعضاء</p>
                    <p className="text-xs text-gray-500 mt-1">{group.maxMembers} كحد أقصى</p>
                  </div>
                </FadeInSection>

                {/* Total Projects */}
                <FadeInSection delay={0.25}>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 group">
                    <Briefcase className="h-10 w-10 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">{group.totalProjects || 0}</p>
                    <p className="text-sm font-semibold text-gray-700">المشاريع</p>
                  </div>
                </FadeInSection>

                {/* Completed Projects */}
                <FadeInSection delay={0.3}>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">{group.completedProjects || 0}</p>
                    <p className="text-sm font-semibold text-gray-700">مكتملة</p>
                  </div>
                </FadeInSection>

                {/* In Progress Projects */}
                <FadeInSection delay={0.35}>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300 group">
                    <Clock className="h-10 w-10 text-amber-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">{group.inProgressProjects || 0}</p>
                    <p className="text-sm font-semibold text-gray-700">جارية</p>
                  </div>
                </FadeInSection>

                {/* Success Rate */}
                <FadeInSection delay={0.4}>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 group">
                    <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
                    <p className="text-sm font-semibold text-gray-700">معدل النجاح</p>
                  </div>
                </FadeInSection>

                {/* Rating */}
                <FadeInSection delay={0.45}>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 group">
                    <Star className="h-10 w-10 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-bold text-gray-900">
                      {parseFloat(group.averageRating) > 0 ? parseFloat(group.averageRating).toFixed(1) : "0.0"}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">التقييم</p>
                    <div className="flex justify-center gap-0.5 mt-2">
                      {renderStars(parseFloat(group.averageRating) || 0)}
                    </div>
                  </div>
                </FadeInSection>
              </div>

              {/* Enhanced Additional Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">القائد</p>
                    <p className="font-semibold text-gray-900">{group.leaderName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                    <p className="font-semibold text-gray-900">{new Date(group.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>

                {group.totalRevenue > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                      <p className="font-semibold text-gray-900">{group.totalRevenue} ر.س</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeInSection>

        {/* Enhanced Tabs */}
        <FadeInSection delay={0.5}>
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200 p-2 rounded-2xl shadow-lg">
              <TabsTrigger 
                value="members" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-4 font-semibold transition-all duration-300"
                data-testid="tab-members"
              >
                <Users className="ml-3 h-5 w-5" />
                الأعضاء ({members.length})
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-4 font-semibold transition-all duration-300"
                data-testid="tab-projects"
              >
                <Briefcase className="ml-3 h-5 w-5" />
                المشاريع ({projects.length})
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-4 font-semibold transition-all duration-300"
                data-testid="tab-tasks"
              >
                <Target className="ml-3 h-5 w-5" />
                المهام ({tasks.length})
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Members Tab */}
            <TabsContent value="members" className="mt-8">
              {membersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
                      <CardContent className="pt-6 p-6">
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <Card className="border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <Users className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">لا يوجد أعضاء</h3>
                    <p className="text-gray-600 text-lg text-center max-w-md">
                      لا يوجد أعضاء في الجروب حالياً. كن أول من ينضم لهذا الجروب المحترف!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member, index) => (
                    <FadeInSection key={member.id} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group"
                      >
                        <Card 
                          className="border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                          data-testid={`card-member-${member.freelancerId}`}
                        >
                          <CardContent className="pt-6 p-6">
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-lg ring-2 ring-blue-100">
                                  <AvatarImage src={member.freelancer?.profileImage || ""} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                                    {member.freelancer?.fullName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-lg">{member.freelancer?.fullName || "مستخدم"}</h4>
                                    {member.freelancer?.isVerified && (
                                      <Shield className="h-4 w-4 text-green-600" title="مستخدم موثوق" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {member.freelancer?.username || "@user"}
                                  </p>
                                  {member.freelancer?.jobTitle && (
                                    <p className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full mt-1">
                                      {member.freelancer.jobTitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {member.role === "leader" ? (
                                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                  <Crown className="h-4 w-4" />
                                  قائد
                                </div>
                              ) : (
                                <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                                  عضو
                                </Badge>
                              )}
                            </div>

                            {/* Enhanced Member Details */}
                            <div className="space-y-3 text-sm text-gray-600 mb-5">
                              {member.freelancer?.bio && (
                                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed bg-gray-50 p-3 rounded-xl">
                                  {member.freelancer.bio}
                                </p>
                              )}
                              
                              {member.freelancer?.services && member.freelancer.services.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {member.freelancer.services.slice(0, 3).map((service, index) => (
                                    <span key={index} className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 font-medium">
                                      {service}
                                    </span>
                                  ))}
                                  {member.freelancer.services.length > 3 && (
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-full border border-blue-200 font-medium">
                                      +{member.freelancer.services.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">انضم في:</span>
                                <span className="font-semibold text-gray-900">{new Date(member.joinedAt).toLocaleDateString("ar-EG")}</span>
                              </div>
                              {member.freelancer?.lastSeen && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">الحالة:</span>
                                  <span className={`font-semibold ${
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
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-5"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl py-3 font-semibold transition-all duration-300"
                                  onClick={() => setMemberToRemove(member.freelancerId)}
                                  data-testid={`button-remove-member-${member.freelancerId}`}
                                >
                                  <UserMinus className="ml-2 h-4 w-4" />
                                  إزالة من الجروب
                                </Button>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </FadeInSection>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Enhanced Projects Tab */}
            <TabsContent value="projects" className="mt-8">
              {projects.length === 0 ? (
                <Card className="border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <Briefcase className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد مشاريع</h3>
                    <p className="text-gray-600 text-lg text-center max-w-md">
                      لا يوجد مشاريع مرتبطة بهذا الجروب حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project, index) => (
                    <FadeInSection key={project.id} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group"
                      >
                        <Card className="border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {project.title}
                                </CardTitle>
                                <CardDescription className="text-gray-600 leading-relaxed line-clamp-2">
                                  {project.description}
                                </CardDescription>
                              </div>
                              <Badge className={
                                project.status === "completed" 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1.5 rounded-full shadow-sm"
                                  : project.status === "in_progress"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-3 py-1.5 rounded-full shadow-sm"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 px-3 py-1.5 rounded-full shadow-sm"
                              }>
                                {project.status === "completed" ? "مكتمل" : project.status === "in_progress" ? "جاري" : "معلق"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">الميزانية</p>
                                  <p className="font-bold text-gray-900">{project.budget} ر.س</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <Target className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">المهام</p>
                                  <p className="font-bold text-gray-900">{project.tasksCount}</p>
                                </div>
                              </div>
                            </div>

                            {project.deadline && (
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">الموعد النهائي</p>
                                    <p className="font-semibold text-gray-900">{new Date(project.deadline).toLocaleDateString('ar-EG')}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
                              <span className="text-sm font-semibold text-gray-900">{new Date(project.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Eye className="ml-2 h-5 w-5" />
                                عرض التفاصيل
                                <ArrowUpRight className="mr-2 h-5 w-5" />
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </FadeInSection>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Enhanced Tasks Tab */}
            <TabsContent value="tasks" className="mt-8">
              {tasks.length === 0 ? (
                <Card className="border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <Target className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد مهام</h3>
                    <p className="text-gray-600 text-lg text-center max-w-md">
                      لا يوجد مهام مرتبطة بهذا الجروب حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, index) => (
                    <FadeInSection key={task.id} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group"
                      >
                        <Card className="border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                          <div className={
                            task.status === "approved" 
                              ? "h-2 bg-gradient-to-r from-green-500 to-emerald-600"
                              : task.status === "in_progress"
                              ? "h-2 bg-gradient-to-r from-blue-500 to-cyan-600"
                              : task.status === "submitted"
                              ? "h-2 bg-gradient-to-r from-orange-500 to-yellow-600"
                              : "h-2 bg-gradient-to-r from-gray-400 to-gray-500"
                          } />
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                  {task.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                  {task.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={
                              task.status === "approved" 
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1 rounded-full shadow-sm w-fit"
                                : task.status === "in_progress"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-3 py-1 rounded-full shadow-sm w-fit"
                                : task.status === "submitted"
                                ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white border-0 px-3 py-1 rounded-full shadow-sm w-fit"
                                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 px-3 py-1 rounded-full shadow-sm w-fit"
                            }>
                              {task.status === "approved" ? "معتمدة" : task.status === "in_progress" ? "قيد التنفيذ" : task.status === "submitted" ? "مقدمة" : "متاحة"}
                            </Badge>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <Award className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">المكافأة</p>
                                  <p className="font-bold text-gray-900">{task.reward} ر.س</p>
                                </div>
                              </div>
                              {task.rating && task.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                                  <span className="font-semibold text-gray-900">{task.rating}</span>
                                </div>
                              )}
                            </div>

                            {task.deadline && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                  <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">الموعد النهائي</p>
                                  <p className="font-semibold text-gray-900 text-sm">{new Date(task.deadline).toLocaleDateString('ar-EG')}</p>
                                </div>
                              </div>
                            )}

                            {task.serviceType && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <Palette className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">{task.serviceType}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-600">تاريخ الإنشاء</span>
                              <span className="text-xs font-semibold text-gray-900">{new Date(task.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </FadeInSection>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </FadeInSection>
      </div>

      {/* Enhanced Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="border-0 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserMinus className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">تأكيد إزالة العضو</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-lg leading-relaxed">
              هل أنت متأكد من إزالة هذا العضو من الجروب؟ هذا الإجراء لا يمكن التراجع عنه وقد يؤثر على سير العمل في المشاريع الجارية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel 
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-semibold transition-all duration-300"
              data-testid="button-cancel-remove"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMemberMutation.mutate(memberToRemove)}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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