import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { 
  Users, 
  Search, 
  UserPlus, 
  Building, 
  Filter,
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Lock,
  Crown
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group } from "@shared/schema";

export default function Groups() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const userType = localStorage.getItem("userType");
  const isProductOwner = userType === "product_owner";
  const isFreelancer = userType === "freelancer";
  const currentUserId = currentUser?.id;

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const response = await apiRequest("/api/groups", "GET");
      return response.json();
    },
  });

  // Enhanced groups with mock member data for demonstration
  const enhancedGroups = groups

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest(`/api/groups/${groupId}/join`, "POST");
      return response.json();
    },
    onSuccess: (data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      
      if (data.request && data.request.status === "pending") {
        setPendingRequests(prev => new Set(prev).add(groupId));
        toast({
          title: "تم إرسال طلب الانضمام",
          description: "طلبك قيد المراجعة من قائد الجروب",
        });
      } else {
        toast({
          title: "تم الانضمام بنجاح",
          description: "تم انضمامك للجروب بنجاح",
        });
      }
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
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/groups/${groupId}/leave`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "تم المغادرة",
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

  // Start conversation with group leader
  const startConversationMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest(`/api/conversations/with-leader/${groupId}`, "POST");
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/chat/${data.leaderId}`);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء بدء المحادثة",
        variant: "destructive",
      });
    },
  });

  // Filter groups
  const filteredGroups = enhancedGroups?.filter((group) => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesFilter = activeFilter === "all" || 
      (activeFilter === "joined" && group.isJoined) ||
      (activeFilter === "active" && group.status === "active") ||
      (activeFilter === "high-rated" && (parseFloat(group.averageRating) || 0) > 4);

    return matchesSearch && matchesFilter;
  });

  // Get group image with fallback
  const getGroupImage = (group: any) => {
    if (group.groupImage) return group.groupImage;
    if (group.portfolioImages && group.portfolioImages.length > 0) return group.portfolioImages[0];
    return `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name || 'Group')}`;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="py-12 bg-white border-b border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              جروبات المحترفين
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isFreelancer 
                ? "انضم لفِرَاح محترفة وارتقِ بمستوى أعمالك" 
                : "اختر من بين أفضل الفِرَاح المحترفة لتنفيذ مشاريعك"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                value: enhancedGroups?.length || 0, 
                label: "إجمالي الجروبات",
              },
              { 
                value: enhancedGroups?.filter(g => g.status === "active").length || 0, 
                label: "جروبات نشطة",
              },
              { 
                value: enhancedGroups?.reduce((sum, g) => sum + (g.memberCount || 0), 0) || 0, 
                label: "إجمالي الأعضاء",
              },
              { 
                value: enhancedGroups?.filter(g => parseFloat(g.averageRating) > 0).length > 0 
                  ? (enhancedGroups?.reduce((sum, g) => sum + (parseFloat(g.averageRating) || 0), 0) / enhancedGroups?.filter(g => parseFloat(g.averageRating) > 0).length).toFixed(1)
                  : "0.0", 
                label: "معدل التقييم",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن الجروبات، الخدمات، أو المحترفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-300 focus:border-gray-400 pr-10"
                />
              </div>
            </div>

            {/* Create Group Button */}
            {isFreelancer && (
              <Button
                onClick={() => navigate("/groups/create")}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء جروب
              </Button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: "all", label: "كل الجروبات" },
              { key: "joined", label: "الجروبات المنضم" },
              { key: "active", label: "الأكثر نشاطاً" },
              { key: "high-rated", label: "الأعلى تقييماً" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.key 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      <section className="flex-1 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-lg border border-gray-200">
                  <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse" />
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 mb-4">
                <Building className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد جروبات</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "لم نتمكن من العثور على جروبات تطابق بحثك" : "ابدأ رحلتك وأنشئ أول جروب محترف"}
              </p>
              {!searchTerm && isFreelancer && (
                <Button 
                  onClick={() => navigate("/groups/create")} 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  أنشئ أول جروب
                </Button>
              )}
              {searchTerm && (
                <Button 
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  مسح البحث
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const rating = parseFloat(group.averageRating) || 0;
                const groupImage = getGroupImage(group);
                
                return (
                  <Card
                    key={group.id}
                    className="rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    {/* Group Image */}
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={groupImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name || 'Group')}`;
                        }}
                      />
                      
                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {group.status === "active" && (
                          <Badge className="bg-green-100 text-green-700 text-xs border-0">
                            نشط
                          </Badge>
                        )}
                        {group.privacy === "private" && (
                          <Badge className="bg-gray-100 text-gray-700 text-xs border-0">
                            <Lock className="h-3 w-3 ml-1" />
                            خاص
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      {rating > 0 && (
                        <div className="absolute top-3 right-3 bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">{rating}</span>
                        </div>
                      )}

                      {/* Members Count */}
                      <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {group.memberCount || 0}/{group.maxMembers}
                        </span>
                      </div>

                      {/* Join Status */}
                      {group.isJoined && (
                        <div className="absolute bottom-3 right-3 bg-green-500 text-white rounded-lg px-2 py-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-sm font-medium">منضم</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Top Members Section */}
                      {group.membersToShow && group.membersToShow.length > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {group.membersToShow.map((member, index) => (
                              <div key={member.id} className="relative group">
                                <Avatar className={`w-8 h-8 border-2 border-white ${member.role === 'leader' ? 'ring-2 ring-yellow-400' : ''}`}>
                                  <AvatarImage src={member.avatar || ''} />
                                  <AvatarFallback className={`text-xs ${
                                    member.role === 'leader' 
                                      ? 'bg-yellow-500 text-white' 
                                      : 'bg-blue-500 text-white'
                                  }`}>
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {member.role === 'leader' && (
                                  <div className="absolute -top-1 -right-1">
                                    <Crown className="h-3 w-3 fill-yellow-500 text-yellow-600" />
                                  </div>
                                )}
                                {/* Online Status */}
                              
                              </div>
                            ))}
                            {group.memberCount > 5 && (
                              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                +{group.memberCount - 5}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            فريق العمل
                          </div>
                        </div>
                      )}

                      {/* Group Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {group.description || "لا يوجد وصف للجروب حالياً..."}
                        </p>
                        
                        {/* Leader Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>قائد: {group.leaderName || "غير معروف"}</span>
                          {group.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{group.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isProductOwner ? (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/groups/${group.id}`);
                            }}
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              startConversationMutation.mutate(group.id);
                            }}
                            disabled={startConversationMutation.isPending}
                          >
                            <MessageCircle className="ml-2 h-4 w-4" />
                            طلب خدمة
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/groups/${group.id}`);
                            }}
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </Button>

                          {group.isJoined ? (
                            <Button
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              disabled
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : group.joinRequestStatus === "pending" || pendingRequests.has(group.id) ? (
                            <Button
                              variant="outline"
                              className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                              disabled
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          ) : group.joinRequestStatus === "approved" ? (
                            <Button
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                joinGroupMutation.mutate(group.id);
                              }}
                              disabled={joinGroupMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : isFreelancer && group.status === "active" && (group.memberCount || 0) < group.maxMembers ? (
                            <Button
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                joinGroupMutation.mutate(group.id);
                              }}
                              disabled={joinGroupMutation.isPending}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      )}

                      {/* Status Messages */}
                      {(group.joinRequestStatus === "pending" || pendingRequests.has(group.id)) && !group.isJoined && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                          <p className="text-orange-700 text-sm">
                            طلبك قيد المراجعة
                          </p>
                        </div>
                      )}

                      {group.joinRequestStatus === "approved" && !group.isJoined && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                          <p className="text-green-700 text-sm">
                            تمت الموافقة - اضغط للانضمام
                          </p>
                        </div>
                      )}

                      {/* Leave Group Button */}
                      {group.isJoined && (
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("هل أنت متأكد من رغبتك في مغادرة هذا الجروب؟")) {
                              leaveGroupMutation.mutate(group.id);
                            }
                          }}
                          disabled={leaveGroupMutation.isPending}
                        >
                          مغادرة الجروب
                        </Button>
                      )}

                      {/* Group Full Message */}
                      {(group.memberCount || 0) >= group.maxMembers && !group.isJoined && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                          <p className="text-amber-700 text-sm">
                            الجروب ممتلئ - لا يمكن الانضمام حالياً
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}