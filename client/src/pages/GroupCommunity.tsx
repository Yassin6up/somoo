import { useState, useRef, useEffect } from "react";
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
  isTaskPost?: boolean;
  taskUrl?: string | null;
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  createdAt: Date;
  isTaskCompleted?: boolean;
  taskCompletionReward?: string;
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

  // Fetch group tasks for completion detection
  interface GroupTask {
    id: string;
    groupId: string;
    freelancerId: string | null;
    title: string;
    description: string;
    status: string; // available | assigned | in_progress | submitted | approved | rejected
    reward: string;
    netReward: string;
    createdAt: string;
    taskUrl?: string | null;
  }
  const { data: groupTasks = [] } = useQuery<GroupTask[]>({
    queryKey: ['/api/groups', groupId, 'tasks'],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!groupId,
    refetchInterval: 20000,
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

  // URL detection and bold markdown function
  const detectUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const boldRegex = /\*\*(.+?)\*\*/g;

    return text.split(urlRegex).map((segment, i) => {
      // If segment is a URL, render as link
      if (segment.match(urlRegex)) {
        return (
          <a
            key={`url-${i}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1 font-medium"
          >
            {segment}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }

      // Handle bold markdown **text** inside non-URL segments
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = boldRegex.exec(segment)) !== null) {
        const [full, inner] = match;
        const start = match.index;
        const end = start + full.length;

        if (start > lastIndex) {
          parts.push(segment.slice(lastIndex, start));
        }
        parts.push(<strong key={`bold-${i}-${start}`} className="font-bold">{inner}</strong>);
        lastIndex = end;
      }

      if (lastIndex < segment.length) {
        parts.push(segment.slice(lastIndex));
      }

      return parts.length ? parts : segment;
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
        imageUrl
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المجتمع...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Card className="max-w-md border border-gray-200 rounded-lg">
          <CardContent className="pt-6 text-center p-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">المجموعة غير موجودة</p>
            <Button
              variant="outline"
              onClick={() => navigate("/groups")}
              className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
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
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Group Logo and Name */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold border border-gray-200">
                  {group.name.substring(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {group.currentMembers} عضو
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">لا توجد إشعارات جديدة</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif: any, index: number) => (
                          <div key={index} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'task_assigned' ? 'bg-purple-100' :
                                  notif.type === 'new_member' ? 'bg-blue-100' :
                                    'bg-green-100'
                                }`}>
                                {notif.type === 'task_assigned' ? <Star className="w-4 h-4 text-purple-600" /> :
                                  notif.type === 'new_member' ? <Users className="w-4 h-4 text-blue-600" /> :
                                    <MessageSquare className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
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
                    <div className="p-2 bg-gray-50 text-center">
                      <button className="text-sm text-gray-600 hover:text-gray-900" onClick={() => {
                        let url = `/freelancer-dashboard/notifications`
                        if (userType !== "freelancer") {
                          url = `/product-owner-dashboard/notifications`
                        }
                        navigate(url)
                      }}>عرض كل الإشعارات</button>
                    </div>
                  </div>
                )}
              </div>

              {!isMember && !isLeader && userType === "freelancer" && (
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4"
                  onClick={handleJoinGroup}

                 disabled={joinGroupMutation.isPending}
                >
              <UserPlus className="ml-2 h-4 w-4" />
              {joinGroupMutation.isPending ? "جاري الانضمام..." : "انضم الآن"}
            </Button>
              )}
            {(isMember || isLeader) && (
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <UserCheck className="ml-2 h-4 w-4" />
                عضو نشط
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Search Bar */ }
  {
    showSearch && (
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث في المنشورات والتعليقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-gray-300 focus:border-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  {/* Admin-Only Notice */ }
  {
    !isLeader && (isMember || isLeader) && (
      <div className="bg-amber-50 border border-amber-200 p-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">ملاحظة هامة</p>
              <p className="text-xs text-amber-700">فقط قائد المجموعة يمكنه نشر المنشورات في هذه المجموعة</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  {/* Main Content */ }
  <div className="container mx-auto px-4 py-6 max-w-7xl">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <aside className="lg:col-span-3 space-y-4">
        {/* Group Info Card */}
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">معلومات المجموعة</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2 text-sm">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  الأعضاء
                </span>
                <span className="font-semibold text-gray-900">{group.currentMembers}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2 text-sm">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  المنشورات
                </span>
                <span className="font-semibold text-gray-900">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  تاريخ الإنشاء
                </span>
                <span className="font-semibold text-gray-900 text-xs">
                  {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Description */}
        {group.description && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">عن المجموعة</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{group.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">إجراءات سريعة</h3>
            </div>
            <div className="space-y-2">
              {isLeader && (
                <button
                  onClick={() => navigate(`/groups/${groupId}/dashboard`)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-medium text-sm text-gray-900">لوحة التحكم</p>
                    <p className="text-xs text-gray-500">إدارة المجموعة والأعضاء</p>
                  </div>
                </button>
              )}
              {userType === "product_owner" && group?.leaderId && (
                <button
                  onClick={() => navigate(`/chat/${group.leaderId}`)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-medium text-sm text-gray-900">محادثة القائد</p>
                    <p className="text-xs text-gray-500">تواصل مع قائد المجموعة</p>
                  </div>
                </button>
              )}
              <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-medium text-sm text-gray-900">الفعاليات</p>
                  <p className="text-xs text-gray-500">عرض الفعاليات القادمة</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <MembersList
          members={members}
          getMemberInfo={getMemberInfo}
          isOnline={isOnline}
          checkIsLeader={checkIsLeader}
        />
      </aside>

      {/* Main Feed */}
      <main className="lg:col-span-6 space-y-4">
        {/* Create Post - Only for Leader */}
        {!isLeader && isMember && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">فقط قائد المجموعة</p>
                  <p className="text-sm text-gray-600">يمكن لقائد المجموعة فقط نشر المنشورات والمهام في هذه المجموعة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLeader && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10 border border-gray-200">
                  <AvatarImage src={currentUser?.profileImage} />
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {currentUser?.fullName?.substring(0, 2) || "Me"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="شارك شيئاً مميزاً مع المجموعة..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="resize-none min-h-[100px] border-gray-300 focus:border-gray-400 text-gray-900"
                  />
                </div>
              </div>

              {newPostImage && (
                <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={newPostImage}
                    alt="معاينة"
                    className="w-full max-h-80 object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 border-0 rounded-full"
                    onClick={() => setNewPostImage(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Separator className="mb-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => document.getElementById('post-image-input')?.click()}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-600"
                  >
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">صورة</span>
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
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending || (!newPostContent.trim() && !newPostImage)}
                >
                  {createPostMutation.isPending ? "جاري النشر..." : "نشر"}
                  <Send className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {postsLoading ? (
            <Card className="border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منشورات بعد</h3>
              <p className="text-gray-500">
                {isLeader ? "كن أول من ينشر في هذه المجموعة!" : "قائد المجموعة لم ينشر أي شيء بعد."}
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
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
                groupTasks={groupTasks}
              />
            ))
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="lg:col-span-3 space-y-4">
        {/* Pinned Posts Section */}
        {posts.filter(p => p.isPinned).length > 0 && (
          <Card className="border border-amber-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">المنشورات المثبتة</h3>
              </div>
              <div className="space-y-2">
                {posts.filter(p => p.isPinned).map((pinnedPost) => (
                  <div
                    key={pinnedPost.id}
                    className="p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    onClick={() => document.getElementById(`post-${pinnedPost.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bookmark className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">مثبت</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{pinnedPost.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(pinnedPost.createdAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">الفعاليات القادمة</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  عرض الكل
                </Button>
              </div>
              <div className="space-y-2">
                {upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <p className="font-medium text-sm text-gray-900">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>{formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: ar })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Tags */}
        {group.tags && group.tags.length > 0 && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">الوسوم الشائعة</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.tags.slice(0, 8).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Rules */}
        {group.rules && group.rules.length > 0 && (
          <Card className="border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Flag className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">قواعد المجموعة</h3>
              </div>
              <div className="space-y-2">
                {group.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  </div>
    </div >
  );
}

// Post Card Component
function PostCard({
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
  handleImageUpload,
  groupTasks
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
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: "" }));
      setCommentImages((prev: Record<string, string>) => {
        const newState = { ...prev };
        delete newState[post.id];
        return newState;
      });

      const newExpanded = new Set(expandedPosts);
      newExpanded.add(post.id);
      setExpandedPosts(newExpanded);

      toast({
        title: "تم بنجاح",
        description: "تم إرسال تعليقك بنجاح",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "حدث خطأ أثناء إرسال التعليق";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[post.id];
    const imageUrl = commentImages[post.id];

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

  // Task detection
  const taskTitle = post.taskTitle;
  const taskReward = post.taskReward;
  const hasTask = post.isTaskPost === true || !!(taskTitle && taskReward);

  // Completion detection
  let relatedTasks: any[] = [];
  if (hasTask && Array.isArray(groupTasks)) {
    relatedTasks = groupTasks.filter((t: any) => {
      if (t.taskUrl && typeof t.taskUrl === 'string' && t.taskUrl.includes(post.id)) return true;
      if (!t.taskUrl && taskTitle && t.title && t.title.trim().toLowerCase() === taskTitle.trim().toLowerCase()) return true;
      return false;
    });
  }
  const totalTasks = relatedTasks.length;
  const approvedCount = relatedTasks.filter(t => t.status === 'approved').length;
  const allApproved = totalTasks > 0 && approvedCount === totalTasks;

  return (
    <Card
      id={`post-${post.id}`}
      className={`border border-gray-200 rounded-lg ${allApproved
          ? "bg-green-50 border-green-300"
          : hasTask
            ? "bg-blue-50 border-blue-300"
            : "bg-white"
        }`}>
      <CardContent className="p-4">
        {/* Pinned Badge */}
        {post.isPinned && (
          <div className="mb-3">
            <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
              <Bookmark className="h-3 w-3 ml-1" />
              مثبت
            </Badge>
          </div>
        )}

        {/* Task / Completion Badges */}
        {hasTask && !allApproved && (
          <div className="mb-3">
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              <Briefcase className="h-3 w-3 ml-1" /> مهمة تفاعلية
            </Badge>
          </div>
        )}
        {allApproved && (
          <div className="mb-3">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <Award className="h-3 w-3 ml-1" /> المهمة مكتملة
            </Badge>
          </div>
        )}

        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-gray-200">
              <AvatarImage src={author?.profileImage} />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {author?.fullName?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{author?.fullName}</span>
                {isAuthorLeader && (
                  <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5">
                    قائد
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
                <span>•</span>
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isAuthorLeader && (
                <>
                  <DropdownMenuItem onClick={handlePinPost} className="cursor-pointer">
                    <Bookmark className="w-4 h-4 ml-2" />
                    {post.isPinned ? "إلغاء التثبيت" : "تثبيت المنشور"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeletePost} className="cursor-pointer text-red-600">
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف المنشور
                  </DropdownMenuItem>
                </>
              )}
              {currentUserId !== post.authorId && (
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="cursor-pointer text-orange-600">
                  <Flag className="w-4 h-4 ml-2" />
                  الإبلاغ عن المنشور
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Info Card */}
        {hasTask && taskTitle && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-gray-600" />
                  {taskTitle}
                </h4>
                {taskReward && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded w-fit">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      المكافأة: ${taskReward}
                    </span>
                  </div>
                )}
              </div>
              {hasTask && totalTasks > 0 && (
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-gray-600">المهام: {totalTasks}</div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${allApproved ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(approvedCount / totalTasks) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {approvedCount} / {totalTasks} مكتملة
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
            {detectUrls(post.content)}
          </p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-3 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full max-h-80 object-contain mx-auto"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            {reactions.length > 0 && (
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <ThumbsUp className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-gray-700 font-medium">{reactions.length}</span>
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

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-2 mb-3">
          <Button
            variant="ghost"
            className={`flex-1 gap-2 hover:bg-gray-50 ${userReaction ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={() => toggleReactionMutation.mutate()}
          >
            <ThumbsUp className={`w-4 h-4 ${userReaction ? 'fill-blue-600' : ''}`} />
            <span className="text-sm">أعجبني</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-gray-600 hover:bg-gray-50"
            onClick={() => {
              const input = document.getElementById(`comment-input-${post.id}`);
              input?.focus();
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">تعليق</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-gray-600 hover:bg-gray-50"
            onClick={handleShare}
          >
            <Share className="w-4 h-4" />
            <span className="text-sm">مشاركة</span>
          </Button>
        </div>

        {/* Report Dialog */}
        {showReportDialog && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
            <h4 className="font-semibold text-red-900 text-sm">الإبلاغ عن المنشور</h4>
            <Textarea
              placeholder="اشرح سبب الإبلاغ..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="text-sm min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
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

        {/* Comments Section */}
        <div className="space-y-3">
          {/* Comments List */}
          {expandedPosts.has(post.id) && comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => {
                const commentAuthor = getMemberInfo(comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage src={commentAuthor?.profileImage} />
                      <AvatarFallback className="text-xs bg-gray-100">
                        {commentAuthor?.fullName?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2 inline-block">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900">{commentAuthor?.fullName}</p>
                          {comment.isTaskCompleted && (
                            <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                              <Award className="w-3 h-3 ml-1" />
                              تم إكمال المهمة
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                        {comment.taskCompletionReward && (
                          <div className="mt-2 bg-green-50 px-2 py-1 rounded flex items-center gap-1 w-fit">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">كسبت: ${comment.taskCompletionReward}</span>
                          </div>
                        )}
                      </div>
                      {comment.imageUrl && (
                        <img
                          src={comment.imageUrl}
                          alt="Comment attachment"
                          className="mt-2 rounded-lg max-h-32 object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 px-1">
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Input */}
          <div className="flex gap-2 items-start">
            <Avatar className="w-8 h-8 border border-gray-200">
              <AvatarImage src={getMemberInfo(currentUserId)?.profileImage} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {getMemberInfo(currentUserId)?.fullName?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form onSubmit={handleCommentSubmit} className="relative">
                <Input
                  id={`comment-input-${post.id}`}
                  placeholder={hasTask && !allApproved ? "أرفق صورة لإثبات المهمة..." : "اكتب تعليقاً..."}
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: e.target.value }))}
                  className="bg-white border-gray-300 rounded-lg pr-4 pl-20 py-2 text-sm"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors"
                    onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                  >
                    <Camera className="w-4 h-4" />
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
                    disabled={(hasTask && !allApproved && !commentImages[post.id]) || createCommentMutation.isPending}
                    className="p-1 text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                    title={hasTask && !allApproved && !commentImages[post.id] ? "يجب إرفاق صورة أولاً" : "إرسال"}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              {commentImages[post.id] && (
                <div className="relative mt-2 inline-block">
                  <img
                    src={commentImages[post.id]}
                    alt="Attachment"
                    className="h-20 rounded-lg border border-gray-200"
                  />
                  <button
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    onClick={() => setCommentImages((prev: Record<string, string>) => {
                      const newState = { ...prev };
                      delete newState[post.id];
                      return newState;
                    })}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Members List Component
function MembersList({ members, getMemberInfo, isOnline, checkIsLeader }: { members: GroupMember[], getMemberInfo: any, isOnline: any, checkIsLeader: any }) {
  const [, navigate] = useLocation();
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;
  const userType = localStorage.getItem("userType");

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