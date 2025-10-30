import { useEffect, useState } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileCheck, TrendingUp, Wallet, Bell, Settings, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [location] = useWouterLocation();
  const [role, setRole] = useState<"freelancer" | "owner" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const roleParam = params.get("role");
    if (roleParam === "freelancer" || roleParam === "owner") {
      setRole(roleParam);
    }
  }, [location]);

  const userName = role === "freelancer" ? "إبراهيم" : "أحمد";

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
              مرحبًا {userName} 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {role === "freelancer" 
                ? "هذه أول مهامك القادمة!" 
                : "ابدأ أول حملة لاختبار منتجك 🚀"}
            </p>
          </div>

          {/* Sidebar Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card className="rounded-2xl shadow-md">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl hover-elevate"
                      data-testid="nav-dashboard"
                    >
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl hover-elevate"
                      data-testid="nav-tasks"
                    >
                      <FileCheck className="ml-2 h-4 w-4" />
                      {role === "freelancer" ? "مهامي" : "حملاتي"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl hover-elevate"
                      data-testid="nav-wallet"
                    >
                      <Wallet className="ml-2 h-4 w-4" />
                      المحفظة
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl hover-elevate"
                      data-testid="nav-notifications"
                    >
                      <Bell className="ml-2 h-4 w-4" />
                      الإشعارات
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-xl hover-elevate"
                      data-testid="nav-settings"
                    >
                      <Settings className="ml-2 h-4 w-4" />
                      الإعدادات
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {role === "freelancer" ? "المهام المكتملة" : "الحملات النشطة"}
                        </p>
                        <p className="text-2xl font-bold mt-1" data-testid="stat-value-1">0</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {role === "freelancer" ? "الأرباح" : "المختبرين"}
                        </p>
                        <p className="text-2xl font-bold mt-1" data-testid="stat-value-2">
                          {role === "freelancer" ? "0 ر.س" : "0"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        {role === "freelancer" ? (
                          <Wallet className="h-6 w-6 text-primary" />
                        ) : (
                          <Users className="h-6 w-6 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">التقييم</p>
                        <p className="text-2xl font-bold mt-1" data-testid="stat-value-3">--</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Empty State */}
              <Card className="rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle>
                    {role === "freelancer" ? "المهام المتاحة" : "حملاتك"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                      <FileCheck className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2" data-testid="text-empty-title">
                        {role === "freelancer" 
                          ? "لا توجد مهام متاحة حاليًا" 
                          : "لم تبدأ أي حملة بعد"}
                      </h3>
                      <p className="text-muted-foreground">
                        {role === "freelancer" 
                          ? "سنقوم بإشعارك عند توفر مهام جديدة مناسبة لمهاراتك" 
                          : "ابدأ حملتك الأولى للحصول على اختبارات وتقييمات احترافية"}
                      </p>
                    </div>
                    {role === "owner" && (
                      <Button className="rounded-2xl mt-4" data-testid="button-create-campaign">
                        إنشاء حملة جديدة
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
