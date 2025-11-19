import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
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

interface Withdrawal {
  id: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  paymentMethod: string;
  accountDetails: string;
  createdAt: string;
  processedAt: string | null;
}

export default function AdminWithdrawals() {
  const { toast } = useToast();

  const { data: withdrawals = [], isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(`/api/admin/withdrawals/${id}/approve`,"PATCH", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "تم الاعتماد بنجاح",
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

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(`/api/admin/withdrawals/${id}/reject`,"PATCH", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "تم الرفض",
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

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  const completedWithdrawals = withdrawals.filter(w => w.status === "completed");
  const rejectedWithdrawals = withdrawals.filter(w => w.status === "rejected");
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 ml-1" />
            مكتمل
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">طلبات السحب</h1>
        <p className="text-muted-foreground mt-1">مراجعة واعتماد طلبات سحب الأرباح</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-pending-withdrawals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">
              {pendingWithdrawals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPendingAmount.toLocaleString('ar-SA')} ر.س
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-withdrawals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-count">
              {completedWithdrawals.length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-rejected-withdrawals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المرفوضة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rejected-count">
              {rejectedWithdrawals.length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-withdrawals">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">
              {withdrawals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع طلبات السحب</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد طلبات سحب</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفريلانسر</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>تفاصيل الحساب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>تاريخ المعالجة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                      <TableCell className="font-medium">{withdrawal.freelancerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-green-600">
                          <DollarSign className="h-4 w-4" />
                          {withdrawal.amount.toLocaleString('ar-SA')} ر.س
                        </div>
                      </TableCell>
                      <TableCell>{withdrawal.paymentMethod}</TableCell>
                      <TableCell className="max-w-xs truncate">{withdrawal.accountDetails}</TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(withdrawal.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        {withdrawal.processedAt
                          ? formatDistanceToNow(new Date(withdrawal.processedAt), {
                              addSuffix: true,
                              locale: ar,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate(withdrawal.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              data-testid={`button-approve-${withdrawal.id}`}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              اعتماد
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(withdrawal.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              data-testid={`button-reject-${withdrawal.id}`}
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </div>
                        )}
                        {withdrawal.status !== "pending" && (
                          <span className="text-muted-foreground text-sm">تمت المعالجة</span>
                        )}
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
