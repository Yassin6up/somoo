import { useState, useRef, useEffect } from "react";
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
  Filter,
  Sparkles,
  Zap,
  Target,
  Rocket,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Award,
  Lock,
  Clock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group } from "@shared/schema";
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

export default function Groups() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

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

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest(`/api/groups/${groupId}/join`, "POST");
      return response.json();
    },
    onSuccess: (data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      
      // Check if it's a pending request or direct join
      if (data.request && data.request.status === "pending") {
        setPendingRequests(prev => new Set(prev).add(groupId));
        toast({
          title: "تم إرسال طلب الانضمام",
          description: "طلبك قيد المراجعة من قائد الجروب. سيتم إشعارك عند الموافقة.",
        });
      } else {
        toast({
          title: "تم الانضمام بنجاح",
          description: "تم انضمامك للجروب بنجاح، يمكنك الآن المشاركة في المشاريع",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Professional Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-2 rounded-full inline-flex items-center gap-3 shadow-lg mb-4">
                <Sparkles className="h-4 w-4" />
                مجتمع المحترفين
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </Badge>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                اكتشف <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">جروبات المحترفين</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                {isFreelancer 
                  ? "انضم لفِرَاح محترفة وارتقِ بمستوى أعمالك من خلال التعاون مع أفضل المواهب" 
                  : "اختر من بين أفضل الفِرَاح المحترفة لتنفيذ مشاريعك بأعلى معايير الجودة"
                }
              </p>
            </div>

            {isFreelancer && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/groups/create")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  data-testid="button-create-group"
                >
                  <UserPlus className="ml-3 h-5 w-5" />
                  إنشاء جروب جديد
                  <Rocket className="mr-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Enhanced Search and Filter Section */}
          <FadeInSection delay={0.1}>
            <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="ابحث عن الجروبات، الخدمات، أو المحترفين..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-12 pl-4 py-6 rounded-2xl border-gray-200 focus:border-blue-500 bg-white shadow-sm text-lg"
                        data-testid="input-search-groups"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Filter Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "all", label: "كل الجروبات", icon: Building, gradient: "from-blue-500 to-cyan-500" },
                      { key: "joined", label: "الجروبات المنضم", icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
                      { key: "active", label: "الأكثر نشاطاً", icon: TrendingUp, gradient: "from-purple-500 to-pink-500" },
                      { key: "high-rated", label: "الأعلى تقييماً", icon: Star, gradient: "from-yellow-500 to-orange-500" },
                    ].map((filter) => {
                      const IconComponent = filter.icon;
                      const isActive = activeFilter === filter.key;
                      
                      return (
                        <motion.button
                          key={filter.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveFilter(filter.key)}
                          className={`relative px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                            isActive 
                              ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg` 
                              : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {filter.label}
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="activeFilter"
                              className="absolute inset-0 rounded-2xl border-2 border-white/20"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>

        {/* Enhanced Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              title: "إجمالي الجروبات", 
              value: groups.length, 
              icon: Building,
              description: "جروب متاح",
              gradient: "from-blue-500 to-cyan-500",
              delay: 0.1
            },
            { 
              title: "جروبات نشطة", 
              value: groups.filter(g => g.status === "active").length, 
              icon: TrendingUp,
              description: "جروب نشط",
              gradient: "from-purple-500 to-pink-500",
              delay: 0.2
            },
            { 
              title: "إجمالي الأعضاء", 
              value: groups.reduce((sum, g) => sum + (g.memberCount || 0), 0), 
              icon: Users,
              description: "عضو نشط",
              gradient: "from-green-500 to-emerald-500",
              delay: 0.3
            },
            { 
              title: "معدل التقييم", 
              value: groups.filter(g => parseFloat(g.averageRating) > 0).length > 0 
                ? (groups.reduce((sum, g) => sum + (parseFloat(g.averageRating) || 0), 0) / groups.filter(g => parseFloat(g.averageRating) > 0).length).toFixed(1)
                : "0.0", 
              icon: Star,
              description: "متوسط التقييم",
              gradient: "from-yellow-500 to-orange-500",
              delay: 0.4
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <FadeInSection key={index} delay={stat.delay}>
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="text-sm font-semibold text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </CardContent>
                </Card>
              </FadeInSection>
            );
          })}
        </div>

        {/* Enhanced Professional Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-0 rounded-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl" />
                <CardHeader className="space-y-4 p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="h-12 bg-gray-200 rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <FadeInSection delay={0.2}>
            <Card className="text-center border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Building className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد جروبات</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed">
                  {searchTerm ? "لم نتمكن من العثور على جروبات تطابق بحثك" : "ابدأ رحلتك وأنشئ أول جروب محترف"}
                </p>
                {!searchTerm && isFreelancer && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => navigate("/groups/create")} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                      data-testid="button-create-first-group"
                    >
                      <UserPlus className="ml-3 h-5 w-5" />
                      أنشئ أول جروب
                      <Rocket className="mr-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
                {searchTerm && (
                  <Button 
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-2xl font-medium"
                  >
                    مسح البحث
                  </Button>
                )}
              </CardContent>
            </Card>
          </FadeInSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGroups.map((group, index) => {
              const rating = parseFloat(group.averageRating) || 0;
              const totalRatings = group.totalRatings || 0;
              
              return (
                <FadeInSection key={group.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <Card
                      className="border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                      onClick={() => navigate(`/groups/${group.id}`)}
                      data-testid={`card-group-${group.id}`}
                    >
                      {/* Enhanced Image Section */}
                      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {group.portfolioImages && group.portfolioImages.length > 0 ? (
                          <img
                            src={group.portfolioImages[0]}
                            alt={`صورة الجروب ${group.name}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name)}`;
                            }}
                          />
                        ) : group.groupImage ? (
                          <img
                            src={group.groupImage}
                            alt={`صورة الجروب ${group.name}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=${encodeURIComponent(group.name)}`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                            <div className="text-center">
                              <Building className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                              <p className="text-blue-600 font-medium text-sm">{group.name}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Status Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge 
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 shadow-lg ${
                              group.status === "active" 
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                            }`}
                          >
                            {group.status === "active" ? "نشط" : "غير نشط"}
                          </Badge>
                          {group.privacy === "private" && (
                            <Badge className="text-xs font-semibold px-3 py-1.5 rounded-full border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              خاص
                            </Badge>
                          )}
                        </div>

                        {/* Enhanced Rating Badge */}
                        {rating > 0 && (
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                            <span className="text-sm font-bold text-gray-900">{rating}</span>
                            <span className="text-xs text-gray-500">({totalRatings})</span>
                          </div>
                        )}

                        {/* Enhanced Members Count */}
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-bold text-gray-900">
                            {group.memberCount || 0}<span className="text-gray-500 font-normal">/{group.maxMembers}</span>
                          </span>
                        </div>

                        {/* Enhanced Join Status */}
                        {group.isJoined && (
                          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-semibold">منضم</span>
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardHeader className="pb-4 px-6 pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <CardTitle 
                            className="text-xl font-bold text-gray-900 line-clamp-1 leading-tight" 
                          >
                            {group.name}
                          </CardTitle>
                        </div>
                        
                        {/* Enhanced Leader Info */}
                        <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{group.leaderName || "قائد الجروب"}</p>
                            <p className="text-xs text-gray-600">قائد المجموعة</p>
                          </div>
                        </div>

                        <CardDescription className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[3rem]">
                          {group.description || "لا يوجد وصف للجروب حالياً..."}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 px-6 pb-6">
                        {/* Enhanced Member Avatars Section */}
                        {group.membersToShow && group.membersToShow.length > 0 && (
                          <div className="flex items-center justify-between mb-5 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100/50">
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-3">
                                {group.membersToShow
                                  .slice(0, 5)
                                  .sort((a, b) => {
                                    if (a.role === 'leader') return 1;
                                    if (b.role === 'leader') return -1;
                                    return 0;
                                  })
                                  .map((member, index, sortedArray) => (
                                    <div
                                      key={member.id}
                                      className="relative group"
                                      style={{ zIndex: index + 1 }}
                                    >
                                      <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                        member.role === 'leader' 
                                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-2 ring-yellow-300' 
                                          : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
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
                                      
                                      {member.role === 'leader' && (
                                        <div className="absolute -top-1 -right-1">
                                          <Crown className="h-4 w-4 fill-yellow-300 text-yellow-600" />
                                        </div>
                                      )}
                                      
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                                        {member.name}
                                        {member.role === 'leader' && ' (قائد)'}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              
                              {group.memberCount > 5 && (
                                <div className="text-sm font-semibold text-blue-600 bg-white rounded-full px-3 py-1.5 border border-blue-200 shadow-sm">
                                  +{group.memberCount - 5}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-bold text-blue-600">
                              فريق العمل
                            </div>
                          </div>
                        )}

                        {/* Enhanced Action buttons */}
                        {isProductOwner ? (
                          <div className="flex gap-3">
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/groups/${group.id}`);
                              }}
                              data-testid={`button-view-group-details-${group.id}`}
                            >
                              <Eye className="ml-3 h-5 w-5" />
                              عرض التفاصيل
                            </Button>
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/groups/${group.id}/chat`);
                              }}
                              data-testid={`button-chat-leader-${group.id}`}
                            >
                              <MessageCircle className="ml-3 h-5 w-5" />
                              طلب خدمة
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/groups/${group.id}`);
                              }}
                              data-testid={`button-view-group-${group.id}`}
                            >
                              <Eye className="ml-3 h-5 w-5" />
                              عرض التفاصيل
                              <ArrowRight className="mr-2 h-5 w-5" />
                            </Button>

                            {group.isJoined ? (
                              <Button
                                variant="outline"
                                className="border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 rounded-2xl px-4 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/groups/${group.id}`);
                                }}
                                data-testid={`button-member-status-${group.id}`}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </Button>
                            ) : group.joinRequestStatus === "pending" || pendingRequests.has(group.id) ? (
                              <Button
                                variant="outline"
                                className="border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 rounded-2xl px-4 shadow-sm cursor-not-allowed"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-pending-status-${group.id}`}
                              >
                                <Clock className="h-5 w-5" />
                              </Button>
                            ) : group.joinRequestStatus === "approved" ? (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  className="border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 rounded-2xl px-4 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    joinGroupMutation.mutate(group.id);
                                  }}
                                  disabled={joinGroupMutation.isPending}
                                  data-testid={`button-approved-join-${group.id}`}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            ) : isFreelancer && group.status === "active" && (group.memberCount || 0) < group.maxMembers ? (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="outline"
                                  className="border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-2xl px-4 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    joinGroupMutation.mutate(group.id);
                                  }}
                                  disabled={joinGroupMutation.isPending}
                                  data-testid={`button-join-group-${group.id}`}
                                >
                                  <UserPlus className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            ) : null}
                          </div>
                        )}

                        {/* Pending Request Status Message */}
                        {(group.joinRequestStatus === "pending" || pendingRequests.has(group.id)) && !group.isJoined && (
                          <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-orange-600 animate-pulse" />
                              <p className="text-orange-700 text-sm font-bold">
                                قيد المراجعة
                              </p>
                            </div>
                            <p className="text-orange-600 text-xs">
                              طلبك قيد مراجعة قائد الجروب
                            </p>
                          </div>
                        )}

                        {/* Approved Request - Can Join Now */}
                        {group.joinRequestStatus === "approved" && !group.isJoined && (
                          <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <p className="text-green-700 text-sm font-bold">
                                تمت الموافقة!
                              </p>
                            </div>
                            <p className="text-green-600 text-xs">
                              اضغط على الزر للانضمام الآن
                            </p>
                          </div>
                        )}

                        {/* Enhanced Leave Group Button */}
                        {group.isJoined && (
                          <Button
                            variant="outline"
                            className="w-full mt-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 rounded-2xl py-3 font-medium"
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

                        {/* Enhanced Group Full Message */}
                        {(group.memberCount || 0) >= group.maxMembers && !group.isJoined && (
                          <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Shield className="h-4 w-4 text-amber-600" />
                              <p className="text-amber-700 text-sm font-semibold">
                                الجروب ممتلئ - لا يمكن الانضمام حالياً
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}