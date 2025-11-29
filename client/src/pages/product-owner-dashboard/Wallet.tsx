import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, TrendingUp, Lock, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Wallet() {
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  console.log("💼 Wallet Page - Current User:", currentUser);
  console.log("💼 Wallet Page - User ID:", currentUser?.id);

  // Fetch wallet balance
  const { data: wallet, isLoading: loadingWallet, error: walletError } = useQuery({
    queryKey: [`/api/product-owners/${currentUser?.id}/wallet`],
    queryFn: async () => {
      console.log("🚀 Fetching wallet from:", `/api/product-owners/${currentUser?.id}/wallet`);
      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);
      
      const response = await fetch(`/api/product-owners/${currentUser?.id}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to fetch wallet: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Wallet data received:", data);
      return data;
    },
    enabled: !!currentUser?.id,
  });

  console.log("💰 Wallet Data:", wallet);
  console.log("⏳ Loading Wallet:", loadingWallet);
  console.log("❌ Wallet Error:", walletError);

  // Fetch transactions
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: [`/api/product-owners/${currentUser?.id}/wallet/transactions`],
    enabled: !!currentUser?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  if (loadingWallet || loadingTransactions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <WalletIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">المحفظة</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              الرصيد المتاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {formatCurrency(wallet?.availableBalance || 0)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              متاح للسحب
            </p>
          </CardContent>
        </Card>

        {/* Escrow Balance */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              الرصيد المحجوز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {formatCurrency(wallet?.escrowBalance || 0)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              محجوز للمشاريع
            </p>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              الإجمالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency((wallet?.availableBalance || 0) + (wallet?.escrowBalance || 0))}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              إجمالي الرصيد
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            سجل المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد معاملات بعد
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' ? 'bg-green-100' :
                        transaction.type === 'escrow_hold' ? 'bg-orange-100' :
                        transaction.type === 'escrow_release' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : transaction.type === 'escrow_hold' ? (
                          <Lock className="h-4 w-4 text-orange-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'deposit' && 'إيداع'}
                          {transaction.type === 'escrow_hold' && 'حجز للمشروع'}
                          {transaction.type === 'escrow_release' && 'إطلاق من الحجز'}
                          {transaction.type === 'withdrawal' && 'سحب'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.createdAt), 'PPp', { locale: ar })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'deposit' || transaction.type === 'escrow_release'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'escrow_release' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Badge variant={
                      transaction.status === 'completed' ? 'default' :
                      transaction.status === 'pending' ? 'secondary' :
                      'destructive'
                    } className="mt-1">
                      {transaction.status === 'completed' && 'مكتمل'}
                      {transaction.status === 'pending' && 'قيد المعالجة'}
                      {transaction.status === 'failed' && 'فشل'}
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
