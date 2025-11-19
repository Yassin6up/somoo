import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, ShoppingCart, Folder, CheckCircle, XCircle, DollarSign } from "lucide-react";
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

interface ProductOwner {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  companyName: string | null;
  country: string;
  totalSpent: number;
  projectsCreated: number;
  ordersPlaced: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProductOwners() {
  const { toast } = useToast();

  const { data: productOwners = [], isLoading } = useQuery<ProductOwner[]>({
    queryKey: ["/api/admin/product-owners"],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(`/api/admin/product-owners/${id}/toggle-status`,"PATCH", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-owners"] });
      toast({
        title: "تم التحديث بنجاح",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeOwners = productOwners.filter(po => po.isActive).length;
  const totalSpent = productOwners.reduce((sum, po) => sum + po.totalSpent, 0);
  const totalProjects = productOwners.reduce((sum, po) => sum + po.projectsCreated, 0);
  const totalOrders = productOwners.reduce((sum, po) => sum + po.ordersPlaced, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">أصحاب المنتجات</h1>
        <p className="text-muted-foreground mt-1">إدارة ومراقبة أصحاب المنتجات المسجلين في المنصة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-owners">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصحاب</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{productOwners.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-owners">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشطون</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-count">{activeOwners}</div>
            <p className="text-xs text-muted-foreground">
              {productOwners.length > 0 ? Math.round((activeOwners / productOwners.length) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-spent">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-spent">
              {totalSpent.toLocaleString('ar-SA')} ر.س
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-projects-orders">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع والطلبات</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold">{totalProjects}</div>
              <span className="text-xs text-muted-foreground">مشروع</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-lg font-bold">{totalOrders}</div>
              <span className="text-xs text-muted-foreground">طلب</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة أصحاب المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : productOwners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا يوجد أصحاب منتجات مسجلين</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>اسم الشركة</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead>المشاريع</TableHead>
                    <TableHead>الطلبات</TableHead>
                    <TableHead>إجمالي الإنفاق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productOwners.map((owner) => (
                    <TableRow key={owner.id} data-testid={`row-owner-${owner.id}`}>
                      <TableCell className="font-medium">{owner.fullName}</TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.companyName || "-"}</TableCell>
                      <TableCell>{owner.country}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>{owner.projectsCreated}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span>{owner.ordersPlaced}</span>
                        </div>
                      </TableCell>
                      <TableCell>{owner.totalSpent.toLocaleString('ar-SA')} ر.س</TableCell>
                      <TableCell>
                        {owner.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 ml-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(owner.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={owner.isActive ? "destructive" : "default"}
                          onClick={() => toggleStatusMutation.mutate(owner.id)}
                          disabled={toggleStatusMutation.isPending}
                          data-testid={`button-toggle-${owner.id}`}
                        >
                          {owner.isActive ? "إيقاف" : "تفعيل"}
                        </Button>
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
