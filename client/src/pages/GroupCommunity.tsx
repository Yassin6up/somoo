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
  ChevronRight
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
  portfolioImages: string[] | null;
  createdAt: Date;
}

interface GroupMember {
  id: string;
  groupId: string;
  freelancerId: string;
  joinedAt: Date;
}

interface Freelancer {
  id: string;
  fullName: string;
  username: string;
  profileImage: string | null;
  lastSeen: Date | null;
}

interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
}

export default function GroupCommunity() {
  const { id: groupId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
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
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
  });

  // Fetch group members
  const { data: members = [] } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${groupId}/members`],
  });

  // Check if current user is a member
  const isMember = members.some(m => m.freelancerId === currentUserId);
  const isLeader = group?.leaderId === currentUserId;

  // Fetch freelancers info for members
  const { data: freelancers = [] } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
  });

  // Fetch posts (all posts)
  const { data: posts = [], isLoading: postsLoading } = useQuery<GroupPost[]>({
    queryKey: ['/api/groups', groupId, 'posts'],
  });

  // Fetch popular posts
  const { data: popularPosts = [] } = useQuery<GroupPost[]>({
    queryKey: ['/api/groups', groupId, 'posts', 'popular'],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/posts?sort=popular`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch popular posts");
      return response.json();
    },
  });

  // Fetch media posts
  const { data: mediaPosts = [] } = useQuery<GroupPost[]>({
    queryKey: ['/api/groups', groupId, 'posts', 'media'],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/posts?mediaOnly=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Failed to fetch media posts");
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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      return await apiRequest(`/api/groups/${groupId}/posts`, "POST", {
        content,
        imageUrl,
      });
    },
    onSuccess: () => {
      // Invalidate all post-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts', 'popular'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts', 'media'] });
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
          <Users className="w-12 h-12 text-[#002e62] mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل المجتمع...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
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

  const postsCount = posts.length;
  const mediaCount = mediaPosts.length;
  const eventsCount = 0; // TODO: Implement events

  return (
    <div className="min-h-screen bg-[#0A0A0B]" dir="rtl">
      {/* Three Column Layout */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem,1fr,18rem] gap-4">
          {/* Left Sidebar - Navigation */}
          <aside className="hidden lg:block">
            <div className="bg-[#17181C] rounded-xl p-3 space-y-1">
              <NavItem icon={Home} label="الخلاصة" active />
              <NavItem icon={Users} label="الأصدقاء" />
              <NavItem icon={Calendar} label="الأحداث" />
              <NavItem icon={Video} label="مشاهدة الفيديو" />
              <NavItem icon={ImageIcon} label="الصور" />
              <NavItem icon={FileText} label="الملفات" />
              <NavItem icon={ShoppingBag} label="السوق" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-4">
            {/* Cover Section */}
            <div className="bg-[#17181C] rounded-xl overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 overflow-hidden">
                {group.groupImage ? (
                  <img
                    src={group.groupImage}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 left-3 bg-[#17181C]/80 hover:bg-[#17181C] text-white border-0"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  data-testid="button-edit-profile"
                >
                  تعديل صورة الغلاف
                </Button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  {/* Group Avatar */}
                  <div className="w-24 h-24 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white text-3xl font-bold -mt-16 border-4 border-[#17181C] shadow-xl">
                    {group.name.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {group.name}
                    </h1>
                    <p className="text-gray-400 text-sm">{group.service}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <StatBox label="المنشورات" value={postsCount} />
                  <StatBox label="الأعضاء" value={group.currentMembers} />
                  <StatBox label="الوسائط" value={mediaCount} />
                  <StatBox label="الأحداث" value={eventsCount} />
                </div>

                {/* Members Avatars */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">الأعضاء × {group.currentMembers.toLocaleString('ar')}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-white/5"
                      data-testid="button-see-all-members"
                    >
                      عرض الكل
                    </Button>
                  </div>
                  <div className="flex -space-x-2">
                    {membersList.slice(0, 10).map((member) => (
                      <Avatar key={member.id} className="border-2 border-[#17181C] w-10 h-10 hover:scale-110 transition-transform cursor-pointer">
                        <AvatarImage src={member.profileImage || undefined} />
                        <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                          {member.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {membersList.length > 10 && (
                      <div className="w-10 h-10 rounded-full bg-[#1F2937] border-2 border-[#17181C] flex items-center justify-center text-xs font-semibold text-gray-300 hover:scale-110 transition-transform cursor-pointer">
                        +{membersList.length - 10}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isMember && !isLeader && userType === "freelancer" && (
                    <Button 
                      className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]" 
                      onClick={handleJoinGroup}
                      disabled={joinGroupMutation.isPending}
                      data-testid="button-join-group"
                    >
                      الانضمام للجروب
                    </Button>
                  )}
                  {(isMember || isLeader) && (
                    <Button 
                      className="flex-1 bg-[#22C55E] hover:bg-[#16A34A]"
                      disabled
                      data-testid="button-already-member"
                    >
                      <UserCheck className="ml-2 h-4 w-4" />
                      عضو
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-white/5"
                    onClick={() => navigate(`/groups/${groupId}/chat`)}
                    data-testid="button-send-message"
                  >
                    إرسال رسالة
                  </Button>
                </div>
              </div>
            </div>

            {/* Group Created By */}
            {group.leaderId && getMemberInfo(group.leaderId) && (
              <div className="bg-[#17181C] rounded-xl p-5">
                <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  تم إنشاء الجروب بواسطة
                </h3>
                <div className="flex items-center gap-3 p-3 bg-[#1F2937] rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getMemberInfo(group.leaderId)?.profileImage || undefined} />
                    <AvatarFallback className="bg-[#3B82F6] text-white">
                      {getMemberInfo(group.leaderId)?.fullName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{getMemberInfo(group.leaderId)?.fullName}</p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}</p>
                  </div>
                  <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                    + متابعة
                  </Button>
                </div>
              </div>
            )}

            {/* About Group */}
            {group.description && (
              <div className="bg-[#17181C] rounded-xl p-5">
                <h3 className="text-white text-sm font-semibold mb-4">حول الجروب</h3>
                <p className="text-gray-300 leading-relaxed text-sm mb-4">{group.description}</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{group.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{group.currentMembers} من {group.maxMembers} عضو</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>تم الإنشاء {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: ar })}</span>
                  </div>
                </div>
                <Separator className="my-4 bg-gray-700" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  مجموعة تجمع المحترفين في {group.service}. نشارك الخبرات ونتعاون في المشاريع. #دبوبلة #بورتفوليو #محتوى #تصميم
                </p>
              </div>
            )}

            {/* Create Post Box */}
            {currentUserId && (
              <div className="bg-[#17181C] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={currentUser?.profileImage} />
                    <AvatarFallback className="bg-[#3B82F6] text-white">
                      {currentUser?.fullName?.substring(0, 2) || "Me"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="ما الذي تفكر فيه؟"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="resize-none min-h-[80px] bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="textarea-new-post"
                    />
                    
                    {newPostImage && (
                      <div className="relative inline-block">
                        <img
                          src={newPostImage}
                          alt="معاينة"
                          className="max-h-48 rounded-lg border border-gray-700"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 left-2"
                          onClick={() => setNewPostImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white hover:bg-white/5"
                          size="sm"
                          onClick={() => document.getElementById('post-image-input')?.click()}
                          disabled={isUploadingPostImage}
                        >
                          <ImageIcon className="h-4 w-4 ml-2" />
                          {isUploadingPostImage ? "جاري الرفع..." : "صورة"}
                        </Button>
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
                        className="bg-[#3B82F6] hover:bg-[#2563EB]"
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending || (!newPostContent.trim() && !newPostImage)}
                        data-testid="button-create-post"
                      >
                        {createPostMutation.isPending ? "جاري النشر..." : "نشر"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
              {postsLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">جاري تحميل المنشورات...</p>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد منشورات بعد</p>
                    <p className="text-sm text-gray-500 mt-2">كن أول من ينشر في هذا المجتمع!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    groupId={groupId}
                    currentUserId={currentUserId}
                    getMemberInfo={getMemberInfo}
                    isLeader={isLeader}
                    commentInputs={commentInputs}
                    setCommentInputs={setCommentInputs}
                    expandedPosts={expandedPosts}
                    setExpandedPosts={setExpandedPosts}
                    toast={toast}
                  />
                ))
              )}
            </div>

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
              <div className="bg-[#17181C] rounded-xl p-5">
                <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  المنشورات الشائعة
                </h3>
                <div className="space-y-3">
                  {popularPosts.slice(0, 3).map(post => {
                    const author = getMemberInfo(post.authorId);
                    return (
                      <div key={post.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={author?.profileImage || undefined} />
                          <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                            {author?.fullName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-white">{author?.fullName}</p>
                            {checkIsLeader(post.authorId) && (
                              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs border-0">
                                <Star className="h-3 w-3 ml-1 fill-amber-400" />
                                قائد
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2 mt-1">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {post.likesCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.commentsCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Gallery */}
            {mediaPosts.length > 0 && (
              <div className="bg-[#17181C] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    الوسائط
                  </h3>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
                    عرض الكل
                    <ChevronRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {mediaPosts.slice(0, 8).map(post => (
                    <div key={post.id} className="aspect-square relative overflow-hidden rounded-lg bg-[#1F2937] hover:opacity-80 cursor-pointer transition-opacity">
                      <img
                        src={post.imageUrl!}
                        alt="وسائط"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Members, Friends, Groups */}
          <aside className="hidden lg:block space-y-4">
            {/* YOUR PAGES Section */}
            <div className="bg-[#17181C] rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">صفحاتك</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 bg-[#3B82F6] rounded flex items-center justify-center text-white text-sm font-bold">
                    {group.name.substring(0, 2)}
                  </div>
                  <span className="text-sm">{group.name}</span>
                </div>
              </div>
            </div>

            {/* FRIENDS Section */}
            <div className="bg-[#17181C] rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">الأصدقاء</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {membersList.slice(0, 10).map(member => (
                  <div key={member.id} className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/5">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.profileImage || undefined} />
                        <AvatarFallback className="bg-[#3B82F6] text-white text-xs">
                          {member.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#17181C] ${
                          isOnline(member.lastSeen) ? "bg-green-500" : "bg-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate flex items-center gap-1.5">
                        {member.fullName}
                        {checkIsLeader(member.id) && (
                          <Star className="h-3 w-3 text-yellow-500 flex-shrink-0 fill-yellow-500" />
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isOnline(member.lastSeen) ? "نشط" : formatDistanceToNow(new Date(member.lastSeen || Date.now()), { locale: ar, addSuffix: false })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GROUPS Section */}
            <div className="bg-[#17181C] rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">المجموعات</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/5">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-sm font-bold">
                    UI
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{group.name}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function NavItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active 
          ? "bg-[#3B82F6] text-white" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-[#1F2937] rounded-lg border border-gray-700">
      <p className="text-xl font-bold text-white">{value.toLocaleString('ar')}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function PostCard({
  post,
  groupId,
  currentUserId,
  getMemberInfo,
  isLeader,
  commentInputs,
  setCommentInputs,
  expandedPosts,
  setExpandedPosts,
  toast,
}: {
  post: GroupPost;
  groupId: string;
  currentUserId: string | null;
  getMemberInfo: (id: string) => Freelancer | undefined;
  isLeader: (id: string) => boolean;
  commentInputs: Record<string, string>;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  expandedPosts: Set<string>;
  setExpandedPosts: React.Dispatch<React.SetStateAction<Set<string>>>;
  toast: any;
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

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl: string | null }) => {
      return await apiRequest(`/api/posts/${post.id}/comments`, "POST", {
        content,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts', 'popular'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', groupId, 'posts', 'media'] });
      setCommentInputs(prev => ({ ...prev, [post.id]: "" }));
      setCommentImages(prev => ({ ...prev, [post.id]: "" }));
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح",
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
    <Card>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={author?.profileImage || undefined} />
              <AvatarFallback className="bg-[#002e62] text-white">
                {author?.fullName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{author?.fullName}</p>
                {isLeader(post.authorId) && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Star className="h-3 w-3 ml-1" />
                    قائد
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}
              </p>
            </div>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePostMutation.mutate()}
              disabled={deletePostMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="صورة المنشور"
              className="mt-4 max-h-96 w-full object-contain rounded-lg border"
            />
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>{reactions.length} إعجاب</span>
          <span>{post.commentsCount || 0} تعليق</span>
        </div>

        <Separator className="mb-4" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLikeMutation.mutate()}
            className={hasLiked ? "text-blue-600" : ""}
          >
            <ThumbsUp className={`h-4 w-4 ml-2 ${hasLiked ? 'fill-current' : ''}`} />
            إعجاب
          </Button>
          <Button
            variant="ghost"
            size="sm"
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
            <MessageSquare className="h-4 w-4 ml-2" />
            تعليق
          </Button>
        </div>

        {/* Comments Section */}
        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            {/* Add Comment */}
            {currentUserId && (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#002e62] text-white text-xs">
                      Me
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="اكتب تعليق..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentInputs[post.id]?.trim()) {
                          addCommentMutation.mutate({
                            content: commentInputs[post.id],
                            imageUrl: commentImages[post.id] || null,
                          });
                        }
                      }}
                      data-testid={`input-comment-${post.id}`}
                    />
                    <Input
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`comment-image-${post.id}`)?.click()}
                      data-testid={`button-upload-comment-image-${post.id}`}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (commentInputs[post.id]?.trim()) {
                          addCommentMutation.mutate({
                            content: commentInputs[post.id],
                            imageUrl: commentImages[post.id] || null,
                          });
                        }
                      }}
                      disabled={addCommentMutation.isPending || !commentInputs[post.id]?.trim()}
                      data-testid={`button-send-comment-${post.id}`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Comment Image Preview */}
                {commentImages[post.id] && (
                  <div className="mr-11 relative inline-block">
                    <img
                      src={commentImages[post.id]}
                      alt="معاينة الصورة"
                      className="h-24 rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 left-1 h-6 w-6 p-0"
                      onClick={() => setCommentImages(prev => ({ ...prev, [post.id]: "" }))}
                      data-testid={`button-remove-comment-image-${post.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map(comment => {
                  const commentAuthor = getMemberInfo(comment.authorId);
                  return (
                    <div key={comment.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={commentAuthor?.profileImage || undefined} />
                        <AvatarFallback className="bg-[#002e62] text-white text-xs">
                          {commentAuthor?.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{commentAuthor?.fullName}</p>
                          {checkIsLeader(comment.authorId) && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                              <Star className="h-2 w-2 ml-1" />
                              قائد
                            </Badge>
                          )}
                          <span className="text-xs text-gray-600">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                        {comment.imageUrl && (
                          <img
                            src={comment.imageUrl}
                            alt="صورة التعليق"
                            className="mt-2 max-h-48 rounded-lg border"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
