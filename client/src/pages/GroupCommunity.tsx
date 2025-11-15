import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Info
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
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Get current user
  const currentUserId = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")!).id 
    : null;

  // Fetch group data
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
  });

  // Fetch group members
  const { data: members = [] } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${groupId}/members`],
  });

  // Fetch freelancers info for members
  const { data: freelancers = [] } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<GroupPost[]>({
    queryKey: [`/api/groups/${groupId}/posts`],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/groups/${groupId}/posts`, "POST", {
        content,
        imageUrl: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      setNewPostContent("");
      toast({
        title: "تم نشر المنشور",
        description: "تم نشر منشورك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نشر المنشور",
        variant: "destructive",
      });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return await apiRequest(`/api/posts/${postId}/comments`, "POST", {
        content,
        imageUrl: null,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${variables.postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      setCommentInputs((prev) => ({ ...prev, [variables.postId]: "" }));
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح",
      });
    },
  });

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/posts/${postId}/reactions`, "POST", {
        type: "like",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/posts/${postId}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/posts`] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المنشور بنجاح",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "خطأ",
        description: "يجب كتابة محتوى المنشور",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPostContent);
  };

  const handleCreateComment = (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) {
      toast({
        title: "خطأ",
        description: "يجب كتابة محتوى التعليق",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate({ postId, content });
  };

  const toggleComments = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Get freelancer info
  const getFreelancerInfo = (freelancerId: string) => {
    return freelancers.find((f) => f.id === freelancerId);
  };

  // Check if user is online (last seen within 5 minutes)
  const isOnline = (lastSeen: Date | null) => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
  };

  // Get members info with online status
  const membersWithInfo = members.map((member) => ({
    ...member,
    freelancer: getFreelancerInfo(member.freelancerId),
  }));

  // Separate leader from members
  const leader = membersWithInfo.find((m) => m.freelancerId === group?.leaderId);
  const regularMembers = membersWithInfo.filter((m) => m.freelancerId !== group?.leaderId);

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]" dir="rtl">
        <div className="text-center">
          <div className="text-lg font-semibold">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]" dir="rtl">
        <div className="text-center">
          <div className="text-lg font-semibold">المجموعة غير موجودة</div>
          <Link href="/groups">
            <Button className="mt-4" data-testid="button-back-groups">
              العودة للمجموعات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      {/* Cover Image Header */}
      <div className="relative h-64 bg-gradient-to-br from-[#002e62] to-[#004a99] overflow-hidden">
        {group.groupImage ? (
          <img
            src={group.groupImage}
            alt={group.name}
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-24 h-24 text-white/30" />
          </div>
        )}
        
        {/* Back Button */}
        <div className="absolute top-4 right-4">
          <Link href={`/groups/${groupId}`}>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" data-testid="button-back-details">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لتفاصيل المجموعة
            </Button>
          </Link>
        </div>

        {/* Group Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.currentMembers} / {group.maxMembers} عضو
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {group.country}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {group.service}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post Box */}
            <Card data-testid="card-create-post">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {getFreelancerInfo(currentUserId)?.fullName?.charAt(0) || "م"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="شارك مع أعضاء المجموعة..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[100px] resize-none"
                      data-testid="input-post-content"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <Button variant="ghost" size="sm" disabled>
                        <ImageIcon className="ml-2 h-4 w-4" />
                        إضافة صورة
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending || !newPostContent.trim()}
                        data-testid="button-publish-post"
                      >
                        <Send className="ml-2 h-4 w-4" />
                        نشر
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">جاري تحميل المنشورات...</div>
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد منشورات بعد</h3>
                  <p className="text-muted-foreground">كن أول من يشارك في مجتمع المجموعة</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={getFreelancerInfo(post.authorId)}
                  isLeader={post.authorId === group.leaderId}
                  isExpanded={expandedPosts.has(post.id)}
                  commentInput={commentInputs[post.id] || ""}
                  currentUserId={currentUserId}
                  groupLeaderId={group.leaderId}
                  onToggleComments={() => toggleComments(post.id)}
                  onLike={() => toggleReactionMutation.mutate(post.id)}
                  onCommentChange={(value) => setCommentInputs((prev) => ({ ...prev, [post.id]: value }))}
                  onSubmitComment={() => handleCreateComment(post.id)}
                  onDelete={() => deletePostMutation.mutate(post.id)}
                  isSubmittingComment={createCommentMutation.isPending}
                />
              ))
            )}
          </div>

          {/* Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* About Group */}
            <Card data-testid="card-about-group">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  عن المجموعة
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الخدمة:</span>
                    <span className="font-medium">{group.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الدولة:</span>
                    <span className="font-medium">{group.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الأعضاء:</span>
                    <span className="font-medium">{group.currentMembers} / {group.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(group.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card data-testid="card-members-list">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  الأعضاء ({group.currentMembers})
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {/* Leader */}
                  {leader?.freelancer && (
                    <>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate" data-testid={`member-${leader.freelancerId}`}>
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-white">
                              {leader.freelancer.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline(leader.freelancer.lastSeen) && (
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{leader.freelancer.fullName}</p>
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">@{leader.freelancer.username}</p>
                        </div>
                        <Badge variant="default" className="text-xs">قائد</Badge>
                      </div>
                      {regularMembers.length > 0 && <Separator />}
                    </>
                  )}

                  {/* Regular Members */}
                  {regularMembers.map((member) => (
                    member.freelancer && (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover-elevate" data-testid={`member-${member.freelancerId}`}>
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-secondary">
                              {member.freelancer.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline(member.freelancer.lastSeen) && (
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.freelancer.fullName}</p>
                          <p className="text-xs text-muted-foreground">@{member.freelancer.username}</p>
                        </div>
                        {isOnline(member.freelancer.lastSeen) ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            متصل
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">غير متصل</span>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {group.portfolioImages && group.portfolioImages.length > 0 && (
              <Card data-testid="card-media-gallery">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    معرض الصور ({group.portfolioImages.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {group.portfolioImages.slice(0, 6).map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-muted hover-elevate cursor-pointer"
                        data-testid={`gallery-image-${index}`}
                      >
                        <img
                          src={imageUrl}
                          alt={`صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {group.portfolioImages.length > 6 && (
                    <Button variant="link" className="w-full mt-2" size="sm">
                      عرض جميع الصور ({group.portfolioImages.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  author,
  isLeader,
  isExpanded,
  commentInput,
  currentUserId,
  groupLeaderId,
  onToggleComments,
  onLike,
  onCommentChange,
  onSubmitComment,
  onDelete,
  isSubmittingComment,
}: {
  post: GroupPost;
  author: Freelancer | undefined;
  isLeader: boolean;
  isExpanded: boolean;
  commentInput: string;
  currentUserId: string | null;
  groupLeaderId: string;
  onToggleComments: () => void;
  onLike: () => void;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  onDelete: () => void;
  isSubmittingComment: boolean;
}) {
  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: isExpanded,
  });

  const { data: freelancers = [] } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
    enabled: isExpanded,
  });

  const getCommentAuthor = (authorId: string) => {
    return freelancers.find((f) => f.id === authorId);
  };

  const canDelete = currentUserId === post.authorId || currentUserId === groupLeaderId;

  return (
    <Card data-testid={`post-${post.id}`}>
      <CardContent className="pt-6">
        {/* Post Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar>
            <AvatarFallback className={isLeader ? "bg-primary text-white" : "bg-secondary"}>
              {author?.fullName?.charAt(0) || "م"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{author?.fullName || "مستخدم"}</p>
              {isLeader && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}
            </p>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              data-testid={`button-delete-post-${post.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt="صورة المنشور"
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className="flex-1"
            data-testid={`button-like-${post.id}`}
          >
            <ThumbsUp className="ml-2 h-4 w-4" />
            إعجاب ({post.likesCount})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleComments}
            className="flex-1"
            data-testid={`button-comments-${post.id}`}
          >
            <MessageSquare className="ml-2 h-4 w-4" />
            تعليق ({post.commentsCount})
          </Button>
        </div>

        {/* Comments Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Comment Input */}
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs">م</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="اكتب تعليقاً..."
                  value={commentInput}
                  onChange={(e) => onCommentChange(e.target.value)}
                  className="min-h-[60px] text-sm resize-none"
                  data-testid={`input-comment-${post.id}`}
                />
                <Button
                  size="sm"
                  onClick={onSubmitComment}
                  disabled={isSubmittingComment || !commentInput.trim()}
                  data-testid={`button-submit-comment-${post.id}`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentAuthor = getCommentAuthor(comment.authorId);
                  return (
                    <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {commentAuthor?.fullName?.charAt(0) || "م"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted rounded-lg p-3">
                        <p className="font-medium text-sm">{commentAuthor?.fullName || "مستخدم"}</p>
                        <p className="text-sm mt-1">{comment.content}</p>
                        {comment.imageUrl && (
                          <img
                            src={comment.imageUrl}
                            alt="صورة التعليق"
                            className="mt-2 rounded max-h-[200px]"
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}
                        </p>
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
