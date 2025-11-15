import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, TrendingUp, DollarSign } from "lucide-react";
import type { Wallet } from "@shared/schema";

export default function WalletPage() {
  const { data: wallet, isLoading } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  const balance = parseFloat(wallet?.balance || "0");
  const totalEarned = parseFloat(wallet?.totalEarned || "0");
  const totalWithdrawn = parseFloat(wallet?.totalWithdrawn || "0");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">المحفظة</h2>
        <p className="text-muted-foreground mt-1">
          تتبع أرباحك ورصيدك المتاح
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle>آخر المعاملات</CardTitle>
          <CardDescription>سجل المعاملات الأخيرة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد معاملات حديثة
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
