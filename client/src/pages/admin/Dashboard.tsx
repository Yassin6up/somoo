import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  UsersRound, 
  FolderKanban, 
  ShoppingCart, 
  ClipboardList, 
  Wallet, 
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/statistics"],
  });

  const statCards = [
    {
      title: "الفريلانسرز",
      value: stats?.freelancers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "أصحاب المنتجات",
      value: stats?.productOwners || 0,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "الجروبات",
      value: stats?.groups || 0,
      icon: UsersRound,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "المشاريع",
      value: stats?.projects || 0,
      icon: FolderKanban,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "الطلبات",
      value: stats?.orders || 0,
      icon: ShoppingCart,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      title: "المهام",
      value: stats?.tasks || 0,
      icon: ClipboardList,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      title: "السحوبات",
      value: stats?.withdrawals || 0,
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      title: "السحوبات المعلقة",
      value: stats?.pendingWithdrawals || 0,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على منصة سُمُوّ</p>
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium text-muted-foreground">
                إجمالي الإيرادات
              </CardTitle>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-bold">
                  ${isLoading ? "..." : stats?.totalRevenue.toLocaleString()}
                </span>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`stat-${card.title}`}>
                  {card.value.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <a 
              href="/admin/users/create" 
              className="p-4 border rounded-lg hover-elevate cursor-pointer transition-all"
              data-testid="link-create-user"
            >
              <Users className="h-5 w-5 mb-2 text-primary" />
              <h3 className="font-semibold">إضافة مستخدم إداري</h3>
              <p className="text-sm text-muted-foreground">إنشاء حساب جديد لفريق العمل</p>
            </a>

            <a 
              href="/admin/withdrawals" 
              className="p-4 border rounded-lg hover-elevate cursor-pointer transition-all"
              data-testid="link-withdrawals"
            >
              <Wallet className="h-5 w-5 mb-2 text-amber-600" />
              <h3 className="font-semibold">مراجعة السحوبات</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.pendingWithdrawals || 0} سحب قيد الانتظار
              </p>
            </a>

            <a 
              href="/admin/reports" 
              className="p-4 border rounded-lg hover-elevate cursor-pointer transition-all"
              data-testid="link-reports"
            >
              <TrendingUp className="h-5 w-5 mb-2 text-green-600" />
              <h3 className="font-semibold">التقارير المالية</h3>
              <p className="text-sm text-muted-foreground">عرض التحليلات والإحصائيات</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
