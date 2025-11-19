import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, TrendingUp, DollarSign, CheckCircle, XCircle } from "lucide-react";
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

interface Freelancer {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  country: string;
  rating: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  tasksCompleted: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminFreelancers() {
  const { toast } = useToast();

  const { data: freelancers = [], isLoading } = useQuery<Freelancer[]>({
    queryKey: ["/api/admin/freelancers"],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest( `/api/admin/freelancers/${id}/toggle-status`,"PATCH", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/freelancers"] });
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

  const activeFreelancers = freelancers.filter(f => f.isActive).length;
  const totalEarnings = freelancers.reduce((sum, f) => sum + f.totalEarnings, 0);
  const averageRating = freelancers.length > 0
    ? freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الفريلانسرز</h1>
        <p className="text-muted-foreground mt-1">إدارة ومراقبة الفريلانسرز المسجلين في المنصة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-freelancers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفريلانسرز</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{freelancers.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-freelancers">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشطون</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-count">{activeFreelancers}</div>
            <p className="text-xs text-muted-foreground">
              {freelancers.length > 0 ? Math.round((activeFreelancers / freelancers.length) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-earnings">
              {totalEarnings.toLocaleString('ar-SA')} ر.س
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-average-rating">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rating">
              {averageRating.toFixed(1)} ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفريلانسرز</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : freelancers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا يوجد فريلانسرز مسجلين</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>المهام المكتملة</TableHead>
                    <TableHead>الرصيد المتاح</TableHead>
                    <TableHead>الرصيد المعلق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {freelancers.map((freelancer) => (
                    <TableRow key={freelancer.id} data-testid={`row-freelancer-${freelancer.id}`}>
                      <TableCell className="font-medium">{freelancer.fullName}</TableCell>
                      <TableCell>{freelancer.email}</TableCell>
                      <TableCell>{freelancer.country}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{freelancer.rating.toFixed(1)}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </TableCell>
                      <TableCell>{freelancer.tasksCompleted}</TableCell>
                      <TableCell>{freelancer.availableBalance.toLocaleString('ar-SA')} ر.س</TableCell>
                      <TableCell>{freelancer.pendingBalance.toLocaleString('ar-SA')} ر.س</TableCell>
                      <TableCell>
                        {freelancer.isActive ? (
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
                        {formatDistanceToNow(new Date(freelancer.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={freelancer.isActive ? "destructive" : "default"}
                          onClick={() => toggleStatusMutation.mutate(freelancer.id)}
                          disabled={toggleStatusMutation.isPending}
                          data-testid={`button-toggle-${freelancer.id}`}
                        >
                          {freelancer.isActive ? "إيقاف" : "تفعيل"}
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
