import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MapPin,
  Star,
  Briefcase,
  CheckCircle2,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Mail
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

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

  // Enhanced freelancer data
  const enhancedFreelancers = freelancers?.map(freelancer => ({
    ...freelancer,
    rating: Math.random() * 1 + 4,
    completedProjects: Math.floor(Math.random() * 100) + 10,
    responseTime: ["فوري", "خلال ساعة", "خلال ٤ ساعات"][Math.floor(Math.random() * 3)],
    location: ["الرياض", "جدة", "دبي", "القاهرة", "المنصور"][Math.floor(Math.random() * 5)],
  }));

  // Filter freelancers
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

  // Get unique services
  const allServices = Array.from(
    new Set(enhancedFreelancers?.flatMap((f) => f.services) || [])
  );

  // Get initials for avatar
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="py-12 bg-white border-b border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              المستقلون المحترفون
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اكتشف أفضل المواهب العربية في مجال التطوير والتصميم والتقييم
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
                value: enhancedFreelancers?.filter(f => f.isVerified)?.length || 0, 
                label: "مستقل موثق",
              },
              { 
                value: allServices.length, 
                label: "خدمة متنوعة",
              },
              { 
                value: "98%", 
                label: "نسبة النجاح",
              },
              { 
                value: enhancedFreelancers?.length || 0, 
                label: "مستقل نشط",
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

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستقل، مهارة، أو تخصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-300 focus:border-gray-400 pr-10"
                />
              </div>

              {/* Service Filter */}
              <div className="sm:w-64">
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="rounded-lg border border-gray-300 focus:border-gray-400">
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
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-gray-900">{filteredFreelancers?.length || 0}</span> من أصل{" "}
                <span className="text-gray-900">{enhancedFreelancers?.length || 0}</span> مستقل
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Freelancers Grid */}
      <section className="flex-1 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-lg border border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFreelancers && filteredFreelancers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFreelancers.map((freelancer) => (
                <Card 
                  key={freelancer.id}
                  className="rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border border-gray-200">
                        <AvatarImage src={freelancer.profileImage} alt={freelancer.fullName} />
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {getInitials(freelancer.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {freelancer.fullName}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              @{freelancer.username}
                            </p>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {freelancer.rating?.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {freelancer.jobTitle && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            <Briefcase className="h-3 w-3 ml-1" />
                            {freelancer.jobTitle}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Verified Badge */}
                    {freelancer.isVerified && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>مستقل موثق</span>
                      </div>
                    )}

                    {/* Bio */}
                    {freelancer.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {freelancer.bio}
                      </p>
                    )}

                    {/* Services */}
                    {freelancer.services.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">المهارات:</p>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.services.slice(0, 3).map((service, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-700"
                            >
                              {service}
                            </Badge>
                          ))}
                          {freelancer.services.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              +{freelancer.services.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>انضم {formatDate(freelancer.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-gray-700">
                        {freelancer.completedProjects} مشروع
                      </div>
                    </div>

                    {/* Action Button */}
                    {currentUserType === "product_owner" ? (
                      <Button
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={() => navigate(`/chat/${freelancer.id}`)}
                      >
                        <MessageSquare className="ml-2 h-4 w-4" />
                        بدء المحادثة
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate(`/profile/${freelancer.id}`)}
                      >
                        <Mail className="ml-2 h-4 w-4" />
                        التواصل
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600 mb-6">
                جرب تغيير كلمات البحث أو اختر خدمة مختلفة
              </p>
              <Button 
                onClick={() => { setSearchTerm(""); setSelectedService("all"); }}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                عرض جميع المستقلين
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}