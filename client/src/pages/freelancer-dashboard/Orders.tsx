import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "outline" },
      payment_confirmed: { label: "تم تأكيد الدفع", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      completed: { label: "مكتمل", variant: "default" },
      cancelled: { label: "ملغي", variant: "destructive" },
    };
    const statusInfo = statusConfig[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getServiceLabel = (serviceType: string) => {
    const services: Record<string, string> = {
      google_play_reviews: "مراجعات Google Play",
      ios_reviews: "مراجعات iOS",
      website_reviews: "مراجعات المواقع",
      ux_testing: "اختبار تجربة المستخدم",
      software_testing: "اختبار البرمجيات",
      social_media: "وسائل التواصل الاجتماعي",
      social_media_single: "التفاعل مع السوشيال ميديا (حساب واحد شهرياً)",
      social_media_dual: "التفاعل مع السوشيال ميديا (حسابين شهرياً)",
      google_maps_reviews: "مراجعات Google Maps",
      google_maps: "مراجعات Google Maps",
    };
    return services[serviceType] || serviceType;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      vodafone_cash: "فودافون كاش",
      etisalat_cash: "اتصالات كاش",
      orange_cash: "أورانج كاش",
      bank_card: "البطاقة البنكية",
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">الطلبات الواردة</h2>
        <p className="text-muted-foreground mt-1">
          تابع طلبات الخدمات الواردة من أصحاب المشاريع
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-2xl hover-elevate" data-testid={`card-order-${order.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">{getServiceLabel(order.serviceType)}</CardTitle>
                    <CardDescription>
                      الكمية: {order.quantity}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* تفاصيل المبلغ */}
              <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                  <span className="font-medium">${order.totalAmount}</span>
                </div>
                {order.platformFee && parseFloat(order.platformFee) > 0 && (
                  <>
                    <div className="flex justify-between text-amber-600">
                      <span>رسوم المنصة (10%):</span>
                      <span className="font-medium">-${order.platformFee}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-border">
                      <span className="text-muted-foreground">صافي المبلغ للجروب:</span>
                      <span className="font-semibold">${order.netAmount || (parseFloat(order.totalAmount) - parseFloat(order.platformFee)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* تفاصيل التوزيع */}
              {order.leaderCommission && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl space-y-1.5 text-sm border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between text-blue-700 dark:text-blue-400">
                    <span className="font-medium">عمولة قائد الجروب (3%):</span>
                    <span className="font-bold">${order.leaderCommission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ للتوزيع على الأعضاء:</span>
                    <span className="font-semibold">${order.memberDistribution}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-blue-200 dark:border-blue-800">
                    <span className="text-muted-foreground">عدد الأعضاء: {order.groupMembersCount}</span>
                    <span>
                      <span className="text-muted-foreground">نصيب كل عضو: </span>
                      <span className="font-bold text-green-600">${order.perMemberAmount}</span>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">طريقة الدفع:</p>
                  <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">التاريخ:</p>
                  <p className="font-medium">
                    {format(new Date(order.createdAt), "PPP", { locale: ar })}
                  </p>
                </div>
              </div>
              {order.paymentDetails && (
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm font-medium">تفاصيل الدفع:</p>
                  <p className="text-sm text-muted-foreground">{order.paymentDetails}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد طلبات واردة حالياً</p>
        </div>
      )}
    </div>
  );
}
