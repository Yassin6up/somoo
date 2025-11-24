import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet as WalletIcon, TrendingUp, DollarSign, Clock, AlertCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Wallet, Withdrawal } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

const paymentMethods = [
  "فودافون كاش",
  "اتصالات كاش",
  "أورانج كاش",
  "التحويل البنكي",
];

export default function WalletPage() {
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const { data: wallet, isLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/my"],
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/withdrawals", "POST", {
        amount: parseFloat(withdrawAmount),
        paymentMethod,
        accountNumber,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء طلب السحب بنجاح",
      });
      setWithdrawAmount("");
      setPaymentMethod("");
      setAccountNumber("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/my"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "فشل إنشاء طلب السحب",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (withdrawalId: string) => {
      return await apiRequest(`/api/withdrawals/${withdrawalId}/cancel`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إلغاء طلب السحب",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/my"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "فشل إلغاء طلب السحب",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  const balance = parseFloat(wallet?.balance || "0");
  const pendingBalance = parseFloat(wallet?.pendingBalance || "0");
  const totalEarned = parseFloat(wallet?.totalEarned || "0");
  const totalWithdrawn = parseFloat(wallet?.totalWithdrawn || "0");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const totalPendingWithdrawal = pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">المحفظة</h2>
        <p className="text-muted-foreground mt-1">
          تتبع أرباحك ورصيدك المتاح والمسحوبات
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl hover-elevate bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                الرصيد المتاح
              </CardTitle>
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{balance.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              متاح للسحب
            </p>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl hover-elevate ${pendingBalance > 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                الأرباح المعلقة
              </CardTitle>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingBalance > 0 ? 'text-amber-700' : 'text-muted-foreground'}`}>
              {pendingBalance.toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingBalance > 0 ? 'في انتظار موافقة قائد المجموعة' : 'لا توجد أرباح معلقة'}
            </p>
            {pendingBalance > 0 && (
              <Badge className="mt-2 bg-amber-100 text-amber-800 text-xs">
                <AlertCircle className="w-3 h-3 ml-1" />
                قيد المراجعة
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl hover-elevate">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                إجمالي الأرباح
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalEarned.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ بداية الانضمام
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl hover-elevate">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                إجمالي المسحوبات
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalWithdrawn.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              إجمالي ما تم سحبه
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>طلب سحب جديد</CardTitle>
          <CardDescription>اطلب سحب أموالك إلى حسابك البنكي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">المبلغ (ر.س)</label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="0"
                step="0.01"
                disabled={withdrawMutation.isPending}
                data-testid="input-withdraw-amount"
              />
              <p className="text-xs text-muted-foreground mt-1">الرصيد المتاح: {balance.toFixed(2)} ر.س</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">طريقة الدفع</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={withdrawMutation.isPending}>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">رقم الحساب</label>
              <Input
                type="text"
                placeholder="أدخل رقم حسابك"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={withdrawMutation.isPending}
                data-testid="input-account-number"
              />
            </div>

            <Button
              onClick={() => withdrawMutation.mutate()}
              disabled={!withdrawAmount || !paymentMethod || !accountNumber || withdrawMutation.isPending}
              className="w-full"
              data-testid="button-request-withdrawal"
            >
              <Send className="w-4 h-4 ml-2" />
              {withdrawMutation.isPending ? "جاري الإنشاء..." : "طلب السحب"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingWithdrawals.length > 0 && (
        <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">طلبات السحب قيد المراجعة</CardTitle>
            <CardDescription>إجمالي قيد المراجعة: {totalPendingWithdrawal.toFixed(2)} ر.س</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{withdrawal.amount} ر.س</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.paymentMethod}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelMutation.mutate(withdrawal.id)}
                    disabled={cancelMutation.isPending}
                    data-testid={`button-cancel-withdrawal-${withdrawal.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>سجل السحب</CardTitle>
          <CardDescription>جميع عمليات السحب السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عمليات سحب
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{withdrawal.amount} ر.س</p>
                    <p className="text-sm text-muted-foreground">{withdrawal.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        withdrawal.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : withdrawal.status === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {withdrawal.status === "completed"
                        ? "مكتمل"
                        : withdrawal.status === "pending"
                        ? "قيد المراجعة"
                        : "ملغى"}
                    </Badge>
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
