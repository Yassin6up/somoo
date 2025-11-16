import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function MyTasks() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { data: myTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my-tasks"],
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      toast({
        title: "تم بدء المهمة",
        description: "المهمة الآن قيد التنفيذ",
      });
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string; submission: string }) => {
      return apiRequest("PATCH", `/api/tasks/${data.taskId}/submit`, { submission: data.submission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/my-tasks"] });
      setShowSubmitDialog(false);
      setSubmissionText("");
      toast({
        title: "تم تسليم المهمة",
        description: "تم إرسال المهمة للمراجعة بنجاح",
      });
    },
  });

  const handleSubmitTask = (task: Task) => {
    setSelectedTask(task);
    setSubmissionText(task.submission || "");
    setShowSubmitDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      assigned: { label: "مقبولة", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      submitted: { label: "تم التسليم", variant: "secondary" },
      approved: { label: "موافق عليها", variant: "default" },
      rejected: { label: "مرفوضة", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">مهامي</h2>
        <p className="text-muted-foreground mt-1">
          تتبع تقدمك في المهام المقبولة
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {myTasks.map((task) => (
          <Card key={task.id} className="rounded-2xl hover-elevate" data-testid={`card-task-${task.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </div>
                {getStatusBadge(task.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* تفاصيل المكافأة */}
              <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المكافأة الإجمالية:</span>
                  <span className="font-medium">${task.reward}</span>
                </div>
                {task.platformFee && parseFloat(task.platformFee) > 0 && (
                  <>
                    <div className="flex justify-between text-amber-600">
                      <span>رسوم المنصة (10%):</span>
                      <span className="font-medium">-${task.platformFee}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-border text-base font-bold text-green-600">
                      <span>صافي المكافأة:</span>
                      <span>${task.netReward || (parseFloat(task.reward) - parseFloat(task.platformFee)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              
              {task.feedback && task.status === "rejected" && (
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <p className="text-sm text-destructive font-medium">سبب الرفض:</p>
                  <p className="text-sm text-destructive">{task.feedback}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              {task.status === "assigned" && (
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => startTaskMutation.mutate(task.id)}
                  disabled={startTaskMutation.isPending}
                  data-testid={`button-start-${task.id}`}
                >
                  <Play className="ml-2 h-4 w-4" />
                  بدء العمل
                </Button>
              )}
              {task.status === "in_progress" && (
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => handleSubmitTask(task)}
                  data-testid={`button-submit-${task.id}`}
                >
                  <Send className="ml-2 h-4 w-4" />
                  تسليم المهمة
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {myTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد مهام مقبولة حالياً</p>
        </div>
      )}

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>تسليم المهمة</DialogTitle>
            <DialogDescription>
              أضف تقريراً عن عملك وأي ملاحظات
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="submission">التقرير</Label>
            <Textarea
              id="submission"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="اكتب تفاصيل ما أنجزته..."
              className="mt-2 rounded-xl"
              rows={5}
              data-testid="textarea-submission"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="rounded-xl"
              data-testid="button-cancel"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => selectedTask && submitTaskMutation.mutate({ taskId: selectedTask.id, submission: submissionText })}
              disabled={submitTaskMutation.isPending || !submissionText.trim()}
              className="rounded-xl"
              data-testid="button-confirm-submit"
            >
              <Send className="ml-2 h-4 w-4" />
              إرسال التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
