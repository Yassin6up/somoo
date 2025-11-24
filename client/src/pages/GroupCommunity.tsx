import { useState,useRef , useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Send,
  Image as ImageIcon,
  Trash2,
  Flag,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Info,
  Upload,
  X,
  Home,
  UserPlus,
  UserCheck,
  Video,
  FileText,
  ShoppingBag,
  UserCircle,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Share,
  Camera,
  File,
  Search,
  Bell,
  Menu,
  Settings,
  Bookmark,
  Heart,
  Eye,
  Globe,
  Briefcase,
  Sparkles,
  Zap,
  MessagesSquare,
  Target,
  Rocket,
  BarChart3,
  Palette,
  Shield,
  Clock,
  Award,
  DollarSign,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
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

interface Group {
  id: string;
  name: string;
  description: string | null;
  service: string;
  maxMembers: number;
  currentMembers: number;
  leaderId: string;
  country: string;
  groupImage: string | null;
  coverImage: string | null;
  portfolioImages: string[] | null;
  createdAt: Date;
  rules: string[];
  tags: string[];
}

interface GroupMember {
  id: string;
  groupId: string;
  freelancerId: string;
  joinedAt: Date;
  role: 'member' | 'admin' | 'moderator';
}

interface Freelancer {
  id: string;
  fullName: string;
  username: string;
  profileImage: string | null;
  lastSeen: Date | null;
  bio: string | null;
}

interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  taskTitle?: string;
  taskReward?: string;
  hasTask?: boolean;
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  createdAt: Date;
}

interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  attendees: string[];
}

