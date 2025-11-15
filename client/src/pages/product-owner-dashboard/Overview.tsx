import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Clock, CheckCircle2, ShoppingCart } from "lucide-react";
import type { Order } from "@shared/schema";

export default function ProductOwnerOverview() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "payment_confirmed").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const stats = [
    {
      title: "إجمالي الطلبات",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "قيد المعالجة",
      value: pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "مكتملة",
      value: completedOrders,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "إجمالي الإنفاق",
      value: `$${totalSpent.toFixed(2)}`,
      icon: FolderKanban,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">مرحباً بك في لوحة التحكم</h2>
        <p className="text-muted-foreground mt-1">
          إليك نظرة عامة على طلباتك ومشاريعك
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-2xl hover-elevate" data-testid={`card-stat-${stat.title}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`value-${stat.title}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>نشاطاتك الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              لا توجد نشاطات حديثة
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>الإشعارات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              لا توجد إشعارات جديدة
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
