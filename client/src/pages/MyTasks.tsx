import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { CheckCircle2, Clock, FileText, Upload, Calendar, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function MyTasks() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState("");
  const [proofImage, setProofImage] = useState("");

  // Fetch assigned tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my/assigned"],
  });

  // Start work mutation
  const startWorkMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest(`/api/tasks/${taskId}/start-work`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my/assigned"] });
      toast({
        title: "تم بدء العمل",
        description: "تم بدء العمل على المهمة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء بدء العمل",
        variant: "destructive",
      });
    },
  });

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: { submission: string; proofImage?: string } }) => {
      return await apiRequest(`/api/tasks/${taskId}/submit-proof`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my/assigned"] });
      toast({
        title: "تم تسليم المهمة",
        description: "تم تسليم المهمة بنجاح وهي الآن قيد المراجعة",
      });
      setSelectedTask(null);
      setSubmission("");
      setProofImage("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسليم المهمة",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTask = () => {
    if (selectedTask && submission.trim()) {
      submitTaskMutation.mutate({
        taskId: selectedTask.id,
        data: {
          submission: submission.trim(),
          proofImage: proofImage.trim() || undefined,
        },
      });
    }
  };

  // Filter tasks by status
  const assignedTasks = tasks.filter(t => t.status === "assigned");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const submittedTasks = tasks.filter(t => t.status === "submitted");
  const approvedTasks = tasks.filter(t => t.status === "approved");
  const rejectedTasks = tasks.filter(t => t.status === "rejected");

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} data-testid={`card-task-${task.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {task.description}
            </CardDescription>
          </div>
          <Badge variant={
            task.status === "assigned" ? "secondary" :
            task.status === "in_progress" ? "default" :
            task.status === "submitted" ? "outline" :
            task.status === "approved" ? "default" : "destructive"
          }>
            {task.status === "assigned" ? "معينة" :
             task.status === "in_progress" ? "جارية" :
             task.status === "submitted" ? "مُسلّمة" :
             task.status === "approved" ? "مُوافق عليها" : "مرفوضة"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="ml-2 h-4 w-4" />
              المكافأة
            </div>
            <span className="font-semibold text-green-600">{task.reward} ر.س</span>
          </div>

          {task.taskUrl && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <FileText className="ml-2 h-4 w-4" />
                رابط المهمة
              </div>
              <a
                href={task.taskUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                فتح الرابط
              </a>
            </div>
          )}

          {task.assignedAt && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="ml-2 h-4 w-4" />
                تم التعيين
              </div>
              <span>{new Date(task.assignedAt).toLocaleDateString("ar")}</span>
            </div>
          )}

          {task.feedback && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-semibold mb-1">ملاحظات القائد:</p>
              <p className="text-muted-foreground">{task.feedback}</p>
            </div>
          )}

          {/* Action Buttons */}
          {task.status === "assigned" && (
            <Button
              className="w-full"
              onClick={() => startWorkMutation.mutate(task.id)}
              disabled={startWorkMutation.isPending}
              data-testid={`button-start-work-${task.id}`}
            >
              <Clock className="ml-2 h-4 w-4" />
              {startWorkMutation.isPending ? "جاري البدء..." : "بدء العمل"}
            </Button>
          )}

          {task.status === "in_progress" && (
            <Button
              className="w-full"
              onClick={() => setSelectedTask(task)}
              data-testid={`button-submit-task-${task.id}`}
            >
              <Upload className="ml-2 h-4 w-4" />
              تسليم المهمة
            </Button>
          )}

          {task.status === "rejected" && (
            <Button
              className="w-full"
              onClick={() => setSelectedTask(task)}
              data-testid={`button-resubmit-task-${task.id}`}
            >
              <Upload className="ml-2 h-4 w-4" />
              إعادة التسليم
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
            مهامي
          </h1>
          <p className="text-muted-foreground">
            تابع وأنجز مهامك المعينة
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">معينة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">جارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">مُسلّمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">مُوافق عليها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="tab-all-tasks">
              الكل ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="assigned" data-testid="tab-assigned">
              معينة ({assignedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" data-testid="tab-in-progress">
              جارية ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" data-testid="tab-submitted">
              مُسلّمة ({submittedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              مُكتملة ({approvedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-32 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مهام</h3>
                  <p className="text-muted-foreground">لم يتم تعيين أي مهام لك بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(renderTaskCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            {assignedTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مهام معينة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedTasks.map(renderTaskCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            {inProgressTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مهام جارية</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTasks.map(renderTaskCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="mt-6">
            {submittedTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مهام مُسلّمة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submittedTasks.map(renderTaskCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {approvedTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مهام مُكتملة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedTasks.map(renderTaskCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Task Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => {
        setSelectedTask(null);
        setSubmission("");
        setProofImage("");
      }}>
        <DialogContent className="max-w-2xl" data-testid="dialog-submit-task">
          <DialogHeader>
            <DialogTitle>تسليم المهمة</DialogTitle>
            <DialogDescription>
              قم بكتابة تقرير عن إنجاز المهمة وإرفاق صورة الإثبات
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-1">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">التقرير *</label>
                <Textarea
                  placeholder="اكتب تقرير مفصل عن كيفية إنجاز المهمة..."
                  className="resize-none min-h-[150px]"
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  data-testid="input-submission"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">رابط صورة الإثبات (اختياري)</label>
                <Input
                  type="url"
                  placeholder="https://example.com/proof-image.jpg"
                  value={proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  data-testid="input-proof-image"
                />
                <p className="text-xs text-muted-foreground">
                  يمكنك رفع الصورة على خدمة مثل Imgur ووضع الرابط هنا
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTask(null);
                setSubmission("");
                setProofImage("");
              }}
              data-testid="button-cancel-submit"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={!submission.trim() || submitTaskMutation.isPending}
              data-testid="button-confirm-submit"
            >
              {submitTaskMutation.isPending ? "جاري التسليم..." : "تسليم المهمة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
