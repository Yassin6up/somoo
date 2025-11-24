import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MessageCircle, Check, Clock } from "lucide-react";
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

interface Task {
  title: string;
  description: string;
  reward: number;
  serviceType: string;
}

export default function CampaignsTab({ groupId }: { groupId: string }) {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<Task>({
    title: "",
    description: "",
    reward: 0,
    serviceType: "google_play_review",
  });

  // Fetch available campaigns
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Filter to show only active campaigns not yet accepted by this group
  const availableCampaigns = campaigns.filter(c => c.status === "active");

  // Accept campaign mutation
  const acceptCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return await apiRequest(`/api/campaigns/${campaignId}/accept`, "POST", { groupId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setSelectedCampaign(null);
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
      return await apiRequest("/api/tasks", "POST", {
        ...taskForm,
        campaignId: selectedCampaign?.id,
        groupId,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المهمة بنجاح",
      });
      setShowTaskForm(false);
      setTaskForm({
        title: "",
        description: "",
        reward: 0,
        serviceType: "google_play_review",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
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

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">الحملات المتاحة</h2>
        <p className="text-muted-foreground mt-1">
          استعرض الحملات وقبلها لإنشاء مهام لفريقك
        </p>
      </div>

      {availableCampaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">لا توجد حملات متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {availableCampaigns.map((campaign) => (
            <Dialog key={campaign.id} open={selectedCampaign?.id === campaign.id} onOpenChange={(open) => {
              if (!open) setSelectedCampaign(null);
            }}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCampaign(campaign)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.description}
                        </p>
                      </div>
                      <Badge variant="outline">{campaign.productType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">الميزانية</p>
                        <p className="font-bold">${campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">المختبرين المطلوبين</p>
                        <p className="font-bold">{campaign.testersNeeded}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              {selectedCampaign?.id === campaign.id && (
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{campaign.title}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Campaign Details */}
                    <div>
                      <h3 className="font-bold mb-2">تفاصيل الحملة</h3>
                      <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">الميزانية</p>
                          <p className="font-bold">${campaign.budget}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">نوع المنتج</p>
                          <p className="font-bold">{campaign.productType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">المختبرين</p>
                          <p className="font-bold">{campaign.testersNeeded}</p>
                        </div>
                      </div>
                    </div>

                    {/* Owner Profile */}
                    {campaign.productOwner && (
                      <div className="border-t pt-4">
                        <h3 className="font-bold mb-3">صاحب المشروع</h3>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Avatar>
                            <AvatarImage src={campaign.productOwner.profileImage} />
                            <AvatarFallback>{campaign.productOwner.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{campaign.productOwner.fullName}</p>
                            <p className="text-xs text-muted-foreground">{campaign.productOwner.companyName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => startConversationMutation.mutate(campaign.productOwnerId)}
                        variant="outline"
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 ml-2" />
                        محادثة
                      </Button>
                      <Button
                        onClick={() => acceptCampaignMutation.mutate(campaign.id)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 ml-2" />
                        قبول الحملة
                      </Button>
                    </div>

                    {/* Task Creation Form */}
                    {showTaskForm && (
                      <div className="border-t pt-4 space-y-4">
                        <h3 className="font-bold">إنشاء مهمة</h3>
                        <div>
                          <Label>اسم المهمة</Label>
                          <Input
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            placeholder="مثلاً: اختبار على أجهزة أندرويد"
                          />
                        </div>
                        <div>
                          <Label>وصف المهمة</Label>
                          <Textarea
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder="وصف تفصيلي للمهمة"
                          />
                        </div>
                        <div>
                          <Label>المكافأة</Label>
                          <Input
                            type="number"
                            value={taskForm.reward}
                            onChange={(e) => setTaskForm({ ...taskForm, reward: parseFloat(e.target.value) })}
                            placeholder="0.00"
                          />
                        </div>
                        <Button
                          onClick={() => createTaskMutation.mutate()}
                          className="w-full"
                        >
                          إنشاء المهمة
                        </Button>
                      </div>
                    )}

                    {!showTaskForm && (
                      <Button
                        onClick={() => setShowTaskForm(true)}
                        variant="secondary"
                        className="w-full"
                      >
                        إنشاء مهمة من الحملة
                      </Button>
                    )}
                  </div>
                </DialogContent>
              )}
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
