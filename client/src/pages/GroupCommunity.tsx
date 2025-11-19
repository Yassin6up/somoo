import { useState } from "react";
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
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Image as ImageIcon, 
  Trash2,
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
  Flag,
  Search,
  Bell,
  Menu,
  Settings,
  Bookmark,
  Heart,
  Eye
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
  
  // Comment state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

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
            className="text-blue-500 hover:text-blue-600 underline inline-flex items-center gap-1"
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
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يجب اختيار صورة فقط",
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
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
      setNewPostContent("");
      setNewPostImage(null);
      toast({
        title: "تم نشر المنشور",
        description: "تم نشر منشورك بنجاح",
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل المجتمع...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">المجموعة غير موجودة</p>
            <Button
              variant="outline"
              onClick={() => navigate("/groups")}
              className="mt-4"
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
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Facebook-style Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Group Logo and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                {group.name.substring(0, 2)}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
            </div>

            {/* Center: Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'home', label: 'الرئيسية', icon: Home },
                { id: 'members', label: 'الأعضاء', icon: Users },
                { id: 'events', label: 'الفعاليات', icon: Calendar },
                { id: 'media', label: 'الوسائط', icon: ImageIcon },
                { id: 'files', label: 'الملفات', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Bell className="h-5 w-5" />
              </Button>
              
              {!isMember && !isLeader && userType === "freelancer" && (
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 shadow-md"
                  onClick={handleJoinGroup}
                  disabled={joinGroupMutation.isPending}
                >
                  {joinGroupMutation.isPending ? "جاري الانضمام..." : "الانضمام للمجموعة"}
                </Button>
              )}
              {(isMember || isLeader) && (
                <Button className="bg-green-500 hover:bg-green-600 text-white px-6 shadow-md">
                  <UserCheck className="ml-2 h-4 w-4" />
                  عضو في المجموعة
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Group Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">معلومات المجموعة</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الأعضاء</span>
                  <span className="font-semibold text-blue-600">{group.currentMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المنشورات</span>
                  <span className="font-semibold text-blue-600">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">تاريخ الإنشاء</span>
                  <span className="font-semibold text-blue-600">
                    {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الخصوصية</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    عام
                  </Badge>
                </div>
              </div>
            </div>

            {/* Group Rules */}
            {group.rules && group.rules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">قواعد المجموعة</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {group.rules.slice(0, 5).map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                {group.rules.length > 5 && (
                  <button className="text-blue-500 text-sm mt-2 hover:underline">
                    عرض المزيد
                  </button>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">الفعاليات القادمة</h3>
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 cursor-pointer transition-colors">
                      <p className="font-medium text-sm text-gray-900">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            {group.tags && group.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">الوسوم الشائعة</h3>
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
              </div>
            )}
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-2 space-y-4">
            {/* Create Post - Only for Leader */}
            {isLeader && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={currentUser?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {currentUser?.fullName?.substring(0, 2) || "Me"}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => document.getElementById('post-composer')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 text-right px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors text-sm font-medium"
                  >
                    ما الذي تريد مشاركته مع المجموعة؟
                  </button>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => document.getElementById('post-image-input')?.click()}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">صورة</span>
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
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">ملف</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">فعالية</span>
                  </button>
                </div>
              </div>
            )}

            {/* Post Composer - Only for Leader */}
            {isLeader && (
              <div id="post-composer" className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={currentUser?.profileImage} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {currentUser?.fullName?.substring(0, 2) || "Me"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{currentUser?.fullName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="h-3 w-3" />
                      <span>عام • مجموعة {group.name}</span>
                    </div>
                  </div>
                </div>

                <Textarea
                  placeholder="ما الذي تريد مشاركته مع المجموعة؟"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="resize-none min-h-[120px] border-0 text-lg focus:ring-0 placeholder:text-gray-500 text-gray-900"
                />
                
                {newPostImage && (
                  <div className="relative mt-3 rounded-lg overflow-hidden border">
                    <img
                      src={newPostImage}
                      alt="معاينة"
                      className="w-full max-h-96 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 border-0 shadow-lg"
                      onClick={() => setNewPostImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('post-image-input')?.click()}
                      disabled={isUploadingPostImage}
                      className="text-gray-600 hover:text-gray-700 border border-gray-300"
                    >
                      <ImageIcon className="h-4 w-4 ml-2" />
                      {isUploadingPostImage ? "جاري الرفع..." : "إضافة صورة"}
                    </Button>
                  </div>

                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 shadow-md"
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || (!newPostContent.trim() && !newPostImage)}
                  >
                    {createPostMutation.isPending ? "جاري النشر..." : "نشر"}
                  </Button>
                </div>
              </div>
            )}

            {/* Pinned Posts */}
            {posts.filter(post => post.isPinned).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">منشورات مثبتة</h3>
                </div>
                <div className="space-y-3">
                  {posts.filter(post => post.isPinned).map(post => (
                    <PinnedPostCard
                      key={post.id}
                      post={post}
                      getMemberInfo={getMemberInfo}
                      checkIsLeader={checkIsLeader}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="animate-pulse">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">جاري تحميل المنشورات...</p>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد منشورات بعد</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {isLeader ? "يمكنك نشر أول منشور في المجموعة!" : "قائد المجموعة لم ينشر أي شيء بعد!"}
                  </p>
                </div>
              ) : (
                posts.filter(post => !post.isPinned).map(post => (
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
                  />
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Members Card */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">الأعضاء ({membersList.length})</h3>
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  عرض الكل
                </Button>
              </div>
              <div className="space-y-3">
                {membersList.slice(0, 6).map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarImage src={member.profileImage || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          {member.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline(member.lastSeen) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {isOnline(member.lastSeen) ? (
                          <span className="text-green-600">نشط الآن</span>
                        ) : (
                          `آخر ظهور ${formatDistanceToNow(new Date(member.lastSeen || Date.now()), { addSuffix: true, locale: ar })}`
                        )}
                      </p>
                    </div>
                    {checkIsLeader(member.id) && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Media */}
            {recentMedia.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">آخر الوسائط</h3>
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                    عرض الكل
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {recentMedia.map((mediaItem, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <img
                        src={mediaItem.imageUrl!}
                        alt="وسائط"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Description */}
            {group.description && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">حول المجموعة</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{group.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{group.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>أنشئت {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>مجموعة {group.service} متخصصة</span>
                  </div>
                </div>
              </div>
            )}

            {/* Group Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">إحصائيات المجموعة</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">نشاط الأعضاء</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">معدل التفاعل</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">نمو الأعضاء</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Pinned Post Card Component
function PinnedPostCard({ post, getMemberInfo, checkIsLeader }: {
  post: GroupPost;
  getMemberInfo: (id: string) => Freelancer | undefined;
  checkIsLeader: (id: string) => boolean;
}) {
  const author = getMemberInfo(post.authorId);

  return (
    <div className="bg-white border border-yellow-300 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="h-4 w-4 text-yellow-600 fill-yellow-600" />
        <span className="text-xs font-medium text-yellow-700">مثبت</span>
      </div>
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={author?.profileImage || undefined} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {author?.fullName.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-gray-900">{author?.fullName}</p>
            {checkIsLeader(post.authorId) && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="صورة المنشور"
              className="mt-2 max-h-32 rounded-lg border"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Facebook-inspired Post Card (Keep the existing PostCard component but enhance it)
// ... [Previous PostCard component remains the same with Facebook styling] ...

// Add missing Globe icon component
function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

// Enhanced PostCard component with Facebook styling (same as before but with better design)
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
}: {
  post: GroupPost;
  groupId: string;
  currentUserId: string | null;
  getMemberInfo: (id: string) => Freelancer | undefined;
  checkIsLeader: (id: string) => boolean;
  commentInputs: Record<string, string>;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  commentImages: Record<string, string>;
  setCommentImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  expandedPosts: Set<string>;
  setExpandedPosts: React.Dispatch<React.SetStateAction<Set<string>>>;
  toast: any;
  detectUrls: (text: string) => (string | JSX.Element)[];
  handleImageUpload: (file: File, type: 'post' | 'comment', postId?: string) => Promise<string | null>;
}) {
  const author = getMemberInfo(post.authorId);
  const isExpanded = expandedPosts.has(post.id);

  // Fetch comments for this post
  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: isExpanded,
  });

  // Fetch reactions
  const { data: reactions = [] } = useQuery<any[]>({
    queryKey: [`/api/posts/${post.id}/reactions`],
  });

  const userReaction = reactions.find(r => r.userId === currentUserId);
  const hasLiked = userReaction?.reactionType === 'like';

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        return await apiRequest(`/api/posts/${post.id}/reactions`, "DELETE", {});
      } else {
        return await apiRequest(`/api/posts/${post.id}/reactions`, "POST", {
          reactionType: 'like',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
    },
  });

  // Add comment mutation (with image required)
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      if (!imageUrl) {
        throw new Error("الصورة مطلوبة للتعليق");
      }
      return await apiRequest(`/api/posts/${post.id}/comments`, "POST", {
        content,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      setCommentInputs(prev => ({ ...prev, [post.id]: "" }));
      setCommentImages(prev => ({ ...prev, [post.id]: "" }));
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة التعليق",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/groups/${groupId}/posts/${post.id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      toast({
        title: "تم حذف المنشور",
        description: "تم حذف المنشور بنجاح",
      });
    },
  });

  const canDelete = currentUserId && (post.authorId === currentUserId || checkIsLeader(currentUserId));

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={author?.profileImage || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                {author?.fullName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{author?.fullName}</p>
                {checkIsLeader(post.authorId) && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs border-0">
                    <Star className="h-3 w-3 ml-1 fill-yellow-500" />
                    قائد
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}</span>
                <span>•</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deletePostMutation.mutate()}
                disabled={deletePostMutation.isPending}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3">
          <p className="text-gray-900 whitespace-pre-wrap text-[15px] leading-relaxed">
            {detectUrls(post.content)}
          </p>
        </div>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="border-y">
          <img
            src={post.imageUrl}
            alt="صورة المنشور"
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">
                  👍
                </div>
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">
                  ❤️
                </div>
              </div>
              <span>{reactions.length}</span>
            </div>
            <span>{comments.length} تعليق • {post.sharesCount} مشاركة</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1">
        <div className="flex items-center border-t">
          <Button
            variant="ghost"
            className={`flex-1 gap-2 py-3 h-auto ${hasLiked ? "text-blue-600" : "text-gray-600"}`}
            onClick={() => toggleLikeMutation.mutate()}
            disabled={toggleLikeMutation.isPending}
          >
            <ThumbsUp className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">إعجاب</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 py-3 h-auto text-gray-600"
            onClick={() => {
              const newExpanded = new Set(expandedPosts);
              if (isExpanded) {
                newExpanded.delete(post.id);
              } else {
                newExpanded.add(post.id);
              }
              setExpandedPosts(newExpanded);
            }}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">تعليق</span>
          </Button>
          <Button variant="ghost" className="flex-1 gap-2 py-3 h-auto text-gray-600">
            <Share className="h-5 w-5" />
            <span className="text-sm font-medium">مشاركة</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {/* Add Comment */}
          {currentUserId && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
                    Me
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="bg-white rounded-full border px-4 py-2 shadow-sm">
                    <Input
                      placeholder="اكتب تعليق..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="border-0 focus:ring-0 placeholder:text-gray-500"
                    />
                  </div>
                  
                  {/* Comment Image Upload */}
                  <div className="flex items-center gap-2">
                    {!commentImages[post.id] ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                          className="text-gray-500 hover:text-gray-700 border border-gray-300"
                        >
                          <Camera className="h-4 w-4 ml-2" />
                          إضافة صورة
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`comment-image-${post.id}`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleImageUpload(file, 'comment', post.id);
                              if (url) {
                                setCommentImages(prev => ({ ...prev, [post.id]: url }));
                              }
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="relative">
                        <img
                          src={commentImages[post.id]}
                          alt="معاينة الصورة"
                          className="h-20 rounded-lg border shadow-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 left-1 h-6 w-6 p-0 bg-black/60 hover:bg-black/80 border-0"
                          onClick={() => setCommentImages(prev => ({ ...prev, [post.id]: "" }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {(commentInputs[post.id]?.trim() || commentImages[post.id]) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (commentInputs[post.id]?.trim() && commentImages[post.id]) {
                          addCommentMutation.mutate({
                            content: commentInputs[post.id],
                            imageUrl: commentImages[post.id],
                          });
                        } else if (!commentImages[post.id]) {
                          toast({
                            title: "صورة مطلوبة",
                            description: "يجب إضافة صورة للتعليق",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={addCommentMutation.isPending || !commentInputs[post.id]?.trim() || !commentImages[post.id]}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      {addCommentMutation.isPending ? "جاري الإرسال..." : "إرسال التعليق"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="px-4 pb-4 space-y-3">
              {comments.map(comment => {
                const commentAuthor = getMemberInfo(comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={commentAuthor?.profileImage || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs">
                        {commentAuthor?.fullName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl px-3 py-2 border shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900">{commentAuthor?.fullName}</p>
                          {checkIsLeader(comment.authorId) && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
                        {comment.imageUrl && (
                          <img
                            src={comment.imageUrl}
                            alt="صورة التعليق"
                            className="mt-2 max-h-48 rounded-lg border shadow-sm"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 px-2 text-xs text-gray-500">
                        <button className="hover:underline font-medium">إعجاب</button>
                        <span className="text-gray-400">•</span>
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}