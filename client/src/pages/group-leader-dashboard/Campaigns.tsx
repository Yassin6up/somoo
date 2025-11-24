import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle,
  Briefcase,
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

export default function CampaignsTab({ groupId }: { groupId: string }) {
  const { toast } = useToast();

  // Fetch group's orders
  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery<Order[]>({
    queryKey: [`/api/groups/${groupId}/orders`],
  });

  // Filter pending orders
  const pendingOrders = orders.filter((o) => o.status === "pending");

  // Create task from order mutation
  const createTaskFromOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      // Calculate reward from order budget and tasksCount
      const rewardPerTask = parseFloat(order.budget) / order.tasksCount;

      const payload = {
        title: `${order.serviceType}: ${order.productOwner?.companyName || "New Project"}`,
        description: `مهمة من ${order.productOwner?.fullName} - ${order.productOwner?.companyName}`,
        reward: rewardPerTask.toString(),
        serviceType: order.serviceType,
        orderId: order.id,
        groupId,
      };

      return await apiRequest("/api/tasks", "POST", payload);
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ تم الإنشاء بنجاح",
        description: `تم إنشاء المهمة ونشرها لـ ${data.tasksCreated} أعضاء من الطلب`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/groups/${groupId}/orders`],
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ",
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
          <h2 className="text-3xl font-bold">الطلبات والحملات</h2>
          <p className="text-muted-foreground mt-1">
            اختر طلباً أو حملة لإنشاء مهام لفريقك
          </p>
        </div>

        <Card className="border-l-4 border-l-red-500 bg-red-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-red-600 opacity-60" />
            <div>
              <h3 className="text-xl font-bold text-red-900">
                ❌ لم يتم العثور على طلبات نشطة
              </h3>
              <p className="text-red-700 mt-3">
                قبل أن تتمكن من إنشاء مهام، تحتاج إلى:
              </p>
              <div className="text-left space-y-2 mt-4 text-red-700 text-sm bg-white/50 p-4 rounded-lg">
                <p>✓ قبول حملة من المتاحة</p>
                <p>✓ أو استقبال طلب مباشر من صاحب مشروع</p>
              </div>
              <p className="text-red-600 mt-4 font-semibold">
                📱 تواصل مع أصحاب المشاريع لإرسال طلب لفريقك
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
        <h2 className="text-3xl font-bold">الطلبات النشطة</h2>
        <p className="text-muted-foreground mt-1">
          اختر طلباً وسيتم إنشاء المهام تلقائياً لفريقك
        </p>
      </div>

      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-all border-2 hover:border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-4">
                  {/* Product Owner Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={order.productOwner?.profileImage} />
                    <AvatarFallback>
                      {order.productOwner?.fullName?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">
                        {order.productOwner?.fullName}
                      </h3>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        ✓ طلب نشط
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.productOwner?.companyName}
                    </p>
                  </div>

                  {/* Order Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">الميزانية</p>
                      <p className="font-bold text-lg">${order.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">عدد المهام</p>
                      <p className="font-bold text-lg">{order.tasksCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">نوع الخدمة</p>
                      <p className="font-bold text-sm">{order.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => createTaskFromOrderMutation.mutate(order)}
                  disabled={createTaskFromOrderMutation.isPending}
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {createTaskFromOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 ml-2" />
                      اختر هذا الطلب
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
