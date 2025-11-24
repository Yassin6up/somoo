import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Order {
  id: string;
  groupLeaderId: string;
  productOwnerId: string;
  serviceType: string;
  budget: string;
  tasksCount: number;
  status: string;
  createdAt: string;
  productOwner?: {
    fullName: string;
    companyName: string;
    profileImage?: string;
  };
}

interface Task {
  title: string;
  description: string;
  reward: number;
  serviceType: string;
}

export default function CampaignsTab({ groupId }: { groupId: string }) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<Task>({
    title: "",
    description: "",
    reward: 0,
    serviceType: "google_play_review",
  });

  // Fetch group's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/groups/${groupId}/orders`],
  });

  // Filter pending orders
  const pendingOrders = orders.filter((o) => o.status === "pending");

  // Calculate task reward and distributions
  const calculateDistribution = (reward: number) => {
    const platformFee = reward * 0.1; // 10%
    const leaderCommission = reward * 0.03; // 3%
    const netReward = reward - platformFee - leaderCommission;

    return {
      total: reward.toFixed(2),
      platformFee: platformFee.toFixed(2),
      leaderCommission: leaderCommission.toFixed(2),
      netReward: netReward.toFixed(2),
    };
  };

  const distribution = calculateDistribution(taskForm.reward);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...taskForm,
        groupId,
        reward: taskForm.reward.toString(),
        serviceType: taskForm.serviceType,
      };

      if (selectedOrder) {
        payload.orderId = selectedOrder.id;
      }

      return await apiRequest("/api/tasks", "POST", payload);
    },
    onSuccess: (data: any) => {
      toast({
        title: "تم الإنشاء",
        description: `تم إنشاء المهمة ونشرها لـ ${data.tasksCreated} أعضاء`,
      });
      setShowTaskForm(false);
      setSelectedOrder(null);
      setTaskForm({
        title: "",
        description: "",
        reward: 0,
        serviceType: "google_play_review",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/groups/${groupId}/orders`],
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المهمة",
        variant: "destructive",
      });
    },
  });

  const isLoading = ordersLoading;

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  // Show alert if no pending orders
  if (pendingOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">إنشاء مهام</h2>
          <p className="text-muted-foreground mt-1">
            أنشئ مهام لفريقك من الطلبات النشطة
          </p>
        </div>

        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-600 opacity-60" />
            <div>
              <h3 className="text-xl font-bold text-amber-900">
                لا توجد طلبات نشطة حالياً
              </h3>
              <p className="text-amber-700 mt-2">
                تحتاج إلى طلب نشط من صاحب مشروع لكي تتمكن من إنشاء مهام لفريقك
              </p>
              <p className="text-sm text-amber-600 mt-3">
                🔔 انتظر استقبال طلب من صاحب مشروع، أو تواصل معهم لإرسال طلب جديد
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">إنشاء مهام من الطلبات</h2>
        <p className="text-muted-foreground mt-1">
          اختر طلباً نشطاً وأنشئ مهام لفريقك
        </p>
      </div>

      {!selectedOrder ? (
        <div className="grid gap-4">
          {pendingOrders.map((order) => (
            <Dialog key={order.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-500 border-2">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          طلب من {order.productOwner?.fullName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.productOwner?.companyName}
                        </p>
                      </div>
                      <Badge variant="outline">{order.serviceType}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          الميزانية
                        </p>
                        <p className="font-bold text-lg">${order.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">المهام</p>
                        <p className="font-bold text-lg">{order.tasksCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    طلب من {order.productOwner?.fullName}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Owner Profile */}
                  <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={order.productOwner?.profileImage} />
                      <AvatarFallback>
                        {order.productOwner?.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold">
                        {order.productOwner?.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.productOwner?.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-sm text-muted-foreground">الميزانية</p>
                      <p className="font-bold text-blue-700">
                        ${order.budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نوع الخدمة</p>
                      <p className="font-bold text-blue-700">
                        {order.serviceType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عدد المهام</p>
                      <p className="font-bold text-blue-700">
                        {order.tasksCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الحالة</p>
                      <Badge className="bg-green-600">معلق</Badge>
                    </div>
                  </div>

                  {!showTaskForm ? (
                    <Button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowTaskForm(true);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      إنشاء مهمة من هذا الطلب
                    </Button>
                  ) : selectedOrder?.id === order.id ? (
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="font-bold text-lg">تفاصيل المهمة</h3>

                      <div>
                        <Label>اسم المهمة</Label>
                        <Input
                          value={taskForm.title}
                          onChange={(e) =>
                            setTaskForm({ ...taskForm, title: e.target.value })
                          }
                          placeholder="مثلاً: اختبار على أجهزة أندرويد"
                        />
                      </div>

                      <div>
                        <Label>وصف المهمة</Label>
                        <Textarea
                          value={taskForm.description}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="وصف تفصيلي للمهمة"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>نوع الخدمة</Label>
                        <select
                          value={taskForm.serviceType}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              serviceType: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="google_play_review">
                            تقييم Google Play
                          </option>
                          <option value="app_store_review">
                            تقييم App Store
                          </option>
                          <option value="ux_testing">اختبار UX</option>
                          <option value="social_media">
                            وسائل الإعلام الاجتماعية
                          </option>
                        </select>
                      </div>

                      <div>
                        <Label>المكافأة الإجمالية ($)</Label>
                        <Input
                          type="number"
                          value={taskForm.reward}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              reward: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      {/* Distribution Preview */}
                      {taskForm.reward > 0 && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg space-y-2 border border-blue-200">
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            توزيع الأموال
                          </h4>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                إجمالي المكافأة:
                              </span>
                              <span className="font-bold">
                                ${distribution.total}
                              </span>
                            </div>
                            <div className="flex justify-between text-amber-600">
                              <span>رسوم المنصة (10%):</span>
                              <span className="font-bold">
                                -${distribution.platformFee}
                              </span>
                            </div>
                            <div className="flex justify-between text-orange-600">
                              <span>عمولة القائد (3%):</span>
                              <span className="font-bold">
                                +${distribution.leaderCommission}
                              </span>
                            </div>
                            <div className="border-t border-blue-200 pt-1.5 flex justify-between text-green-600 font-bold">
                              <span>صافي لكل عضو:</span>
                              <span>${distribution.netReward}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => setShowTaskForm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={() => createTaskMutation.mutate()}
                          disabled={createTaskMutation.isPending}
                          className="flex-1"
                        >
                          نشر المهمة
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : null}
    </div>
  );
}
