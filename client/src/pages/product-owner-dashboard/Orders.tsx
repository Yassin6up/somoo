import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusConfig = {
  pending: { label: "قيد الانتظار", variant: "secondary" as const, icon: Clock },
  payment_confirmed: { label: "تم تأكيد الدفع", variant: "default" as const, icon: CheckCircle },
  in_progress: { label: "قيد التنفيذ", variant: "default" as const, icon: ShoppingBag },
  completed: { label: "مكتمل", variant: "default" as const, icon: CheckCircle },
  cancelled: { label: "ملغي", variant: "destructive" as const, icon: XCircle },
};

const serviceTypes: Record<string, string> = {
  google_play_reviews: "مراجعات Google Play",
  ios_reviews: "مراجعات iOS",
  website_reviews: "مراجعات المواقع",
  ux_testing: "اختبار تجربة المستخدم",
  software_testing: "اختبار البرمجيات",
  social_media: "وسائل التواصل الاجتماعي",
  social_media_engagement: "تفاعل وسائل التواصل",
  social_media_single: "التفاعل مع السوشيال ميديا (حساب واحد شهرياً)",
  social_media_dual: "التفاعل مع السوشيال ميديا (حسابين شهرياً)",
  google_maps_reviews: "مراجعات Google Maps",
  google_maps: "مراجعات Google Maps",
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">طلباتي</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "payment_confirmed");
  const activeOrders = orders.filter((o) => o.status === "in_progress");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-orders-title">طلباتي</h1>
          <p className="text-muted-foreground">جميع طلبات الخدمات التي قمت بشرائها</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-orders">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-orders">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-orders">{activeOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-orders">{completedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات بعد</h3>
            <p className="text-muted-foreground text-center">
              عندما تقوم بشراء خدمات من الجروبات، ستظهر هنا
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const config = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = config?.icon || ShoppingBag;

            return (
              <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-order-service-${order.id}`}>
                        {serviceTypes[order.serviceType] || order.serviceType}
                      </CardTitle>
                      <CardDescription>
                        رقم الطلب: {order.id.slice(0, 8)}...
                      </CardDescription>
                    </div>
                    <Badge variant={config?.variant || "secondary"} data-testid={`badge-status-${order.id}`}>
                      <StatusIcon className="ml-1 h-3 w-3" />
                      {config?.label || order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">الكمية</span>
                      <p className="font-semibold" data-testid={`text-quantity-${order.id}`}>
                        {order.quantity}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">المبلغ الإجمالي</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-lg" data-testid={`text-total-${order.id}`}>
                          ${order.totalAmount}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">طريقة الدفع</span>
                      <p className="text-sm" data-testid={`text-payment-method-${order.id}`}>
                        {order.paymentMethod}
                      </p>
                    </div>
                    {order.createdAt && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">تاريخ الطلب</span>
                        <p className="text-sm">
                          {format(new Date(order.createdAt), "dd MMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    )}
                  </div>
                  {order.paymentDetails && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">تفاصيل الدفع:</span>
                      <p className="text-sm mt-1">{order.paymentDetails}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
