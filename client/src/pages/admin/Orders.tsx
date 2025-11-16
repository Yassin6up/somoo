import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, CheckCircle, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Order {
  id: string;
  productOwnerId: string;
  ownerName: string;
  groupId: string;
  groupName: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  leaderCommission: number;
  quantity: number;
  createdAt: string;
}

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.platformFee, 0);
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Clock className="h-3 w-3 ml-1" />
            قيد التنفيذ
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 ml-1" />
            مكتمل
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getServiceLabel = (type: string) => {
    const labels: Record<string, string> = {
      google_maps_reviews: "تقييمات خرائط جوجل",
      app_reviews: "تقييمات التطبيقات",
      ux_testing: "اختبار تجربة المستخدم",
      social_media_engagement: "تفاعل وسائل التواصل",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الطلبات المباشرة</h1>
        <p className="text-muted-foreground mt-1">إدارة ومراقبة الطلبات المباشرة من أصحاب المنتجات</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-orders">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{orders.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-orders">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-orders">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-count">{completedOrders}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمولة المنصة</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-revenue">
              {totalRevenue.toLocaleString('ar-SA')} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              من إجمالي {totalSales.toLocaleString('ar-SA')} ر.س
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد طلبات</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>صاحب المنتج</TableHead>
                    <TableHead>الجروب</TableHead>
                    <TableHead>نوع الخدمة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>عمولة المنصة</TableHead>
                    <TableHead>عمولة القائد</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">{order.ownerName}</TableCell>
                      <TableCell>{order.groupName}</TableCell>
                      <TableCell>{getServiceLabel(order.serviceType)}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.totalAmount.toLocaleString('ar-SA')} ر.س</TableCell>
                      <TableCell className="text-green-600 font-bold">
                        {order.platformFee.toLocaleString('ar-SA')} ر.س
                      </TableCell>
                      <TableCell>{order.leaderCommission.toLocaleString('ar-SA')} ر.س</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
