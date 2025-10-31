import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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
  Filter
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
};

export default function Freelancers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");

  const { data: freelancers, isLoading } = useQuery<Freelancer[]>({
    queryKey: ["/api/freelancers"],
  });

  // Filter freelancers based on search and service
  const filteredFreelancers = freelancers?.filter((freelancer) => {
    const matchesSearch = 
      freelancer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (freelancer.jobTitle ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = 
      selectedService === "all" || 
      freelancer.services.includes(selectedService);

    return matchesSearch && matchesService;
  });

  // Get unique services from all freelancers
  const allServices = Array.from(
    new Set(freelancers?.flatMap((f) => f.services) || [])
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-16 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary" data-testid="text-freelancers-count">
                  {freelancers?.length || 0}+ مستقل محترف
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
                <span className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  المستقلون المحترفون
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-page-description">
                اكتشف أفضل المتخصصين في اختبار التطبيقات، التقييمات، وتحسين تجربة المستخدم
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border hover-elevate">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-500" data-testid="text-verified-count">
                    {freelancers?.filter(f => f.isVerified)?.length || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">مستقل موثق</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border hover-elevate">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary" data-testid="text-services-count">
                    {allServices.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">خدمة متنوعة</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border hover-elevate">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500" data-testid="text-success-rate">98%</span>
                </div>
                <p className="text-sm text-muted-foreground">نسبة النجاح</p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border hover-elevate">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary" data-testid="text-reliability">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">موثوقية</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-background border-b sticky top-16 z-40 backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مستقل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                data-testid="input-search"
              />
            </div>

            {/* Service Filter */}
            <div className="flex items-center gap-2 md:w-64">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger data-testid="select-service-filter">
                  <SelectValue placeholder="جميع الخدمات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الخدمات</SelectItem>
                  {allServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground" data-testid="text-results-count">
            عرض {filteredFreelancers?.length || 0} من {freelancers?.length || 0} مستقل
          </div>
        </div>
      </section>

      {/* Freelancers Grid */}
      <section className="flex-1 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-3xl">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFreelancers && filteredFreelancers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFreelancers.map((freelancer, index) => (
                <motion.div
                  key={freelancer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card 
                    className="rounded-3xl hover-elevate active-elevate-2 transition-all h-full border-2 relative overflow-visible"
                    data-testid={`card-freelancer-${freelancer.id}`}
                  >
                    {/* Verified Badge */}
                    {freelancer.isVerified && (
                      <div className="absolute -top-3 -left-3 z-10">
                        <Badge className="bg-green-500 text-white hover:bg-green-600 rounded-xl px-3 py-1 shadow-lg" data-testid={`badge-verified-${freelancer.id}`}>
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          موثق
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="space-y-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage src={freelancer.profileImage} alt={freelancer.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {getInitials(freelancer.fullName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name & Title */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 truncate" data-testid={`text-freelancer-name-${freelancer.id}`}>
                            {freelancer.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1" data-testid={`text-freelancer-username-${freelancer.id}`}>
                            @{freelancer.username}
                          </p>
                          {freelancer.jobTitle && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-job-title-${freelancer.id}`}>
                              <Briefcase className="h-3 w-3 ml-1" />
                              {freelancer.jobTitle}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Bio */}
                      {freelancer.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-freelancer-bio-${freelancer.id}`}>
                          {freelancer.bio}
                        </p>
                      )}

                      {/* Services */}
                      {freelancer.services.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            الخدمات المتاحة
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.services.slice(0, 3).map((service, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-primary/5 border-primary/20"
                                data-testid={`badge-service-${freelancer.id}-${i}`}
                              >
                                {service}
                              </Badge>
                            ))}
                            {freelancer.services.length > 3 && (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-more-services-${freelancer.id}`}>
                                +{freelancer.services.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Team Size */}
                      {freelancer.teamSize && freelancer.teamSize > 1 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-team-size-${freelancer.id}`}>
                          <Users className="h-4 w-4" />
                          <span>فريق من {freelancer.teamSize} أعضاء</span>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`text-freelancer-email-${freelancer.id}`}>
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{freelancer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`text-freelancer-phone-${freelancer.id}`}>
                          <Phone className="h-3 w-3" />
                          <span>{freelancer.countryCode} {freelancer.phone}</span>
                        </div>
                      </div>

                      {/* Join Date */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`text-join-date-${freelancer.id}`}>
                        <MapPin className="h-3 w-3" />
                        <span>انضم في {formatDate(freelancer.createdAt)}</span>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full rounded-2xl"
                        variant="default"
                        data-testid={`button-contact-${freelancer.id}`}
                      >
                        <Mail className="ml-2 h-4 w-4" />
                        تواصل الآن
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                جرب تغيير معايير البحث أو الفلتر
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
