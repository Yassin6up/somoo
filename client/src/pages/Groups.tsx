import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { 
  Users, 
  Search, 
  UserPlus, 
  Crown, 
  TrendingUp, 
  MessageCircle, 
  ShoppingCart, 
  Image as ImageIcon,
  Star,
  StarHalf,
  MapPin,
  Calendar,
  CheckCircle,
  Eye,
  Building,
  Filter
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group } from "@shared/schema";

export default function Groups() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const userType = localStorage.getItem("userType");
  const isProductOwner = userType === "product_owner";
  const isFreelancer = userType === "freelancer";
  const currentUserId = currentUser?.id;

  // Fetch all groups with enhanced data
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const response = await apiRequest("/api/groups", "GET");
      return response.json();
    },
  });

  console.log("Fetched Groups:", groups);

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/groups/${groupId}/join`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "تم الانضمام بنجاح",
        description: "تم انضمامك للجروب بنجاح، يمكنك الآن المشاركة في المشاريع",
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

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-blue-500 text-blue-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-3 w-3 fill-blue-500 text-blue-500" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  console.log("groups debug", groups);

  // Filter groups based on search and active filter
  const filteredGroups = groups?.filter((group) => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesFilter = activeFilter === "all" || 
      (activeFilter === "joined" && group.isJoined) ||
      (activeFilter === "active" && group.status === "active") ||
      (activeFilter === "high-rated" && (parseFloat(group.averageRating) || 0) > 4);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Professional Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
                الجروبات
              </h1>
              <p className="text-gray-600">
                {isFreelancer 
                  ? "انضم لجروب واعمل مع فريق محترف على المشاريع" 
                  : "اختر جروب محترف لتنفيذ مشروعك"
                }
              </p>
            </div>

            {isFreelancer && (
              <Button
                onClick={() => navigate("/groups/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                data-testid="button-create-group"
              >
                <UserPlus className="ml-2 h-5 w-5" />
                إنشاء جروب جديد
              </Button>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن جروب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 rounded-lg border-gray-300 focus:border-blue-500"
                    data-testid="input-search-groups"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "الكل", icon: Building },
                  { key: "joined", label: "منضم", icon: CheckCircle },
                  { key: "active", label: "نشط", icon: TrendingUp },
                  { key: "high-rated", label: "ممتاز", icon: Star },
                ].map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <Button
                      key={filter.key}
                      variant={activeFilter === filter.key ? "default" : "outline"}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        activeFilter === filter.key 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent className="ml-1 h-4 w-4" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: "إجمالي الجروبات", 
              value: groups.length, 
              icon: Building,
              description: "جروب متاح"
            },
            { 
              title: "جروبات نشطة", 
              value: groups.filter(g => g.status === "active").length, 
              icon: TrendingUp,
              description: "جروب نشط"
            },
            { 
              title: "إجمالي الأعضاء", 
              value: groups.reduce((sum, g) => sum + (g.memberCount || 0), 0), 
              icon: Users,
              description: "عضو نشط"
            },
            { 
              title: "معدل التقييم", 
              value: groups.filter(g => parseFloat(g.averageRating) > 0).length > 0 
                ? (groups.reduce((sum, g) => sum + (parseFloat(g.averageRating) || 0), 0) / groups.filter(g => parseFloat(g.averageRating) > 0).length).toFixed(1)
                : "0.0", 
              icon: Star,
              description: "متوسط التقييم"
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <IconComponent className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Professional Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-0 shadow-sm">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardHeader className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-9 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="text-center border-0 shadow-sm bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد جروبات</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "لم نتمكن من العثور على جروبات تطابق بحثك" : "لا توجد جروبات متاحة حالياً"}
              </p>
              {!searchTerm && isFreelancer && (
                <Button 
                  onClick={() => navigate("/groups/create")} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-create-first-group"
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  إنشاء أول جروب
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const rating = parseFloat(group.averageRating) || 0;
              const totalRatings = group.totalRatings || 0;
              
              return (
                <Card
                  key={group.id}
                  className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  data-testid={`card-group-${group.id}`}
                >
                  {/* Clean Image Section */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {group.portfolioImages && group.portfolioImages.length > 0 ? (
                      <img
                        src={group.portfolioImages[0]}
                        alt={`صورة الجروب ${group.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name)}`;
                        }}
                      />
                    ) : group.groupImage ? (
                      <img
                        src={group.groupImage}
                        alt={`صورة الجروب ${group.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className={`text-xs font-medium ${
                          group.status === "active" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {group.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>

                    {/* Rating Badge */}
                    {rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                        <span className="text-xs text-gray-500">({totalRatings})</span>
                      </div>
                    )}

                    {/* Members Count */}
                    <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {group.memberCount || 0}<span className="text-gray-500">/{group.maxMembers}</span>
                      </span>
                    </div>

                    {/* Join Status */}
                    {group.isJoined && (
                      <div className="absolute bottom-3 right-3 bg-green-100 text-green-800 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-sm font-medium">منضم</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle 
                        className="text-lg font-semibold text-gray-900 line-clamp-1" 
                        style={{ fontFamily: "Tajawal, sans-serif" }}
                      >
                        {group.name}
                      </CardTitle>
                    </div>
                    
                    {/* Leader Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-3 w-3 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">
                        {group.leaderName || "قائد الجروب"}
                      </span>
                    </div>

                    <CardDescription className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {group.description || "لا يوجد وصف..."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Member Avatars Section - ADDED HERE */}
                    {group.membersToShow && group.membersToShow.length > 0 && (
                      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3">
                            {/* Sort members: regular members first, leader last (on top) */}
                            {group.membersToShow
                              .slice(0, 5)
                              .sort((a, b) => {
                                // Put leader at the end of array (will be on top visually)
                                if (a.role === 'leader') return 1;
                                if (b.role === 'leader') return -1;
                                return 0;
                              })
                              .map((member, index, sortedArray) => (
                                <div
                                  key={member.id}
                                  className="relative group"
                                  style={{ zIndex: index + 1 }} // Higher z-index for later items
                                >
                                  {/* Member Avatar with Leader Crown */}
                                  <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium shadow-sm transition-all group-hover:scale-110 ${
                                    member.role === 'leader' 
                                      ? 'bg-gradient-to-br from-yellow-100 to-amber-100 ring-2 ring-yellow-400' 
                                      : 'bg-gradient-to-br from-blue-100 to-blue-200'
                                  }`}>
                                    {member.avatar ? (
                                      <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            parent.textContent = member.name?.charAt(0) || 'ع';
                                          }
                                        }}
                                      />
                                    ) : (
                                      member.name?.charAt(0) || 'ع'
                                    )}
                                  </div>
                                  
                                  {/* Leader Crown Badge */}
                                  {member.role === 'leader' && (
                                    <div className="absolute -top-1 -right-1">
                                      <Crown className="h-3 w-3 fill-yellow-400 text-yellow-600" />
                                    </div>
                                  )}
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    {member.name}
                                    {member.role === 'leader' && ' (قائد)'}
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                          {group.memberCount > 5 && (
                            <div className="text-xs text-blue-600 bg-white rounded-full px-2 py-1 border border-blue-200 font-medium">
                              +{group.memberCount - 5} أعضاء
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          فريق العمل ({group.memberCount})
                        </div>
                      </div>
                    )}
                    {/* Action buttons */}
                    {isProductOwner ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/purchase/${group.id}`);
                            }}
                            data-testid={`button-purchase-service-${group.id}`}
                          >
                            <ShoppingCart className="ml-2 h-4 w-4" />
                            طلب خدمة
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              // startConversationMutation.mutate(group.id);
                            }}
                            data-testid={`button-contact-leader-${group.id}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/groups/${group.id}`);
                          }}
                          data-testid={`button-view-group-${group.id}`}
                        >
                          <Eye className="ml-2 h-4 w-4" />
                          عرض التفاصيل
                        </Button>

                        {group.isJoined ? (
                          <Button
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/groups/${group.id}`);
                            }}
                            data-testid={`button-member-status-${group.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : isFreelancer && group.status === "active" && (group.memberCount || 0) < group.maxMembers ? (
                          <Button
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              joinGroupMutation.mutate(group.id);
                            }}
                            disabled={joinGroupMutation.isPending}
                            data-testid={`button-join-group-${group.id}`}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    )}

                    {/* Leave Group Button */}
                    {group.isJoined && (
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("هل أنت متأكد من رغبتك في مغادرة هذا الجروب؟")) {
                            leaveGroupMutation.mutate(group.id);
                          }
                        }}
                        disabled={leaveGroupMutation.isPending}
                        data-testid={`button-leave-group-${group.id}`}
                      >
                        مغادرة الجروب
                      </Button>
                    )}

                    {/* Group Full Message */}
                    {(group.memberCount || 0) >= group.maxMembers && !group.isJoined && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-center">
                        <p className="text-amber-700 text-xs font-medium">
                          الجروب ممتلئ
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
    </div>
  );
}