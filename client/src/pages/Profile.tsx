import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar,
  Star,
  Award,
  Settings,
  Edit
} from "lucide-react";
import type { Freelancer, ProductOwner } from "@shared/schema";

export default function Profile() {
  const [, navigate] = useLocation();
  const [userType, setUserType] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const type = localStorage.getItem("userType");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    setUserType(type);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">لا توجد بيانات مستخدم</h2>
            <p className="text-muted-foreground mb-6">
              لم نتمكن من تحميل بيانات ملفك الشخصي. يرجى تسجيل الدخول مرة أخرى.
            </p>
            <Button onClick={() => navigate("/login")} className="rounded-2xl">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.fullName) return "م";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-title">
              الملف الشخصي
            </h1>
            <p className="text-lg text-muted-foreground">
              عرض وتحديث معلوماتك الشخصية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="rounded-2xl shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24" data-testid="avatar-profile">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold" data-testid="text-user-name">
                        {user.fullName}
                      </h2>
                      {user.username && (
                        <p className="text-sm text-muted-foreground" data-testid="text-username">
                          @{user.username}
                        </p>
                      )}
                      <Badge variant="default" className="mt-2" data-testid="badge-user-type">
                        {userType === "freelancer" ? "مستقل" : "صاحب منتج"}
                      </Badge>
                    </div>

                    {user.jobTitle && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-job-title">
                        <Briefcase className="h-4 w-4" />
                        {user.jobTitle}
                      </div>
                    )}

                    <Button variant="outline" className="w-full rounded-2xl mt-4" data-testid="button-edit-profile">
                      <Edit className="ml-2 h-4 w-4" />
                      تعديل الملف الشخصي
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats for Freelancer */}
              {userType === "freelancer" && (
                <Card className="rounded-2xl shadow-md mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-sm">التقييم</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">--</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">المهام المكتملة</span>
                      <span className="font-semibold" data-testid="stat-completed-tasks">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">إجمالي الأرباح</span>
                      <span className="font-semibold text-green-600">0 ر.س</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Details Tabs */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle>تفاصيل الحساب</CardTitle>
                  <CardDescription>المعلومات الشخصية وإعدادات الحساب</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl">
                      <TabsTrigger value="personal" className="rounded-lg" data-testid="tab-personal">
                        المعلومات الشخصية
                      </TabsTrigger>
                      <TabsTrigger value="account" className="rounded-lg" data-testid="tab-account">
                        إعدادات الحساب
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4 mt-6">
                      {/* Email */}
                      <div className="flex items-start gap-4 p-4 rounded-xl border">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                          <p className="text-base" data-testid="text-email">{user.email}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-4 p-4 rounded-xl border">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
                          <p className="text-base" data-testid="text-phone">
                            {user.countryCode} {user.phone}
                          </p>
                        </div>
                      </div>

                      {/* Bio - Freelancer */}
                      {userType === "freelancer" && user.bio && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">نبذة مختصرة</p>
                            <p className="text-base" data-testid="text-bio">{user.bio}</p>
                          </div>
                        </div>
                      )}

                      {/* About Me - Freelancer */}
                      {userType === "freelancer" && user.aboutMe && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">عني</p>
                            <p className="text-base whitespace-pre-wrap" data-testid="text-about-me">
                              {user.aboutMe}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Company Name - Product Owner */}
                      {userType === "product_owner" && user.companyName && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">اسم الشركة</p>
                            <p className="text-base" data-testid="text-company-name">{user.companyName}</p>
                          </div>
                        </div>
                      )}

                      {/* Product Name - Product Owner */}
                      {userType === "product_owner" && user.productName && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">اسم المنتج</p>
                            <p className="text-base" data-testid="text-product-name">{user.productName}</p>
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {user.services && user.services.length > 0 && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-2">الخدمات</p>
                            <div className="flex flex-wrap gap-2" data-testid="container-services">
                              {user.services.map((service: string, index: number) => (
                                <Badge key={index} variant="secondary" className="rounded-lg">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Join Date */}
                      <div className="flex items-start gap-4 p-4 rounded-xl border">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">تاريخ الانضمام</p>
                          <p className="text-base" data-testid="text-join-date">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            }) : "غير متوفر"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-4 mt-6">
                      {/* Payment Method - Freelancer */}
                      {userType === "freelancer" && user.paymentMethod && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">وسيلة الدفع</p>
                            <p className="text-base" data-testid="text-payment-method">{user.paymentMethod}</p>
                          </div>
                        </div>
                      )}

                      {/* Verification Status - Freelancer */}
                      {userType === "freelancer" && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">حالة التوثيق</p>
                            <Badge 
                              variant={user.isVerified ? "default" : "secondary"} 
                              className="mt-1"
                              data-testid="badge-verified-status"
                            >
                              {user.isVerified ? "موثق" : "غير موثق"}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Settings Buttons */}
                      <div className="space-y-3 pt-4">
                        <Button variant="outline" className="w-full rounded-2xl justify-start" data-testid="button-change-password">
                          <Settings className="ml-2 h-4 w-4" />
                          تغيير كلمة المرور
                        </Button>
                        <Button variant="outline" className="w-full rounded-2xl justify-start" data-testid="button-notifications">
                          <Settings className="ml-2 h-4 w-4" />
                          إعدادات الإشعارات
                        </Button>
                        <Button variant="outline" className="w-full rounded-2xl justify-start text-destructive" data-testid="button-delete-account">
                          <Settings className="ml-2 h-4 w-4" />
                          حذف الحساب
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
