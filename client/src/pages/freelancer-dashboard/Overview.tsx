import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, ShoppingBag } from "lucide-react";
import type { Task, Order } from "@shared/schema";

export default function FreelancerOverview() {
  const { data: myTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my-tasks"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const completedTasks = myTasks.filter((t) => t.status === "approved").length;
  const activeTasks = myTasks.filter((t) => t.status === "assigned" || t.status === "in_progress").length;
  const pendingTasks = myTasks.filter((t) => t.status === "submitted").length;
  const totalOrders = orders.length;

  const stats = [
    {
      title: "المهام المكتملة",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "المهام النشطة",
      value: activeTasks,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "المهام قيد المراجعة",
      value: pendingTasks,
      icon: ListTodo,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">مرحباً بك في لوحة التحكم</h2>
        <p className="text-muted-foreground mt-1">
          إليك نظرة عامة على أنشطتك وإحصائياتك
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