export default function GroupCommunity() {
  const { id: groupId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  // Post composer state
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);

  // Task creation state
  const [createTask, setCreateTask] = useState(false);
  const [taskReward, setTaskReward] = useState("0");
  const [taskTitle, setTaskTitle] = useState("");

  // Comment state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Search and notifications state
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Get current user
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const currentUserId = currentUser?.id;
  const userType = localStorage.getItem("userType");

  // Fetch group data
  const {
    data: group,
    isLoading: groupLoading,
    error: groupError
  } = useQuery<Group>({
    queryKey: [`/groups/${groupId}`],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Group not found");
        }
        throw new Error("Failed to fetch group");
      }

      const data = await response.json();
      return data;
    },
    retry: 1,
    enabled: !!groupId,
  });

  // Fetch group members
  const { data: members = [] } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${groupId}/members`],
  });

  // Fetch group events
  const { data: events = [] } = useQuery<GroupEvent[]>({
    queryKey: [`/api/groups/${groupId}/events`],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch group media
  const { data: media = [] } = useQuery<GroupPost[]>({
    queryKey: [`/api/groups/${groupId}/media`],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/posts?mediaOnly=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Check if current user is a member
  const isMember = members.some(m => m.freelancerId === currentUserId);
  const isLeader = group?.leaderId === currentUserId;
  const userRole = members.find(m => m.freelancerId === currentUserId)?.role;

  // Fetch freelancers info for members
  const { data: freelancers = [] } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
  });

  // Fetch user notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch posts (only leader posts)
  const { data: posts = [], isLoading: postsLoading } = useQuery<GroupPost[]>({
    queryKey: ['/api/groups', groupId, 'posts'],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/posts?leaderOnly=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  // Helper functions
  const getMemberInfo = (memberId: string) => {
    return freelancers.find(f => f.id === memberId);
  };

  const isOnline = (lastSeen: Date | null) => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
  };

  const checkIsLeader = (userId: string) => {
    return group?.leaderId === userId;
  };

  // URL detection function
  const detectUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1 font-medium"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return part;
    });
  };

  // Image upload handler
  const handleImageUpload = async (file: File, type: 'post' | 'comment', postId?: string) => {
    // Accept common image formats
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة بصيغة صحيحة (JPG, PNG, GIF, WEBP)",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (type === 'post') setIsUploadingPostImage(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'post');

      const token = localStorage.getItem("token");
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل رفع الصورة');
      }

      const { url } = await response.json();

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });

      return url;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
      return null;
    } finally {
      if (type === 'post') setIsUploadingPostImage(false);
    }
  };

  // Create post mutation (only for leader)
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      return await apiRequest(`/api/groups/${groupId}/posts`, "POST", {
        content,
        imageUrl,
        createTask,
        taskReward,
        taskTitle: taskTitle || "مهمة تفاعل جديدة",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
      setNewPostContent("");
      setNewPostImage(null);
      setCreateTask(false);
      setTaskReward("0");
      setTaskTitle("");
      toast({
        title: "تم نشر المنشور",
        description: createTask ? "تم نشر المنشور وإنشاء المهمة بنجاح" : "تم نشر المنشور بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء نشر المنشور",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = async () => {
    if (!isLeader) {
      toast({
        title: "غير مسموح",
        description: "فقط قائد الجروب يمكنه نشر المنشورات",
        variant: "destructive",
      });
      return;
    }

    if (!newPostContent.trim() && !newPostImage) {
      toast({
        title: "تنبيه",
        description: "يرجى كتابة محتوى أو إضافة صورة",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: newPostContent,
      imageUrl: newPostImage,
    });
  };

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/join`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
      toast({
        title: "تم الانضمام بنجاح",
        description: "تم إضافتك إلى المجموعة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الانضمام للمجموعة",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = () => {
    if (!currentUserId || userType !== "freelancer") {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول كفريلانسر للانضمام للمجموعة",
        variant: "destructive",
      });
      return;
    }

    joinGroupMutation.mutate();
  };

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <Sparkles className="w-6 h-6 text-purple-500 absolute top-0 right-0 animate-ping" />
          </div>
          <p className="text-gray-600 font-medium">جاري تحميل المجتمع...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6 text-center p-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">المجموعة غير موجودة</p>
            <Button
              variant="outline"
              onClick={() => navigate("/groups")}
              className="mt-4 rounded-xl"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للجروبات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const membersList = members
    .map(m => getMemberInfo(m.freelancerId))
    .filter(Boolean) as Freelancer[];

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const recentMedia = media.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30" dir="rtl">
      {/* Enhanced Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left: Group Logo and Name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
                  {group.name.substring(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{group.name}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                  <Users className="w-3.5 h-3.5" />
                  {group.currentMembers} عضو
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100 rounded-full"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 rounded-full relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* Enhanced Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <h3 className="font-bold text-lg">الإشعارات</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">لا توجد إشعارات جديدة</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif: any, index: number) => (
                            <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.type === 'task_assigned' ? 'bg-purple-100' :
                                  notif.type === 'new_member' ? 'bg-blue-100' :
                                    'bg-green-100'
                                  }`}>
                                  {notif.type === 'task_assigned' ? <Star className="w-5 h-5 text-purple-600" /> :
                                    notif.type === 'new_member' ? <Users className="w-5 h-5 text-blue-600" /> :
                                      <MessageSquare className="w-5 h-5 text-green-600" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">عرض كل الإشعارات</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isMember && !isLeader && userType === "freelancer" && (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 shadow-lg shadow-blue-500/30 rounded-full transition-all hover:shadow-xl hover:scale-105"
                  onClick={handleJoinGroup}
                  disabled={joinGroupMutation.isPending}
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  {joinGroupMutation.isPending ? "جاري الانضمام..." : "انضم الآن"}
                </Button>
              )}
              {(isMember || isLeader) && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg shadow-green-500/30">
                  <UserCheck className="ml-2 h-4 w-4" />
                  عضو نشط
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-white/90 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث في المنشورات والتعليقات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 pl-4 py-6 rounded-full border-gray-200 focus:border-blue-500 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Admin-Only Notice */}
      {!isLeader && (isMember || isLeader) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">ملاحظة هامة</p>
                <p className="text-xs text-amber-700 mt-0.5">فقط قائد المجموعة يمكنه نشر المنشورات في هذه المجموعة</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Enhanced Left Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Enhanced Group Info Card */}
            <FadeInSection delay={0.1}>
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">معلومات المجموعة</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                      <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                        <Users className="w-4 h-4 text-blue-600" />
                        الأعضاء
                      </span>
                      <span className="font-bold text-blue-600">{group.currentMembers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all">
                      <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4 text-purple-600" />
                        المنشورات
                      </span>
                      <span className="font-bold text-purple-600">{posts.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all">
                      <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-green-600" />
                        تاريخ الإنشاء
                      </span>
                      <span className="font-bold text-green-600 text-xs">
                        {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* Enhanced Group Description */}
            {group.description && (
              <FadeInSection delay={0.15}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">عن المجموعة</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{group.description}</p>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {/* Enhanced Quick Actions */}
            <FadeInSection delay={0.2}>
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">إجراءات سريعة</h3>
                  </div>
                  <div className="space-y-3">
                    {isLeader && (
                      <button
                        onClick={() => navigate(`/groups/${groupId}/dashboard`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-right flex-1">
                          <p className="font-semibold text-sm text-gray-900">لوحة التحكم</p>
                          <p className="text-xs text-gray-500">إدارة المجموعة والأعضاء</p>
                        </div>
                      </button>
                    )}
                    {userType === "product_owner" && group?.leaderId && (
                      <button
                        onClick={() => navigate(`/chat/${group.leaderId}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-right flex-1">
                          <p className="font-semibold text-sm text-gray-900">محادثة القائد</p>
                          <p className="text-xs text-gray-500">تواصل مع قائد المجموعة</p>
                        </div>
                      </button>
                    )}
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="font-semibold text-sm text-gray-900">الفعاليات</p>
                        <p className="text-xs text-gray-500">عرض الفعاليات القادمة</p>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* Enhanced Members List */}
            <EnhancedMembersList
              members={members}
              getMemberInfo={getMemberInfo}
              isOnline={isOnline}
              checkIsLeader={checkIsLeader}
            />
          </aside>

          {/* Enhanced Main Feed */}
          <main className="lg:col-span-6 space-y-6">
            {/* Enhanced Create Post - Only for Leader */}
            {!isLeader && isMember && (
              <FadeInSection delay={0.05}>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">فقط قائد المجموعة</p>
                        <p className="text-sm text-gray-600">يمكن لقائد المجموعة فقط نشر المنشورات والمهام في هذه المجموعة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {isLeader && (
              <FadeInSection delay={0.1}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-lg ring-2 ring-blue-100">
                        <AvatarImage src={currentUser?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {currentUser?.fullName?.substring(0, 2) || "Me"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="شارك شيئاً مميزاً مع المجموعة... ✨"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="resize-none min-h-[120px] border-0 text-base focus:ring-0 placeholder:text-gray-400 text-gray-900 p-0 bg-transparent"
                        />
                      </div>
                    </div>

                    {newPostImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mb-4 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg"
                      >
                        <img
                          src={newPostImage}
                          alt="معاينة"
                          className="w-full max-h-96 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-3 left-3 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm border-0 shadow-lg rounded-full"
                          onClick={() => setNewPostImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Enhanced Task Creation */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 mb-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">إنشاء مهمة للأعضاء</h4>
                            <p className="text-xs text-gray-500">سيتم إنشاء مهمة تلقائية لكل عضو في المجموعة</p>
                          </div>
                        </div>
                        <Switch
                          checked={createTask}
                          onCheckedChange={setCreateTask}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
                        />
                      </div>

                      <AnimatePresence>
                        {createTask && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-2">
                                <Label htmlFor="task-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-blue-600" />
                                  عنوان المهمة
                                </Label>
                                <Input
                                  id="task-title"
                                  placeholder="مثال: تفاعل مع هذا المنشور"
                                  value={taskTitle}
                                  onChange={(e) => setTaskTitle(e.target.value)}
                                  className="bg-white border-gray-200 focus:border-blue-500 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="task-reward" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  المكافأة (ر.س)
                                </Label>
                                <Input
                                  id="task-reward"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={taskReward}
                                  onChange={(e) => setTaskReward(e.target.value)}
                                  className="bg-white border-gray-200 focus:border-blue-500 rounded-xl"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => document.getElementById('post-image-input')?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl text-gray-600 transition-all group"
                        >
                          <ImageIcon className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium hidden sm:inline">صورة</span>
                        </button>
                        <input
                          id="post-image-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleImageUpload(file, 'post');
                              if (url) setNewPostImage(url);
                            }
                          }}
                        />
                      </div>

                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg shadow-blue-500/30 rounded-full transition-all hover:shadow-xl hover:scale-105"
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending || (!newPostContent.trim() && !newPostImage)}
                      >
                        {createPostMutation.isPending ? "جاري النشر..." : "نشر"}
                        <Send className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {/* Enhanced Posts Feed */}
            <div className="space-y-6">
              {postsLoading ? (
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-1/4"></div>
                  </div>
                </Card>
              ) : posts.length === 0 ? (
                <FadeInSection delay={0.2}>
                  <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد منشورات بعد</h3>
                    <p className="text-gray-500 text-lg">
                      {isLeader ? "كن أول من ينشر في هذه المجموعة! ✨" : "قائد المجموعة لم ينشر أي شيء بعد."}
                    </p>
                  </Card>
                </FadeInSection>
              ) : (
                posts.map((post, index) => (
                  <FadeInSection key={post.id} delay={index * 0.1}>
                    <EnhancedPostCard
                      post={post}
                      groupId={groupId}
                      currentUserId={currentUserId}
                      getMemberInfo={getMemberInfo}
                      checkIsLeader={checkIsLeader}
                      commentInputs={commentInputs}
                      setCommentInputs={setCommentInputs}
                      commentImages={commentImages}
                      setCommentImages={setCommentImages}
                      expandedPosts={expandedPosts}
                      setExpandedPosts={setExpandedPosts}
                      toast={toast}
                      detectUrls={detectUrls}
                      handleImageUpload={handleImageUpload}
                    />
                  </FadeInSection>
                ))
              )}
            </div>
          </main>

          {/* Enhanced Right Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Pinned Posts Section */}
            {posts.filter(p => p.isPinned).length > 0 && (
              <FadeInSection delay={0.05}>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">المنشورات المثبتة</h3>
                    </div>
                    <div className="space-y-3">
                      {posts.filter(p => p.isPinned).map((pinnedPost) => (
                        <motion.div
                          key={pinnedPost.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-white rounded-xl border-2 border-amber-200 hover:shadow-md transition-all cursor-pointer hover:bg-amber-50"
                          onClick={() => document.getElementById(`post-${pinnedPost.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">مثبت</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{pinnedPost.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(pinnedPost.createdAt), { addSuffix: true, locale: ar })}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {/* Enhanced Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <FadeInSection delay={0.1}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">الفعاليات القادمة</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full">
                        عرض الكل
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md cursor-pointer transition-all group">
                          <p className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">{event.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span>{formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: ar })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {/* Enhanced Popular Tags */}
            {group.tags && group.tags.length > 0 && (
              <FadeInSection delay={0.15}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">الوسوم الشائعة</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.slice(0, 8).map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 rounded-full text-sm font-medium cursor-pointer transition-all hover:shadow-md hover:scale-105"
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}

            {/* Enhanced Group Rules */}
            {group.rules && group.rules.length > 0 && (
              <FadeInSection delay={0.2}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Flag className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">قواعد المجموعة</h3>
                    </div>
                    <div className="space-y-3">
                      {group.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-sm transition-all">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// Enhanced Post Card Component
function EnhancedPostCard({
  post,
  groupId,
  currentUserId,
  getMemberInfo,
  checkIsLeader,
  commentInputs,
  setCommentInputs,
  commentImages,
  setCommentImages,
  expandedPosts,
  setExpandedPosts,
  toast,
  detectUrls,
  handleImageUpload
}: any) {
  const author = getMemberInfo(post.authorId);
  const isAuthorLeader = checkIsLeader(post.authorId);

  // Fetch comments
  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch reactions
  const { data: reactionsData, refetch: refetchReactions } = useQuery({
    queryKey: [`/api/posts/${post.id}/reactions`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return { reactions: [], userReaction: null };
      return response.json();
    },
  });

  const reactions = reactionsData?.reactions || [];
  const userReaction = reactionsData?.userReaction;

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/posts/${post.id}/reactions`, "POST", { type: 'like' });
    },
    onSuccess: () => {
      refetchReactions();
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      return await apiRequest(`/api/posts/${post.id}/comments`, "POST", {
        content,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] }); // Refetch wallet when task is completed
      setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: "" }));
      setCommentImages((prev: Record<string, string>) => {
        const newState = { ...prev };
        delete newState[post.id];
        return newState;
      });

      // Auto expand comments
      const newExpanded = new Set(expandedPosts);
      newExpanded.add(post.id);
      setExpandedPosts(newExpanded);
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[post.id];
    const imageUrl = commentImages[post.id];

    // Require image upload
    if (!imageUrl) {
      toast({
        title: "صورة مطلوبة",
        description: "يجب إرفاق صورة مع التعليق لإثبات المهمة",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate({
      content: content || "",
      imageUrl: imageUrl || null,
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/groups/${groupId}/community?postId=${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط المنشور إلى الحافظة",
      });
    }).catch(() => {
      toast({
        title: "خطأ",
        description: "فشل نسخ الرابط",
        variant: "destructive",
      });
    });
  };

  const handleDeletePost = async () => {
    if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
      try {
        await apiRequest(`/api/posts/${post.id}`, "DELETE");
        toast({
          title: "تم الحذف",
          description: "تم حذف المنشور بنجاح",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
      } catch (err) {
        toast({
          title: "خطأ",
          description: "فشل حذف المنشور",
          variant: "destructive",
        });
      }
    }
  };

  const handlePinPost = async () => {
    try {
      await apiRequest(`/api/posts/${post.id}/pin`, "POST");
      toast({
        title: post.isPinned ? "تم إلغاء التثبيت" : "تم تثبيت المنشور",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل تثبيت المنشور",
        variant: "destructive",
      });
    }
  };

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سبب التقرير",
        variant: "destructive",
      });
      return;
    }
    try {
      await apiRequest(`/api/posts/${post.id}/report`, "POST", { reason: reportReason });
      toast({
        title: "تم إرسال التقرير",
        description: "شكراً لمساعدتك في الحفاظ على سلامة المجموعة",
      });
      setShowReportDialog(false);
      setReportReason("");
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل إرسال التقرير",
        variant: "destructive",
      });
    }
  };

  // Check if post has task information (from database fields)
  const hasTask = !!(post.taskTitle && post.taskReward);
  const taskTitle = post.taskTitle;
  const taskReward = post.taskReward;

  return (
    <Card 
      id={`post-${post.id}`}
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden ${
        hasTask 
          ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 shadow-purple-200/50" 
          : "bg-white/80 backdrop-blur-sm"
      }`}>
      <CardContent className="p-0">
        {/* Pinned Badge - Show if post is pinned */}
        {post.isPinned && (
          <div className="px-6 pt-4 pb-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-2 w-fit">
              <Bookmark className="h-4 w-4 fill-white" />
              مثبت
            </Badge>
          </div>
        )}

        {/* Task Badge - Show if post has task */}
        {hasTask && (
          <div className="px-6 pt-4 pb-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-2 w-fit">
              <Briefcase className="h-4 w-4" />
              مهمة تفاعلية
            </Badge>
          </div>
        )}

        {/* Enhanced Post Header */}
        <div className={`${hasTask ? "px-6 py-3" : "p-6"} flex items-start justify-between`}>
          <div className="flex items-center gap-4">
            <Avatar className={`${hasTask ? "w-12 h-12" : "w-14 h-14"} border-2 border-white shadow-lg ring-2 ${hasTask ? "ring-purple-200" : "ring-blue-100"}`}>
              <AvatarImage src={author?.profileImage} />
              <AvatarFallback className={`${hasTask ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-purple-600"} text-white font-bold`}>
                {author?.fullName?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${hasTask ? "text-purple-900" : "text-gray-900"} text-lg`}>{author?.fullName}</span>
                {isAuthorLeader && (
                  <Badge className={`${hasTask ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gradient-to-r from-blue-500 to-purple-600"} text-white text-xs px-3 py-1 rounded-full shadow-md`}>
                    قائد
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
                <span>•</span>
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthorLeader && (
                <>
                  <DropdownMenuItem onClick={handlePinPost} className="cursor-pointer">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {post.isPinned ? "إلغاء التثبيت" : "تثبيت المنشور"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeletePost} className="cursor-pointer text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف المنشور
                  </DropdownMenuItem>
                </>
              )}
              {currentUserId !== post.authorId && (
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="cursor-pointer text-orange-600">
                  <Flag className="w-4 h-4 mr-2" />
                  الإبلاغ عن المنشور
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Info Card - Show if post has task */}
        {hasTask && taskTitle && (
          <div className="px-6 py-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-600 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900 text-lg flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    {taskTitle}
                  </h4>
                  {taskReward && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg w-fit">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700">
                        المكافأة: ${taskReward}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Post Content */}
        <div className={`${hasTask ? "px-6 pb-2" : "px-6 pb-3"}`}>
          <p className={`${hasTask ? "text-purple-900 text-sm" : "text-gray-800"} whitespace-pre-wrap leading-relaxed text-base`}>
            {detectUrls(post.content)}
          </p>
        </div>

        {/* Enhanced Post Image */}
        {post.imageUrl && (
          <div className="mt-3 bg-gray-50">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full max-h-[600px] object-contain mx-auto"
            />
          </div>
        )}

        {/* Enhanced Post Stats */}
        <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {reactions.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 rounded-full">
                <ThumbsUp className="w-4 h-4 text-blue-500 fill-blue-500" />
                <span className="text-blue-700 font-semibold">{reactions.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hover:underline font-medium"
              onClick={() => {
                const newExpanded = new Set(expandedPosts);
                if (newExpanded.has(post.id)) {
                  newExpanded.delete(post.id);
                } else {
                  newExpanded.add(post.id);
                }
                setExpandedPosts(newExpanded);
              }}
            >
              {comments.length} تعليق
            </button>
          </div>
        </div>

        {/* Enhanced Post Actions */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
          <Button
            variant="ghost"
            className={`flex-1 gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl ${userReaction ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={() => toggleReactionMutation.mutate()}
          >
            <ThumbsUp className={`w-5 h-5 ${userReaction ? 'fill-blue-600' : ''}`} />
            <span className="font-semibold">أعجبني</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl"
            onClick={() => {
              const input = document.getElementById(`comment-input-${post.id}`);
              input?.focus();
            }}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">تعليق</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl"
            onClick={handleShare}
          >
            <Share className="w-5 h-5" />
            <span className="font-semibold">مشاركة</span>
          </Button>
        </div>

        {/* Report Dialog */}
        {showReportDialog && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-200 space-y-3">
            <h4 className="font-bold text-red-900">الإبلاغ عن المنشور</h4>
            <Textarea
              placeholder="اشرح سبب الإبلاغ..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleReportPost}
              >
                إرسال التقرير
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason("");
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Comments Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 space-y-5">
          {/* Enhanced Comments List */}
          {expandedPosts.has(post.id) && comments.length > 0 && (
            <div className="space-y-4 mb-4">
              {comments.map((comment) => {
                const commentAuthor = getMemberInfo(comment.authorId);
                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-10 h-10 mt-1 border-2 border-white shadow-md">
                      <AvatarImage src={commentAuthor?.profileImage} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-gray-200 to-gray-300">
                        {commentAuthor?.fullName?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl px-5 py-3 inline-block shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-sm text-gray-900">{commentAuthor?.fullName}</p>
                          {comment.isTaskCompleted && (
                            <Badge className="bg-green-100 text-green-700 px-2 py-1 text-xs font-semibold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              تم إكمال المهمة
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                        {comment.taskCompletionReward && (
                          <div className="mt-3 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2 w-fit">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">كسبت: ${comment.taskCompletionReward}</span>
                          </div>
                        )}
                      </div>
                      {comment.imageUrl && (
                        <img
                          src={comment.imageUrl}
                          alt="Comment attachment"
                          className="mt-3 rounded-xl max-h-48 object-cover border-2 border-white shadow-md"
                        />
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 px-2">
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Enhanced Comment Input */}
          <div className="flex gap-3 items-start">
            <Avatar className="w-10 h-10 border-2 border-white shadow-md">
              <AvatarImage src={getMemberInfo(currentUserId)?.profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getMemberInfo(currentUserId)?.fullName?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form onSubmit={handleCommentSubmit} className="relative">
                <Input
                  id={`comment-input-${post.id}`}
                  placeholder={hasTask ? "أرفق صورة لإثبات المهمة والحصول على المكافأة..." : "اكتب تعليقاً..."}
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: e.target.value }))}
                  className="bg-white border-gray-200 rounded-full pr-4 pl-24 py-6 focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all"
                    onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    id={`comment-image-${post.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file, 'comment', post.id);
                        if (url) {
                          setCommentImages((prev: Record<string, string>) => ({ ...prev, [post.id]: url }));
                        }
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!commentImages[post.id] || createCommentMutation.isPending}
                    className="p-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-purple-600 shadow-lg shadow-blue-500/30"
                    title={!commentImages[post.id] ? "يجب إرفاق صورة أولاً" : "إرسال"}
                  >
                    <Send className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              </form>
              {commentImages[post.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mt-3 inline-block"
                >
                  <img
                    src={commentImages[post.id]}
                    alt="Attachment"
                    className="h-24 rounded-xl border-2 border-white shadow-md"
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 hover:scale-110 transition-all"
                    onClick={() => setCommentImages((prev: Record<string, string>) => {
                      const newState = { ...prev };
                      delete newState[post.id];
                      return newState;
                    })}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Members List Component
function EnhancedMembersList({ members, getMemberInfo, isOnline, checkIsLeader }: { members: GroupMember[], getMemberInfo: any, isOnline: any, checkIsLeader: any }) {
  const [, navigate] = useLocation();
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const userType = localStorage.getItem("userType");
  
  // Get first 8 members
  const displayedMembers = members.slice(0, 8);

  return (
    <FadeInSection delay={0.25}>
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">أعضاء المجموعة</h3>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full shadow-md">
              {members.length}
            </Badge>
          </div>

          <div className="space-y-4">
            {displayedMembers.map((member) => {
              const info = getMemberInfo(member.freelancerId);
              if (!info) return null;

              const online = isOnline(info.lastSeen);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <Avatar className="w-11 h-11 border-2 border-white shadow-md ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                        <AvatarImage src={info.profileImage} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-gray-100 to-gray-200 font-semibold">
                          {info.fullName?.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 leading-none group-hover:text-blue-600 transition-colors">{info.fullName}</p>
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                        {checkIsLeader(member.freelancerId) ? (
                          <>
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {members.length > 8 && (
            <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-sm font-semibold rounded-xl">
              عرض كل الأعضاء ({members.length})
            </Button>
          )}
        </CardContent>
      </Card>
    </FadeInSection>
  );
}