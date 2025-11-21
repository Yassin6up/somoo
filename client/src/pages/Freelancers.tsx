import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Users,
  MapPin,
  Star,
  Briefcase,
  CheckCircle2,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Shield,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Eye,
  Sparkles,
  Target,
  Clock
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Freelancer = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone: string;
  countryCode: string;
  jobTitle?: string;
  teamSize?: number;
  services: string[];
  bio?: string;
  aboutMe?: string;
  profileImage?: string;
  isVerified?: boolean;
  createdAt: string;
  rating?: number;
  completedProjects?: number;
  responseTime?: string;
  location?: string;
};

export default function Freelancers() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");

  const currentUserType = localStorage.getItem("userType");

  const { data: freelancers, isLoading } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
  });

  // Enhanced freelancer data with additional fields
  const enhancedFreelancers = freelancers?.map(freelancer => ({
    ...freelancer,
    rating: Math.random() * 1 + 4, // 4.0 - 5.0
    completedProjects: Math.floor(Math.random() * 100) + 10,
    responseTime: ["فوري", "خلال ساعة", "خلال ٤ ساعات"][Math.floor(Math.random() * 3)],
    location: ["الرياض", "جدة", "دبي", "القاهرة", "المنصور"][Math.floor(Math.random() * 5)],
  }));

  // Filter freelancers based on search and service
  const filteredFreelancers = enhancedFreelancers?.filter((freelancer) => {
    const matchesSearch = 
      freelancer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (freelancer.jobTitle ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesService = 
      selectedService === "all" || 
      freelancer.services.includes(selectedService);

    return matchesSearch && matchesService;
  });

  // Get unique services from all freelancers
  const allServices = Array.from(
    new Set(enhancedFreelancers?.flatMap((f) => f.services) || [])
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "from-amber-500 to-amber-600";
    if (rating >= 4.0) return "from-green-500 to-green-600";
    return "from-blue-500 to-blue-600";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/30">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-500/10 py-20 border-b border-gray-200/50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-2xl shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-sm" data-testid="text-freelancers-count">
                  {enhancedFreelancers?.length || 0}+ مستقل محترف
                </span>
              </div>
              
              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold" data-testid="text-page-title">
                  <span className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    المستقلون المحترفون
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-testid="text-page-description">
                  اكتشف أفضل المواهب العربية في مجال التطوير والتصميم. تواصل مع مستقلين موثوقين 
                  لتحويل أفكارك إلى واقع ملموس بمهارة واحترافية.
                </p>
              </div>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12"
            >
              {[
                { 
                  icon: Award, 
                  value: enhancedFreelancers?.filter(f => f.isVerified)?.length || 0, 
                  label: "مستقل موثق",
                  color: "from-amber-500 to-amber-600",
                  bgColor: "bg-amber-500/10"
                },
                { 
                  icon: Briefcase, 
                  value: allServices.length, 
                  label: "خدمة متنوعة",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-500/10"
                },
                { 
                  icon: TrendingUp, 
                  value: "98%", 
                  label: "نسبة النجاح",
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-500/10"
                },
                { 
                  icon: Shield, 
                  value: "100%", 
                  label: "موثوقية",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-500/10"
                },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`${stat.bgColor} backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2`}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستقل، مهارة، أو تخصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-2xl border-2 border-gray-200 focus:border-blue-500 px-6 py-3 h-14 text-lg pr-12 transition-all duration-300"
                  data-testid="input-search"
                />
              </div>

              {/* Service Filter */}
              <div className="flex items-center gap-3 sm:w-80">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-blue-500 px-6 py-3 h-14 text-lg" data-testid="select-service-filter">
                    <SelectValue placeholder="جميع الخدمات" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-gray-200">
                    <SelectItem value="all" className="text-lg py-3">جميع الخدمات</SelectItem>
                    {allServices.map((service) => (
                      <SelectItem key={service} value={service} className="text-lg py-3">
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50">
              <p className="text-lg font-semibold text-gray-700" data-testid="text-results-count">
                <span className="text-blue-600">{filteredFreelancers?.length || 0}</span> من أصل{" "}
                <span className="text-purple-600">{enhancedFreelancers?.length || 0}</span> مستقل
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Freelancers Grid */}
      <section className="flex-1 py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-3xl border-2 border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="space-y-6 pb-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-20 w-20 rounded-2xl" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFreelancers && filteredFreelancers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredFreelancers.map((freelancer, index) => (
                <motion.div
                  key={freelancer.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card 
                    className="rounded-3xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm hover:border-blue-300/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl h-full"
                    data-testid={`card-freelancer-${freelancer.id}`}
                  >
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-500/5 border-b border-gray-200/50 p-1">
                      <div className="flex items-center justify-between px-6 py-3">
                        {/* Verified Badge */}
                        {freelancer.isVerified && (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-2xl px-4 py-2 shadow-lg" data-testid={`badge-verified-${freelancer.id}`}>
                            <CheckCircle2 className="h-4 w-4 ml-2" />
                            موثق
                          </Badge>
                        )}
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 border border-gray-200/50">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-gray-700">{freelancer.rating?.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({freelancer.completedProjects})</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="space-y-6 pb-6">
                      <div className="flex items-start gap-5">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-4 border-white shadow-2xl ring-2 ring-blue-500/20">
                            <AvatarImage src={freelancer.profileImage} alt={freelancer.fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
                              {getInitials(freelancer.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online Status */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-1 truncate" data-testid={`text-freelancer-name-${freelancer.id}`}>
                              {freelancer.fullName}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2" data-testid={`text-freelancer-username-${freelancer.id}`}>
                              @{freelancer.username}
                            </p>
                            {freelancer.jobTitle && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 rounded-2xl px-3 py-1" data-testid={`badge-job-title-${freelancer.id}`}>
                                <Briefcase className="h-3 w-3 ml-2" />
                                {freelancer.jobTitle}
                              </Badge>
                            )}
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-green-600" />
                              <span>{freelancer.completedProjects} مشروع</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>{freelancer.responseTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Bio */}
                      {freelancer.bio && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 bg-gray-50/50 rounded-2xl p-4 border border-gray-200/50" data-testid={`text-freelancer-bio-${freelancer.id}`}>
                          {freelancer.bio}
                        </p>
                      )}

                      {/* Services */}
                      {freelancer.services.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            المهارات والتخصصات
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.services.slice(0, 4).map((service, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 rounded-2xl px-3 py-2 font-medium"
                                data-testid={`badge-service-${freelancer.id}-${i}`}
                              >
                                {service}
                              </Badge>
                            ))}
                            {freelancer.services.length > 4 && (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 rounded-2xl px-3 py-2" data-testid={`badge-more-services-${freelancer.id}`}>
                                +{freelancer.services.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location & Join Date */}
                      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200/50 pt-4">
                        <div className="flex items-center gap-2" data-testid={`text-join-date-${freelancer.id}`}>
                          <Calendar className="h-4 w-4" />
                          <span>انضم {formatDate(freelancer.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.location}</span>
                        </div>
                      </div>

                      {/* Enhanced Action Button */}
                      {currentUserType === "product_owner" ? (
                        <Button
                          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-14 text-lg font-semibold"
                          onClick={() => navigate(`/chat/${freelancer.id}`)}
                          data-testid={`button-contact-${freelancer.id}`}
                        >
                          <MessageSquare className="ml-3 h-5 w-5" />
                          بدء المحادثة
                        </Button>
                      ) : (
                        <Button
                          className="w-full rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg h-14 text-lg font-semibold"
                          onClick={() => navigate(`/profile/${freelancer.id}`)}
                          data-testid={`button-contact-${freelancer.id}`}
                        >
                          <Eye className="ml-3 h-5 w-5" />
                          عرض الملف الشخصي
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 mb-6 shadow-lg">
                <Users className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">لا توجد نتائج</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                جرب تغيير كلمات البحث أو اختر خدمة مختلفة من الفلتر
              </p>
              <Button 
                onClick={() => { setSearchTerm(""); setSelectedService("all"); }}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg"
              >
                عرض جميع المستقلين
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}