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
  MessageCircle,
  Check,
  DollarSign,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Campaign {
  id: string;
  productOwnerId: string;
  title: string;
  description: string;
  productType: string;
  services: string[];
  budget: string;
  testersNeeded: number;
  status: string;
  createdAt: string;
  productOwner?: {
    fullName: string;
    companyName: string;
    productName: string;
    profileImage?: string;
  };
}

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
  const [selectedSource, setSelectedSource] = useState<"campaign" | "order" | null>(
    null
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<Task>({
    title: "",
    description: "",
    reward: 0,
    serviceType: "google_play_review",
  });

  // Fetch available campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<
    Campaign[]
  >({
    queryKey: ["/api/campaigns"],
  });

  // Fetch group's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/groups/${groupId}/orders`],
  });

  // Filter available campaigns
  const availableCampaigns = campaigns.filter((c) => c.status === "active");

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

  // Accept campaign mutation
  const acceptCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return await apiRequest(`/api/campaigns/${campaignId}/accept`, "POST", {
        groupId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setSelectedCampaign(null);
      setSelectedSource(null);
      toast({
        title: "تم القبول",
        description: "تم قبول الحملة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء قبول الحملة",
        variant: "destructive",
      });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...taskForm,
        groupId,
        reward: taskForm.reward.toString(),
        serviceType: taskForm.serviceType,
      };

      if (selectedSource === "campaign" && selectedCampaign) {
        payload.campaignId = selectedCampaign.id;
      } else if (selectedSource === "order" && selectedOrder) {
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
      setSelectedSource(null);
      setSelectedCampaign(null);
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

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (productOwnerId: string) => {
      return await apiRequest("/api/conversations", "POST", { productOwnerId });
    },
    onSuccess: () => {
      toast({
        title: "نجاح",
        description: "تم بدء المحادثة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ",
        variant: "destructive",
      });
    },
  });

  const isLoading = campaignsLoading || ordersLoading;

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      {!selectedSource && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500">
                <CardContent className="p-6 text-center space-y-2">
                  <Briefcase className="h-8 w-8 mx-auto text-blue-600" />
                  <h3 className="font-bold">الحملات المتاحة</h3>
                  <p className="text-sm text-muted-foreground">
                    {availableCampaigns.length} حملة متاحة
                  </p>
                  <Button size="sm">اختر حملة</Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>اختر حملة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {availableCampaigns.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    لا توجد حملات متاحة
                  </p>
                ) : (
                  availableCampaigns.map((campaign) => (
                    <Card
                      key={campaign.id}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setSelectedSource("campaign");
                        setSelectedCampaign(campaign);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold">{campaign.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {campaign.description}
                            </p>
                          </div>
                          <Badge>{campaign.productType}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <span className="text-muted-foreground">
                              الميزانية:
                            </span>
                            <p className="font-bold">${campaign.budget}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              المختبرين:
                            </span>
                            <p className="font-bold">
                              {campaign.testersNeeded}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500">
                <CardContent className="p-6 text-center space-y-2">
                  <Users className="h-8 w-8 mx-auto text-green-600" />
                  <h3 className="font-bold">الطلبات المعلقة</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingOrders.length} طلب معلق
                  </p>
                  <Button size="sm">اختر طلب</Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>اختر طلب</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    لا توجد طلبات معلقة
                  </p>
                ) : (
                  pendingOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setSelectedSource("order");
                        setSelectedOrder(order);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold">
                              {order.productOwner?.fullName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {order.productOwner?.companyName}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {order.serviceType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <span className="text-muted-foreground">
                              الميزانية:
                            </span>
                            <p className="font-bold">${order.budget}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              المهام:
                            </span>
                            <p className="font-bold">{order.tasksCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Campaign/Order Details and Task Creation */}
      {selectedSource && (selectedCampaign || selectedOrder) && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {selectedSource === "campaign"
                    ? selectedCampaign?.title
                    : `طلب من ${selectedOrder?.productOwner?.fullName}`}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSource(null);
                  setSelectedCampaign(null);
                  setSelectedOrder(null);
                }}
              >
                تغيير
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner Profile */}
            {selectedSource === "campaign" && selectedCampaign?.productOwner && (
              <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={selectedCampaign.productOwner.profileImage}
                  />
                  <AvatarFallback>
                    {selectedCampaign.productOwner.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">
                    {selectedCampaign.productOwner.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCampaign.productOwner.companyName}
                  </p>
                </div>
              </div>
            )}

            {selectedSource === "order" && selectedOrder?.productOwner && (
              <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedOrder.productOwner.profileImage} />
                  <AvatarFallback>
                    {selectedOrder.productOwner.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">
                    {selectedOrder.productOwner.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.productOwner.companyName}
                  </p>
                </div>
              </div>
            )}

            {!showTaskForm ? (
              <Button
                onClick={() => setShowTaskForm(true)}
                className="w-full"
                size="lg"
              >
                إنشاء مهمة
              </Button>
            ) : (
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
                      setTaskForm({ ...taskForm, description: e.target.value })
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
                      setTaskForm({ ...taskForm, serviceType: e.target.value })
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
