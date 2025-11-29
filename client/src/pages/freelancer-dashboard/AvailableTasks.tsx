import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, Briefcase, Users, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Group, Project } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AvailableTasks() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Fetch user data to check if leader
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch groups where user is leader
  const { data: myGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/groups');
      if (!response.ok) return [];
      const allGroups = await response.json();
      return allGroups.filter((g: Group) => g.leaderId === user?.id);
    }
  });

  // Fetch projects for selected group
  const { data: groupProjects = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects/group/${selectedGroupId}`],
    enabled: !!selectedGroupId,
  });

  // Fetch group members count for selected group
  const { data: groupMembers = [] } = useQuery<any[]>({
    queryKey: [`/api/groups/${selectedGroupId}/members`],
    enabled: !!selectedGroupId,
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

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/tasks", "POST", data);
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/available"] });
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: "تم نشر المهمة في مجتمع المجموعة",
      });
      // Reset form
      setTaskTitle("");
      setTaskDescription("");
      setSelectedProjectId("");
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
    if (!selectedGroupId || !selectedProjectId || !taskTitle || !taskDescription) {
      toast({
        title: "تنبيه",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject || rewardPerMember <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد مشروع صالح",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      groupId: selectedGroupId,
      projectId: selectedProjectId,
      title: taskTitle,
      description: taskDescription,
      reward: rewardPerMember.toFixed(2),
      serviceType: "custom_task"
    });
  };

  const filteredTasks = availableTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.serviceType.includes(searchQuery)
  );

  const selectedProject = groupProjects.find(p => p.id === selectedProjectId);
  const selectedGroup = myGroups.find(g => g.id === selectedGroupId);

  // Auto-calculate reward per member based on project budget and group size
  const memberCount = groupMembers.length || 1; // Prevent division by zero
  const projectBudget = selectedProject ? parseFloat(selectedProject.budget) : 0;

  // Calculate per-member reward
  const platformFeeTotal = projectBudget * 0.10;
  const leaderCommissionTotal = projectBudget * 0.03;
  const totalForMembers = projectBudget - platformFeeTotal - leaderCommissionTotal;
  const rewardPerMember = totalForMembers / memberCount;

  // Calculate individual breakdown for display
  const rewardValue = rewardPerMember;
  const platformFee = (rewardPerMember * memberCount * 0.10) / memberCount; // Per member share of platform fee
  const leaderCommission = (rewardPerMember * memberCount * 0.03) / memberCount; // Per member share of leader commission
  const netReward = rewardPerMember;

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">جاري التحميل...</div>;
  }

  // Separate tasks by source
  const campaignTasks = filteredTasks.filter(t => t.campaignId && !t.groupId);
  const groupTasks = filteredTasks.filter(t => t.groupId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">المهام المتاحة</h2>
          <p className="text-muted-foreground mt-1">
            تصفح واختر المهام التي تناسب مهاراتك من الحملات أو مجموعاتك
          </p>
        </div>
        {/* Always show the button, but handle the empty state inside the click or render */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء مهمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة للمجموعة</DialogTitle>
              <DialogDescription>
                قم بإنشاء مهمة جديدة وتعيينها لمشروع محدد. سيتم نشر المهمة تلقائياً في مجتمع المجموعة.
              </DialogDescription>
            </DialogHeader>

            {myGroups.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
                  <p className="font-medium">أنت لست قائداً لأي مجموعة بعد</p>
                  <p className="text-sm mt-1">لإنشاء مهام، يجب أن تكون قائداً لمجموعة واحدة على الأقل.</p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/freelancer-dashboard/groups'}>
                  الذهاب لإنشاء مجموعة
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المجموعة</Label>
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المجموعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {myGroups.map(group => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المشروع</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupProjects
                          .filter(project => project.status !== 'done')
                          .map(project => (
                            <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedProject && (
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>ميزانية المشروع:</strong> ${selectedProject.budget}</p>
                    <p><strong>عدد المهام المطلوبة:</strong> {selectedProject.tasksCount}</p>
                    <p><strong>عدد أعضاء المجموعة:</strong> {memberCount}</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-green-700 font-semibold"><strong>المكافأة لكل عضو:</strong> ${rewardPerMember.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>عنوان المهمة</Label>
                  <Input
                    placeholder="عنوان مختصر للمهمة"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>وصف المهمة</Label>
                  <Textarea
                    placeholder="تفاصيل المهمة والمطلوب تنفيذه..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>

                {rewardValue > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>إجمالي المكافأة:</span>
                      <span className="font-bold">${rewardValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>رسوم المنصة (10%):</span>
                      <span>-${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>عمولة القائد (3%):</span>
                      <span>+${leaderCommission.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                      <span>صافي للأعضاء:</span>
                      <span>${netReward.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>إلغاء</Button>
              {myGroups.length > 0 && (
                <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  إنشاء ونشر المهمة
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              className={`shrink-0 ${badgeColor === "blue"
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
