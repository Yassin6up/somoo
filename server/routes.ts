import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function WithdrawalManagement() {
  const { toast } = useToast();

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: async () => {
      return await apiRequest("/api/admin/withdrawals", "GET");
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/withdrawals/${id}/approve`, "PATCH", {});
    },
    onSuccess: () => {
      toast({ title: "تم الموافقة", description: "تم الموافقة على طلب السحب بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error?.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/withdrawals/${id}/reject`, "PATCH", {});
    },
    onSuccess: () => {
      toast({ title: "تم الرفض", description: "تم رفض طلب السحب بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error?.message, variant: "destructive" });
    },
  });

  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === "pending");

  if (isLoading) return <div className="py-12 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">إدارة طلبات السحب</h2>
        <p className="text-muted-foreground mt-1">مراجعة والموافقة على طلبات السحب من المستقلين</p>
      </div>

      {/* Pending Withdrawals */}
      <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">طلبات قيد المراجعة ({pendingWithdrawals.length})</CardTitle>
          <CardDescription>اضغط على أحد الطلبات لمراجعة تفاصيل المستقل</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد طلبات قيد المراجعة</div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((w: any) => (
                <div key={w.id} className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{w.amount} ر.س</p>
                      <p className="text-sm text-muted-foreground">{w.freelancerName}</p>
                      <p className="text-xs text-muted-foreground">{w.freelancerEmail}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Clock className="w-3 h-3 ml-1" />
                      قيد المراجعة
                    </Badge>
                  </div>

                  {/* Wallet Info */}
                  <div className="bg-gray-50 p-3 rounded mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">الرصيد المتاح</p>
                      <p className="font-bold">{w.walletBalance} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الأرباح المعلقة</p>
                      <p className="font-bold">{w.pendingBalance} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">إجمالي الأرباح</p>
                      <p className="font-bold">{w.totalEarned} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">السحوبات السابقة</p>
                      <p className="font-bold">{w.totalWithdrawn} ر.س</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-amber-50 p-3 rounded mb-3 text-sm">
                    <p className="font-medium">تفاصيل الدفع:</p>
                    <p className="text-muted-foreground">{w.paymentMethod}</p>
                    <p className="font-mono text-xs">{w.accountNumber}</p>
                  </div>

                  {/* Transaction History */}
                  {w.transactions?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-medium text-sm mb-2">سجل الأرباح (آخر 5):</p>
                      <div className="space-y-1">
                        {w.transactions.slice(0, 5).map((t: any) => (
                          <div key={t.id} className="flex justify-between text-xs p-1 bg-gray-50 rounded">
                            <span>{t.description || t.type}</span>
                            <span className={t.type === "earning" ? "text-green-600 font-bold" : "text-red-600"}>
                              {t.type === "earning" ? "+" : "-"}{t.amount} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(w.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-withdrawal-${w.id}`}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      الموافقة
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate(w.id)}
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                      data-testid={`button-reject-withdrawal-${w.id}`}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      الرفض
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Withdrawals History */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>سجل جميع طلبات السحب</CardTitle>
          <CardDescription>جميع الطلبات والحالات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستقل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w: any) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{w.freelancerName}</p>
                        <p className="text-xs text-muted-foreground">{w.freelancerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{w.amount} ر.س</TableCell>
                    <TableCell className="text-sm">{w.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          w.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : w.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {w.status === "completed"
                          ? "مكتمل"
                          : w.status === "pending"
                          ? "قيد المراجعة"
                          : "مرفوض"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(w.createdAt), { addSuffix: true, locale: ar })}
                    </TableCell>
                    <TableCell>
                      {w.status === "completed" && (
                        <span className="text-xs text-green-600">✓ موافق عليه</span>
                      )}
                      {w.status === "rejected" && (
                        <span className="text-xs text-red-600">✗ مرفوض</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
