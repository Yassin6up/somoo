import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, Briefcase, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function AvailableTasks() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: myTasks = [], isLoading: isLoadingMyTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my-tasks"],
    queryFn: async () => {
      console.log('[MY TASKS] Fetching my tasks...');
      const response = await fetch('/api/tasks/my-tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        console.error('[MY TASKS] Failed to fetch:', response.status);
        return [];
      }
      const data = await response.json();
      console.log(`[MY TASKS] Received ${data.length} tasks:`, data);
      return data;
    },
  });
  const { data: availableTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/available"],
    queryFn: async () => {
      console.log('[AVAILABLE TASKS] Fetching available tasks...');
      const response = await fetch('/api/tasks/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        console.error('[AVAILABLE TASKS] Failed to fetch:', response.status);
        return [];
      }
      const data = await response.json();
      console.log(`[AVAILABLE TASKS] Received ${data.length} tasks:`, data);
      return data;
    },
  });

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/api/tasks/${taskId}/accept`, "POST");
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

  // Separate tasks by source
  const campaignTasks = filteredTasks.filter(t => t.campaignId && !t.groupId);
  const groupTasks = filteredTasks.filter(t => t.groupId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">المهام المتاحة</h2>
        <p className="text-muted-foreground mt-1">
          تصفح واختر المهام التي تناسب مهاراتك من الحملات أو مجموعاتك
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

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">لا توجد مهام متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">الكل ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="campaigns">الحملات ({campaignTasks.length})</TabsTrigger>
            <TabsTrigger value="groups">المجموعات ({groupTasks.length})</TabsTrigger>
          </TabsList>

          {/* All Tasks */}
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAccept={() => acceptTaskMutation.mutate(task.id)}
                  isLoading={acceptTaskMutation.isPending}
                />
              ))}
            </div>
          </TabsContent>

          {/* Campaign Tasks */}
          <TabsContent value="campaigns" className="mt-6">
            {campaignTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">لا توجد مهام من الحملات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaignTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={() => acceptTaskMutation.mutate(task.id)}
                    isLoading={acceptTaskMutation.isPending}
                    badge="حملة"
                    badgeColor="blue"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Group Tasks */}
          <TabsContent value="groups" className="mt-6">
            {groupTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">لا توجد مهام من المجموعات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={() => acceptTaskMutation.mutate(task.id)}
                    isLoading={acceptTaskMutation.isPending}
                    badge="مجموعة"
                    badgeColor="green"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onAccept: () => void;
  isLoading: boolean;
  badge?: string;
  badgeColor?: "blue" | "green";
}

function TaskCard({ task, onAccept, isLoading, badge, badgeColor }: TaskCardProps) {
  return (
    <Card className="rounded-2xl hover:shadow-lg transition-all overflow-hidden" data-testid={`card-task-${task.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {task.description}
            </CardDescription>
          </div>
          {badge && (
            <Badge
              variant="outline"
              className={`shrink-0 ${
                badgeColor === "blue"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Reward Details */}
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl space-y-1.5 text-sm border border-green-100">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المكافأة الإجمالية:</span>
            <span className="font-bold text-lg text-green-700">
              ${task.reward}
            </span>
          </div>
          {task.platformFee && parseFloat(task.platformFee) > 0 && (
            <>
              <div className="flex justify-between text-amber-600">
                <span>رسوم المنصة (10%):</span>
                <span className="font-medium">-${task.platformFee}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-green-200 text-base font-bold text-green-700">
                <span>صافي لك:</span>
                <span>
                  $
                  {task.netReward ||
                    (
                      parseFloat(task.reward) -
                      parseFloat(task.platformFee)
                    ).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">نوع الخدمة:</span>
          <Badge variant="secondary">{task.serviceType}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full rounded-xl bg-green-600 hover:bg-green-700"
          onClick={onAccept}
          disabled={isLoading}
          data-testid={`button-accept-${task.id}`}
        >
          <CheckCircle className="ml-2 h-4 w-4" />
          قبول المهمة
        </Button>
      </CardFooter>
    </Card>
  );
}
