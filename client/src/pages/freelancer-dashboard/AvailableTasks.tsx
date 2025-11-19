import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function AvailableTasks() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: availableTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/available"],
  });

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/api/tasks/${taskId}/accept`,"POST");
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

  const filteredTasks = availableTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.serviceType.includes(searchQuery)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">المهام المتاحة</h2>
        <p className="text-muted-foreground mt-1">
          تصفح واختر المهام التي تناسب مهاراتك
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مهمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rounded-xl"
            data-testid="input-search-tasks"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="rounded-2xl hover-elevate" data-testid={`card-task-${task.id}`}>
            <CardHeader>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
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
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">نوع الخدمة:</span>
                <Badge variant="outline">{task.serviceType}</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full rounded-xl"
                onClick={() => acceptTaskMutation.mutate(task.id)}
                disabled={acceptTaskMutation.isPending}
                data-testid={`button-accept-${task.id}`}
              >
                <CheckCircle className="ml-2 h-4 w-4" />
                قبول المهمة
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد مهام متاحة حالياً</p>
        </div>
      )}
    </div>
  );
}
