import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Wallet, Withdrawal } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function WithdrawalsPage() {
  const { toast } = useToast();
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [withdrawalAccount, setWithdrawalAccount] = useState("");

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  const { data: withdrawals = [], isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/my"],
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; accountNumber: string }) => {
      return apiRequest( "/api/withdrawals","POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      setShowWithdrawalDialog(false);
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      setWithdrawalAccount("");
      toast({
        title: "تم إرسال طلب السحب بنجاح",
        description: "سيتم مراجعة طلبك وتحويل المبلغ قريباً",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء إنشاء طلب السحب",
        variant: "destructive",
      });
    },
  });

  const handleWithdrawalSubmit = () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!withdrawalAmount || amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawalMethod) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار طريقة الدفع",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawalAccount.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الحساب",
        variant: "destructive",
      });
      return;
    }

    const walletBalance = parseFloat(wallet?.balance || "0");
    if (amount > walletBalance) {
      toast({
        title: "خطأ",
        description: `الرصيد المتاح غير كافٍ. الرصيد الحالي: ${walletBalance} ر.س`,
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate({
      amount: Number(withdrawalAmount),
      paymentMethod: withdrawalMethod,
      accountNumber: withdrawalAccount,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد المراجعة", variant: "outline" },
      processing: { label: "جارٍ المعالجة", variant: "secondary" },
      completed: { label: "مكتمل", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      vodafone_cash: "فودافون كاش",
      etisalat_cash: "اتصالات كاش",
      orange_cash: "أورانج كاش",
      bank_card: "البطاقة البنكية",
      bank_transfer: "تحويل بنكي",
    };
    return methods[method] || method;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">السحوبات</h2>
          <p className="text-muted-foreground mt-1">
            اطلب سحب أرباحك وتابع حالة الطلبات
          </p>
        </div>
        <Button
          onClick={() => setShowWithdrawalDialog(true)}
          className="rounded-xl"
          data-testid="button-new-withdrawal"
        >
          <Download className="ml-2 h-4 w-4" />
          طلب سحب جديد
        </Button>
      </div>

      <Card className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5 text-primary" />
            <CardTitle>رصيد المحفظة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {wallet?.balance || "0"} ر.س
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            متاح للسحب
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">سجل السحوبات</h3>
        <div className="space-y-3">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="rounded-2xl hover-elevate" data-testid={`card-withdrawal-${withdrawal.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{withdrawal.amount} ر.س</span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span>طريقة الدفع: </span>
                        <span className="font-medium">{getPaymentMethodLabel(withdrawal.paymentMethod)}</span>
                      </div>
                      <div>
                        <span>رقم الحساب: </span>
                        <span className="font-medium">{withdrawal.accountNumber}</span>
                      </div>
                      <div>
                        <span>التاريخ: </span>
                        <span className="font-medium">
                          {format(new Date(withdrawal.createdAt), "PPP", { locale: ar })}
                        </span>
                      </div>
                    </div>
                    {withdrawal.adminNote && (
                      <div className="p-3 bg-muted rounded-xl mt-2">
                        <p className="text-sm font-medium">ملاحظة الإدارة:</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.adminNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {withdrawals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد طلبات سحب سابقة</p>
          </div>
        )}
      </div>

      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>طلب سحب جديد</DialogTitle>
            <DialogDescription>
              املأ البيانات المطلوبة لطلب سحب أرباحك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">المبلغ (ر.س)</Label>
              <Input
                id="amount"
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="rounded-xl mt-1"
                data-testid="input-withdrawal-amount"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-muted-foreground mt-1">
                الرصيد المتاح: {wallet?.balance || "0"} ر.س
              </p>
            </div>

            <div>
              <Label htmlFor="payment-method">طريقة الدفع</Label>
              <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                <SelectTrigger className="rounded-xl mt-1" data-testid="select-withdrawal-method">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                  <SelectItem value="etisalat_cash">اتصالات كاش</SelectItem>
                  <SelectItem value="orange_cash">أورانج كاش</SelectItem>
                  <SelectItem value="bank_card">البطاقة البنكية</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account-number">رقم الحساب / المحفظة</Label>
              <Input
                id="account-number"
                value={withdrawalAccount}
                onChange={(e) => setWithdrawalAccount(e.target.value)}
                placeholder="أدخل رقم الحساب"
                className="rounded-xl mt-1"
                data-testid="input-withdrawal-account"
              />
              <p className="text-sm text-muted-foreground mt-1">
                تأكد من صحة رقم الحساب لتجنب التأخير في التحويل
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawalDialog(false)}
              className="rounded-xl"
              data-testid="button-cancel-withdrawal"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleWithdrawalSubmit}
              disabled={createWithdrawalMutation.isPending}
              className="rounded-xl"
              data-testid="button-confirm-withdrawal"
            >
              <Download className="h-4 w-4 ml-1" />
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
