import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, DollarSign, Calendar } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const paymentMethodLabels: Record<string, string> = {
  vodafone_cash: "فودافون كاش",
  etisalat_cash: "اتصالات كاش",
  orange_cash: "أورانج كاش",
  bank_card: "بطاقة بنكية",
  bank_transfer: "تحويل بنكي",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "قيد الانتظار", variant: "outline" },
  payment_confirmed: { label: "تم الدفع", variant: "default" },
  in_progress: { label: "قيد التنفيذ", variant: "secondary" },
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

export default function PaymentsPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Calculate payment statistics
  const totalPaid = orders
    .filter((o) => o.status === "payment_confirmed" || o.status === "in_progress" || o.status === "completed")
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const pendingPayments = orders
    .filter((o) => o.status === "pending")
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const thisMonthPayments = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const stats = [
    {
      title: "إجمالي المدفوعات",
      value: `$${totalPaid.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "المدفوعات المعلقة",
      value: `$${pendingPayments.toFixed(2)}`,
      icon: CreditCard,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "هذا الشهر",
      value: `$${thisMonthPayments.toFixed(2)}`,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "عدد المعاملات",
      value: orders.length,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-payments-title">المدفوعات</h1>
        <p className="text-muted-foreground">سجل جميع معاملاتك المالية</p>
      </div>

      {/* Statistics */}
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

      {/* Payment History */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            سجل المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد معاملات مالية حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover-elevate"
                    data-testid={`payment-item-${order.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold" data-testid={`payment-id-${order.id}`}>
                          #{order.id.slice(0, 8)}
                        </h3>
                        <Badge variant={statusLabels[order.status]?.variant || "outline"}>
                          {statusLabels[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}
                        </span>
                        <span>
                          الكمية: {order.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-green-600" data-testid={`payment-amount-${order.id}`}>
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
