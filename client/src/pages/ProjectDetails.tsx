import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Plus,
  User,
  ListTodo
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Task } from "@shared/schema";

const statusConfig = {
  pending: { label: "قيد الانتظار", variant: "secondary" as const, color: "text-yellow-600" },
  accepted: { label: "مقبول", variant: "default" as const, color: "text-blue-600" },
  in_progress: { label: "قيد التنفيذ", variant: "default" as const, color: "text-purple-600" },
  completed: { label: "مكتمل", variant: "default" as const, color: "text-green-600" },
  cancelled: { label: "ملغي", variant: "destructive" as const, color: "text-red-600" },
};

const taskStatusConfig = {
  available: { label: "متاحة", variant: "secondary" as const },
  assigned: { label: "معينة", variant: "default" as const },
  in_progress: { label: "قيد التنفيذ", variant: "default" as const },
  submitted: { label: "مسلمة", variant: "default" as const },
  approved: { label: "مقبولة", variant: "default" as const },
  rejected: { label: "مرفوضة", variant: "destructive" as const },
};

export default function ProjectDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskReward, setTaskReward] = useState("");

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userType = localStorage.getItem("userType");

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  // Fetch tasks for this project
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", "project", id],
    enabled: !!id,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; reward: string }) => {
      return await apiRequest("POST", "/api/tasks", {
        ...data,
        projectId: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", "project", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      setShowCreateTask(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskReward("");
      toast({
        title: "تم إنشاء المهمة",
        description: "تم إنشاء المهمة بنجاح ويمكن للأعضاء الآن قبولها",
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

  const handleCreateTask = () => {
    if (!taskTitle.trim() || !taskDescription.trim() || !taskReward) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const rewardNumber = parseFloat(taskReward);
    if (isNaN(rewardNumber) || rewardNumber <= 0) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مكافأة صحيحة",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDescription,
      reward: rewardNumber.toString(),
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">المشروع غير موجود</h3>
            <p className="text-muted-foreground text-center mb-6">
              لم نتمكن من العثور على المشروع المطلوب
            </p>
            <Button onClick={() => navigate("/projects")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للمشاريع
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = statusConfig[project.status as keyof typeof statusConfig];
  const availableTasks = tasks.filter((t) => t.status === "available");
  const assignedTasks = tasks.filter((t) => t.status === "assigned" || t.status === "in_progress");
  const submittedTasks = tasks.filter((t) => t.status === "submitted");
  const completedTasks = tasks.filter((t) => t.status === "approved");

  // Check if user is the project leader (using acceptedByGroupId instead of groupId)
  const isLeader = userType === "freelancer" && project.acceptedByGroupId;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4" dir="rtl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/projects")}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        العودة للمشاريع
      </Button>

      {/* Project Header */}
      <Card className="mb-6 rounded-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl" data-testid="text-project-title">
                  {project.title}
                </CardTitle>
                <Badge variant={config.variant} data-testid="badge-status">
                  {config.label}
                </Badge>
              </div>
              <CardDescription className="text-base mt-2">
                {project.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الميزانية</p>
                <p className="text-lg font-bold text-green-600" data-testid="text-budget">
                  {parseFloat(project.budget as string).toLocaleString()} ر.س
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد المهام</p>
                <p className="text-lg font-bold" data-testid="text-tasks-count">
                  {tasks.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="text-sm font-semibold">
                  {format(new Date(project.createdAt), "d MMMM yyyy", { locale: ar })}
                </p>
              </div>
            </div>

            {project.acceptedByGroupId && (
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
                  <User className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">معين لجروب</p>
                  <p className="text-sm font-semibold">
                    نعم
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">المهام ({tasks.length})</h2>
          {isLeader && project.status !== "completed" && (
            <Button onClick={() => setShowCreateTask(true)} data-testid="button-create-task">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء مهمة جديدة
            </Button>
          )}
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{availableTasks.length}</p>
                <p className="text-sm text-muted-foreground">متاحة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{assignedTasks.length}</p>
                <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{submittedTasks.length}</p>
                <p className="text-sm text-muted-foreground">مسلمة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">مكتملة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasksLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse rounded-xl">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ListTodo className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">لا توجد مهام</h3>
              <p className="text-muted-foreground text-center mb-6">
                لم يتم إنشاء أي مهام لهذا المشروع بعد
              </p>
              {isLeader && (
                <Button onClick={() => setShowCreateTask(true)} data-testid="button-create-first-task">
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء أول مهمة
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              const taskConfig = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
              return (
                <Card key={task.id} className="rounded-xl hover-elevate" data-testid={`card-task-${task.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge variant={taskConfig.variant}>
                            {taskConfig.label}
                          </Badge>
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">المكافأة</p>
                        <p className="text-xl font-bold text-green-600">
                          {task.reward} ر.س
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {task.freelancerId && (
                    <CardContent>
                      <Separator className="mb-4" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>معينة لمستقل</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent data-testid="dialog-create-task">
          <DialogHeader>
            <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
            <DialogDescription>
              أنشئ مهمة جديدة وسيتمكن أعضاء الجروب من قبولها
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">عنوان المهمة *</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="مثال: مراجعة التطبيق على Google Play"
                data-testid="input-task-title"
              />
            </div>

            <div>
              <Label htmlFor="task-description">وصف المهمة *</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="اشرح تفاصيل المهمة والمتطلبات..."
                rows={4}
                data-testid="textarea-task-description"
              />
            </div>

            <div>
              <Label htmlFor="task-reward">المكافأة (ر.س) *</Label>
              <Input
                id="task-reward"
                type="number"
                value={taskReward}
                onChange={(e) => setTaskReward(e.target.value)}
                placeholder="مثال: 50"
                data-testid="input-task-reward"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateTask(false)}
              data-testid="button-cancel-task"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={createTaskMutation.isPending}
              data-testid="button-submit-task"
            >
              {createTaskMutation.isPending ? "جاري الإنشاء..." : "إنشاء المهمة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
