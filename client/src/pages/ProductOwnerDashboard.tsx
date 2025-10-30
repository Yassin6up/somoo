import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Users, 
  Rocket, 
  Wallet, 
  Plus, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react";
import type { Campaign, Task } from "@shared/schema";

interface TaskWithCampaign extends Task {
  campaign?: Campaign;
}

export default function ProductOwnerDashboard() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<TaskWithCampaign | null>(null);
  const [feedback, setFeedback] = useState("");

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Fetch tasks for all campaigns
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery<TaskWithCampaign[]>({
    queryKey: ["/api/tasks/owner"],
    enabled: campaigns.length > 0,
  });

  // Calculate statistics
  const stats = {
    activeCampaigns: campaigns.filter(c => c.status === "active").length,
    totalTasks: allTasks.length,
    submittedTasks: allTasks.filter(t => t.status === "submitted").length,
    completedTasks: allTasks.filter(t => t.status === "approved").length,
    totalSpent: campaigns.reduce((sum, c) => sum + Number(c.budget), 0),
  };

  // Approve task mutation
  const approveTaskMutation = useMutation({
    mutationFn: async ({ taskId, feedback }: { taskId: string; feedback: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}/approve`, { feedback });
    },
    onSuccess: () => {
      toast({
        title: "تمت الموافقة على المهمة",
        description: "تم الموافقة على المهمة وإضافة المكافأة لمحفظة المستقل",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/owner"] });
      setSelectedTask(null);
      setFeedback("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشلت الموافقة على المهمة",
      });
    },
  });

  // Reject task mutation
  const rejectTaskMutation = useMutation({
    mutationFn: async ({ taskId, feedback }: { taskId: string; feedback: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}/reject`, { feedback });
    },
    onSuccess: () => {
      toast({
        title: "تم رفض المهمة",
        description: "تم رفض المهمة وإعادتها للمستقل",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/owner"] });
      setSelectedTask(null);
      setFeedback("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل رفض المهمة",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedTask) return;
    approveTaskMutation.mutate({ taskId: selectedTask.id, feedback });
  };

  const handleReject = () => {
    if (!selectedTask || !feedback.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب كتابة سبب الرفض",
      });
      return;
    }
    rejectTaskMutation.mutate({ taskId: selectedTask.id, feedback });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "متاحة", variant: "outline" },
      assigned: { label: "معينة", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      submitted: { label: "مُسلّمة", variant: "default" },
      approved: { label: "مقبولة", variant: "default" },
      rejected: { label: "مرفوضة", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" as const };
    return (
      <Badge variant={config.variant} className="rounded-lg" data-testid={`badge-status-${status}`}>
        {config.label}
      </Badge>
    );
  };

  if (campaignsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold" data-testid="text-owner-welcome">
                لوحة تحكم صاحب المنتج
              </h1>
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">
              إدارة حملاتك ومراجعة المهام المُسلّمة
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl shadow-md hover-elevate" data-testid="stat-active-campaigns">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الحملات النشطة</p>
                    <p className="text-3xl font-bold mt-1 text-primary">{stats.activeCampaigns}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md hover-elevate" data-testid="stat-submitted-tasks">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">مهام قيد المراجعة</p>
                    <p className="text-3xl font-bold mt-1 text-orange-600">{stats.submittedTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md hover-elevate" data-testid="stat-completed-tasks">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">مهام مكتملة</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{stats.completedTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md hover-elevate" data-testid="stat-total-spent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الميزانية</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalSpent.toFixed(2)} ر.س</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="submitted" className="space-y-6" data-testid="tabs-main">
            <TabsList className="bg-muted/50 p-1 rounded-2xl w-full sm:w-auto">
              <TabsTrigger value="submitted" className="rounded-xl" data-testid="tab-submitted">
                <Clock className="h-4 w-4 ml-2" />
                قيد المراجعة ({stats.submittedTasks})
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="rounded-xl" data-testid="tab-campaigns">
                <BarChart3 className="h-4 w-4 ml-2" />
                جميع الحملات
              </TabsTrigger>
              <TabsTrigger value="all-tasks" className="rounded-xl" data-testid="tab-all-tasks">
                <FileText className="h-4 w-4 ml-2" />
                جميع المهام
              </TabsTrigger>
            </TabsList>

            {/* Submitted Tasks Tab */}
            <TabsContent value="submitted" className="space-y-4">
              {allTasks.filter(t => t.status === "submitted").length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold mb-2">لا توجد مهام قيد المراجعة</h3>
                    <p className="text-muted-foreground">سيتم عرض المهام المُسلّمة من المستقلين هنا</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allTasks.filter(t => t.status === "submitted").map((task) => (
                    <Card key={task.id} className="rounded-2xl shadow-md hover-elevate" data-testid={`card-task-${task.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{task.title}</h3>
                              {getStatusBadge(task.status)}
                              <Badge variant="outline" className="rounded-lg">{task.serviceType}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary font-bold">
                                <Wallet className="h-4 w-4" />
                                {task.reward} ر.س
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                سُلّمت: {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString('ar-SA') : '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {task.submission && (
                          <div className="bg-muted/50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold mb-2">تقرير المستقل:</p>
                            <p className="text-sm whitespace-pre-wrap">{task.submission}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="rounded-xl flex-1" 
                                onClick={() => setSelectedTask(task)}
                                data-testid={`button-review-${task.id}`}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                مراجعة وتقييم
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-review-task">
                              <DialogHeader>
                                <DialogTitle>مراجعة المهمة</DialogTitle>
                                <DialogDescription>
                                  قم بمراجعة التقرير وقرر الموافقة أو الرفض
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-semibold mb-1">عنوان المهمة:</p>
                                  <p className="text-sm">{selectedTask?.title}</p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold mb-1">التقرير:</p>
                                  <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                                    <p className="text-sm whitespace-pre-wrap">{selectedTask?.submission}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-semibold mb-1 block">
                                    تعليقك (اختياري للموافقة، مطلوب للرفض)
                                  </label>
                                  <Textarea
                                    placeholder="اكتب تعليقك هنا..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="rounded-xl min-h-[100px]"
                                    data-testid="textarea-feedback"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleApprove}
                                    disabled={approveTaskMutation.isPending}
                                    className="flex-1 rounded-xl bg-green-600 hover:bg-green-700"
                                    data-testid="button-approve-task"
                                  >
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    موافقة
                                  </Button>
                                  <Button
                                    onClick={handleReject}
                                    disabled={rejectTaskMutation.isPending}
                                    variant="destructive"
                                    className="flex-1 rounded-xl"
                                    data-testid="button-reject-task"
                                  >
                                    <XCircle className="h-4 w-4 ml-2" />
                                    رفض
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">حملاتي</h2>
                <Button className="rounded-xl" data-testid="button-new-campaign">
                  <Plus className="h-4 w-4 ml-2" />
                  حملة جديدة
                </Button>
              </div>

              {campaigns.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12 text-center">
                    <Rocket className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold mb-2">لا توجد حملات بعد</h3>
                    <p className="text-muted-foreground mb-4">أنشئ أول حملة لاختبار منتجك</p>
                    <Button className="rounded-xl" data-testid="button-create-first-campaign">
                      <Plus className="h-4 w-4 ml-2" />
                      إنشاء حملة جديدة
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="rounded-2xl shadow-md hover-elevate" data-testid={`card-campaign-${campaign.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          </div>
                          {getStatusBadge(campaign.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">الميزانية</p>
                            <p className="font-bold text-primary">{campaign.budget} ر.س</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">المختبرين المطلوبين</p>
                            <p className="font-bold">{campaign.testersNeeded}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">المُعيّنين</p>
                            <p className="font-bold">{campaign.testersAssigned}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">الباقة</p>
                            <p className="font-bold">{campaign.package}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="rounded-xl" data-testid={`button-view-campaign-${campaign.id}`}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* All Tasks Tab */}
            <TabsContent value="all-tasks" className="space-y-4">
              <h2 className="text-xl font-bold mb-4">جميع المهام</h2>

              {allTasks.length === 0 ? (
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold mb-2">لا توجد مهام</h3>
                    <p className="text-muted-foreground">سيتم عرض جميع المهام الخاصة بحملاتك هنا</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allTasks.map((task) => (
                    <Card key={task.id} className="rounded-2xl shadow-md" data-testid={`card-all-task-${task.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{task.title}</h3>
                              {getStatusBadge(task.status)}
                              <Badge variant="outline" className="rounded-lg">{task.serviceType}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-primary font-bold">
                                <Wallet className="h-4 w-4" />
                                {task.reward} ر.س
                              </span>
                              {task.submittedAt && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(task.submittedAt).toLocaleDateString('ar-SA')}
                                </span>
                              )}
                            </div>
                          </div>
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
    </div>
  );
}
