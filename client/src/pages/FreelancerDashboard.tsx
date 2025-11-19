import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Task, Wallet, Order, Withdrawal } from "@shared/schema";
import { 
  Wallet as WalletIcon, 
  FileCheck, 
  TrendingUp, 
  Search, 
  Star, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Send,
  Play,
  ShoppingCart,
  Calendar,
  Package,
  CreditCard,
  Download,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FreelancerDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Withdrawal form state
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [withdrawalAccount, setWithdrawalAccount] = useState("");

  // Fetch available tasks
  const { data: availableTasks = [], isLoading: loadingAvailable } = useQuery<Task[]>({
    queryKey: ["/api/tasks/available"],
  });

  // Fetch freelancer's tasks
  const { data: myTasks = [], isLoading: loadingMyTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my-tasks"],
  });

  // Fetch wallet
  const { data: wallet } = useQuery<Wallet>({
    queryKey: ["/api/wallet"],
  });

  // Fetch orders for groups led by this freelancer
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch withdrawals
  const { data: withdrawals = [], isLoading: loadingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/my"],
  });

  // Accept task mutation
  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest( `/api/tasks/${taskId}/accept`,"POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({
        title: "تم قبول المهمة بنجاح",
        description: "يمكنك الآن البدء بالعمل على هذه المهمة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء قبول المهمة",
        variant: "destructive",
      });
    },
  });

  // Start task mutation
  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest( `/api/tasks/${taskId}/start`,"PATCH", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({
        title: "تم بدء المهمة",
        description: "المهمة الآن قيد التنفيذ",
      });
    },
  });

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, submission }: { taskId: string; submission: string }) => {
      return apiRequest( `/api/tasks/${taskId}/submit`,"PATCH", { submission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      setShowSubmitDialog(false);
      setSubmissionText("");
      setSelectedTask(null);
      toast({
        title: "تم تسليم المهمة بنجاح",
        description: "سيتم مراجعة عملك من قبل صاحب المنتج",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسليم المهمة",
        variant: "destructive",
      });
    },
  });

  const handleAcceptTask = (task: Task) => {
    acceptTaskMutation.mutate(task.id);
  };

  const handleStartTask = (task: Task) => {
    startTaskMutation.mutate(task.id);
  };

  const handleSubmitTask = () => {
    if (!selectedTask || !submissionText.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة التقرير",
        variant: "destructive",
      });
      return;
    }
    submitTaskMutation.mutate({
      taskId: selectedTask.id,
      submission: submissionText,
    });
  };

  const openSubmitDialog = (task: Task) => {
    setSelectedTask(task);
    setSubmissionText(task.submission || "");
    setShowSubmitDialog(true);
  };

  // Withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; accountNumber: string }) => {
      return apiRequest("/api/withdrawals","POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      setShowWithdrawalDialog(false);
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      setWithdrawalAccount("");
      toast({
        title: "تم إرسال طلب السحب",
        description: "سيتم مراجعة طلبك ومعالجته في أقرب وقت",
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

  // Filter available tasks
  const filteredAvailableTasks = availableTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.serviceType.includes(searchQuery)
  );

  // Calculate stats
  const completedTasks = myTasks.filter((t) => t.status === "approved").length;
  const activeTasks = myTasks.filter((t) => t.status === "assigned" || t.status === "in_progress").length;
  const pendingTasks = myTasks.filter((t) => t.status === "submitted").length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "payment_confirmed").length;

  const getStatusBadge = (status: string, taskId: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "متاحة", variant: "outline" },
      assigned: { label: "مقبولة", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      submitted: { label: "تم التسليم", variant: "secondary" },
      approved: { label: "موافق عليها", variant: "default" },
      rejected: { label: "مرفوضة", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant} data-testid={`badge-status-${taskId}`}>{statusInfo.label}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "outline" },
      payment_confirmed: { label: "تم تأكيد الدفع", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      completed: { label: "مكتمل", variant: "default" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" as const };
    return (
      <Badge variant={config.variant} className="rounded-lg" data-testid={`badge-order-status-${status}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
              لوحة تحكم المستقل
            </h1>
            <p className="text-lg text-muted-foreground">
              مرحباً بك! ابدأ بتصفح المهام المتاحة واختر ما يناسب مهاراتك
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المهام النشطة</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-active-tasks">{activeTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-pending-tasks">{pendingTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المكتملة</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-completed-tasks">{completedTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الأرباح</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-earnings">
                      {wallet?.balance || "0"} ر.س
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <WalletIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Available Tasks, My Tasks, Orders, and Withdrawals */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2" data-testid="tabs-tasks">
              <TabsTrigger value="orders" data-testid="tab-orders">
                <ShoppingCart className="h-4 w-4 ml-2" />
                الطلبات ({totalOrders})
              </TabsTrigger>
              <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
                <Download className="h-4 w-4 ml-2" />
                السحوبات ({withdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="available" data-testid="tab-available-tasks">
                المهام المتاحة ({filteredAvailableTasks.length})
              </TabsTrigger>
              <TabsTrigger value="my-tasks" data-testid="tab-my-tasks">
                مهامي ({myTasks.length})
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-bold mb-4">الطلبات الواردة من أصحاب المنتجات</h2>

              {orders.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground">سيتم عرض الطلبات الواردة من أصحاب المنتجات هنا</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="rounded-2xl shadow-md hover-elevate" data-testid={`card-order-${order.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{order.serviceType}</h3>
                              {getOrderStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              الكمية: {order.quantity} • السعر لكل وحدة: ${order.pricePerUnit}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary font-bold">
                                <WalletIcon className="h-4 w-4" />
                                ${order.totalAmount}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">طريقة الدفع:</p>
                              <p className="font-semibold">{order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 
                                order.paymentMethod === 'etisalat_cash' ? 'اتصالات كاش' :
                                order.paymentMethod === 'orange_cash' ? 'أورانج كاش' : 'البطاقة البنكية'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">بيانات الدفع:</p>
                              <p className="font-semibold">{order.paymentDetails}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">السحوبات والأرباح</h2>
                  <p className="text-muted-foreground">إدارة طلبات السحب وتتبع حالتها</p>
                </div>
                <Button 
                  onClick={() => setShowWithdrawalDialog(true)}
                  className="rounded-xl"
                  data-testid="button-new-withdrawal"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  طلب سحب جديد
                </Button>
              </div>

              {/* Wallet Balance Card */}
              <Card className="rounded-2xl shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">الرصيد المتاح</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-wallet-balance">
                        {wallet?.balance || "0"} ر.س
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        إجمالي الأرباح: {wallet?.totalEarned || "0"} ر.س
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <WalletIcon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawals List */}
              {loadingWithdrawals ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="rounded-2xl shadow-md animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded mb-2 w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12 text-center">
                    <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold mb-2">لا توجد طلبات سحب</h3>
                    <p className="text-muted-foreground">يمكنك إنشاء طلب سحب جديد للحصول على أرباحك</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {withdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className="rounded-2xl shadow-md hover-elevate" data-testid={`card-withdrawal-${withdrawal.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{withdrawal.amount} ر.س</h3>
                              <Badge 
                                variant={
                                  withdrawal.status === "completed" ? "default" : 
                                  withdrawal.status === "pending" ? "outline" : 
                                  withdrawal.status === "processing" ? "secondary" : "destructive"
                                }
                                data-testid={`badge-withdrawal-status-${withdrawal.id}`}
                              >
                                {withdrawal.status === "completed" ? "مكتمل" : 
                                 withdrawal.status === "pending" ? "قيد الانتظار" : 
                                 withdrawal.status === "processing" ? "قيد المعالجة" : "مرفوض"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {withdrawal.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 
                                 withdrawal.paymentMethod === 'etisalat_cash' ? 'اتصالات كاش' :
                                 withdrawal.paymentMethod === 'orange_cash' ? 'أورانج كاش' : 
                                 withdrawal.paymentMethod === 'bank_card' ? 'البطاقة البنكية' : withdrawal.paymentMethod}
                              </span>
                              <span>{withdrawal.accountNumber}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(withdrawal.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {withdrawal.notes && (
                              <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-lg p-3">
                                <span className="font-semibold">ملاحظات:</span> {withdrawal.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Available Tasks Tab */}
            <TabsContent value="available" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن مهام..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 rounded-xl"
                  data-testid="input-search-tasks"
                />
              </div>

              {loadingAvailable ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="rounded-2xl shadow-md animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded mb-4"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAvailableTasks.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                        <FileCheck className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2" data-testid="text-no-tasks">
                          لا توجد مهام متاحة حالياً
                        </h3>
                        <p className="text-muted-foreground">
                          سنقوم بإشعارك عند توفر مهام جديدة مناسبة لمهاراتك
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAvailableTasks.map((task) => (
                    <Card key={task.id} className="rounded-2xl shadow-md hover-elevate" data-testid={`card-task-${task.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg" data-testid={`text-task-title-${task.id}`}>
                            {task.title}
                          </CardTitle>
                          {getStatusBadge(task.status, task.id)}
                        </div>
                        <Badge variant="outline" className="w-fit" data-testid={`badge-service-${task.id}`}>
                          {task.serviceType}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-task-description-${task.id}`}>
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-primary fill-primary" />
                            <span className="font-bold text-primary" data-testid={`text-task-reward-${task.id}`}>
                              {task.reward} ر.س
                            </span>
                          </div>
                          <Button
                            onClick={() => handleAcceptTask(task)}
                            disabled={acceptTaskMutation.isPending}
                            className="rounded-xl"
                            size="sm"
                            data-testid={`button-accept-task-${task.id}`}
                          >
                            قبول المهمة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Tasks Tab */}
            <TabsContent value="my-tasks" className="space-y-4">
              {loadingMyTasks ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="rounded-2xl shadow-md animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded mb-4"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myTasks.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                        <FileCheck className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2" data-testid="text-no-my-tasks">
                          ليس لديك مهام حالياً
                        </h3>
                        <p className="text-muted-foreground">
                          ابدأ بتصفح المهام المتاحة واختر ما يناسبك
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <Card key={task.id} className="rounded-2xl shadow-md" data-testid={`card-my-task-${task.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2" data-testid={`text-my-task-title-${task.id}`}>
                              {task.title}
                            </CardTitle>
                            <CardDescription data-testid={`text-my-task-description-${task.id}`}>
                              {task.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(task.status, task.id)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" data-testid={`badge-my-task-service-${task.id}`}>
                            {task.serviceType}
                          </Badge>
                          <span className="text-sm font-semibold text-primary" data-testid={`text-my-task-reward-${task.id}`}>
                            {task.reward} ر.س
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {task.submission && (
                          <div className="p-4 bg-muted/50 rounded-xl">
                            <p className="text-sm font-semibold mb-1">التقرير المقدم:</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-my-task-submission-${task.id}`}>
                              {task.submission}
                            </p>
                          </div>
                        )}
                        {task.feedback && (
                          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <p className="text-sm font-semibold mb-1 text-primary">تعليق صاحب المنتج:</p>
                            <p className="text-sm" data-testid={`text-my-task-feedback-${task.id}`}>
                              {task.feedback}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {task.status === "assigned" && (
                            <Button
                              onClick={() => handleStartTask(task)}
                              disabled={startTaskMutation.isPending}
                              variant="outline"
                              className="rounded-xl"
                              size="sm"
                              data-testid={`button-start-task-${task.id}`}
                            >
                              <Play className="h-4 w-4 ml-1" />
                              بدء العمل
                            </Button>
                          )}
                          {(task.status === "assigned" || task.status === "in_progress") && (
                            <Button
                              onClick={() => openSubmitDialog(task)}
                              className="rounded-xl"
                              size="sm"
                              data-testid={`button-submit-task-${task.id}`}
                            >
                              <Send className="h-4 w-4 ml-1" />
                              تسليم المهمة
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submit Task Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="rounded-2xl" data-testid="dialog-submit-task">
          <DialogHeader>
            <DialogTitle data-testid="text-submit-dialog-title">تسليم المهمة</DialogTitle>
            <DialogDescription data-testid="text-submit-dialog-description">
              قم بكتابة تقرير مفصل عن عملك في هذه المهمة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">التقرير</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="اكتب تقريرك هنا..."
                rows={8}
                className="rounded-xl resize-none"
                data-testid="textarea-submission"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="rounded-xl"
              data-testid="button-cancel-submit"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={submitTaskMutation.isPending || !submissionText.trim()}
              className="rounded-xl"
              data-testid="button-confirm-submit"
            >
              <Send className="h-4 w-4 ml-1" />
              تسليم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Withdrawal Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="rounded-2xl" data-testid="dialog-new-withdrawal">
          <DialogHeader>
            <DialogTitle data-testid="text-withdrawal-dialog-title">طلب سحب جديد</DialogTitle>
            <DialogDescription data-testid="text-withdrawal-dialog-description">
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
