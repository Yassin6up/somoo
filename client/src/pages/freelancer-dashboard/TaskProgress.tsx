import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageCircle, 
  Users, 
  Filter,
  TrendingUp,
  TrendingDown,
  Crown,
  User
} from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import type { Task, Group } from "@shared/schema";

interface GroupMember {
  id: string;
  freelancerId: string;
  groupId: string;
  role: string;
  freelancer: {
    id: string;
    fullName: string;
    username: string;
    profileImage: string | null;
    jobTitle: string | null;
  };
}

interface TaskWithCompletion extends Task {
  completionStatus?: 'completed' | 'in_progress' | 'not_started';
}

export default function TaskProgress() {
  const [, setLocation] = useLocation();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all"); // all, leader, member

  // Fetch current user
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch all groups where user is a member or leader
  const { data: allGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Filter groups based on role filter
  const filteredGroups = allGroups.filter((group) => {
    if (roleFilter === "leader") return group.leaderId === user?.id;
    if (roleFilter === "member") return group.leaderId !== user?.id;
    return true;
  });

  // Fetch members for selected group
  const { data: groupMembers = [] } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${selectedGroupId}/members`],
    enabled: selectedGroupId !== "all",
  });

  // Fetch tasks for selected group
  const { data: groupTasks = [] } = useQuery<Task[]>({
    queryKey: [`/api/groups/${selectedGroupId}/tasks`],
    enabled: selectedGroupId !== "all",
  });

  // Fetch all tasks for all groups (when "all" is selected)
  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my/assigned"],
    enabled: selectedGroupId === "all",
  });

  const selectedGroup = allGroups.find(g => g.id === selectedGroupId);
  const isLeader = selectedGroup?.leaderId === user?.id;

  // Get tasks to display based on selection
  const displayTasks = selectedGroupId === "all" ? allTasks : groupTasks;
  const filteredTasks = selectedTaskId === "all" 
    ? displayTasks 
    : displayTasks.filter(t => t.id === selectedTaskId);

  // Calculate member progress for each task
  const getMemberProgress = () => {
    if (selectedGroupId === "all" || !groupMembers.length) return [];

    return groupMembers.map((member) => {
      const memberTasks = filteredTasks.filter(t => t.freelancerId === member.freelancerId);
      const completedTasks = memberTasks.filter(t => t.status === "approved" || t.status === "submitted");
      const inProgressTasks = memberTasks.filter(t => t.status === "in_progress");
      const notStartedTasks = memberTasks.filter(t => t.status === "assigned");

      const completionRate = memberTasks.length > 0 
        ? (completedTasks.length / memberTasks.length) * 100 
        : 0;

      return {
        ...member,
        totalTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        notStartedTasks: notStartedTasks.length,
        completionRate,
        tasks: memberTasks,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };

  const memberProgress = getMemberProgress();

  // Calculate overall statistics
  const totalMembers = memberProgress.length;
  const membersWithCompletedTasks = memberProgress.filter(m => m.completedTasks > 0).length;
  const overallCompletionRate = totalMembers > 0
    ? (membersWithCompletedTasks / totalMembers) * 100
    : 0;
  const totalTasksAssigned = memberProgress.reduce((sum, m) => sum + m.totalTasks, 0);
  const totalTasksCompleted = memberProgress.reduce((sum, m) => sum + m.completedTasks, 0);

  const handleChatMember = (memberId: string) => {
    setLocation(`/freelancer-dashboard/conversations?userId=${memberId}`);
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">تتبع إنجاز المهام</h2>
        <p className="text-muted-foreground mt-1">
          تابع تقدم أعضاء المجموعة في إنجاز المهام المختلفة
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">التصفية والبحث</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">دوري في المجموعات</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المجموعات</SelectItem>
                  <SelectItem value="leader">أنا قائد</SelectItem>
                  <SelectItem value="member">أنا عضو</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">المجموعة</label>
              <Select value={selectedGroupId} onValueChange={(value) => {
                setSelectedGroupId(value);
                setSelectedTaskId("all");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المجموعات</SelectItem>
                  {filteredGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                      {group.leaderId === user?.id && (
                        <Crown className="inline-block mr-1 h-3 w-3 text-yellow-500" />
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">المهمة</label>
              <Select 
                value={selectedTaskId} 
                onValueChange={setSelectedTaskId}
                disabled={selectedGroupId === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المهام</SelectItem>
                  {displayTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {selectedGroupId !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأعضاء</p>
                  <p className="text-3xl font-bold">{totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                  <p className="text-3xl font-bold text-green-600">{totalTasksCompleted}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المهام</p>
                  <p className="text-3xl font-bold">{totalTasksAssigned}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">معدل الإنجاز</p>
                  <p className="text-3xl font-bold text-blue-600">{overallCompletionRate.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Member Progress List */}
      {selectedGroupId === "all" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">يرجى اختيار مجموعة محددة</p>
            <p className="text-sm text-muted-foreground">
              لعرض تقدم الأعضاء، قم باختيار مجموعة من القائمة أعلاه
            </p>
          </CardContent>
        </Card>
      ) : memberProgress.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">لا يوجد أعضاء في هذه المجموعة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">تقدم الأعضاء ({memberProgress.length})</h3>
            {isLeader && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Crown className="h-3 w-3 ml-1" />
                أنت القائد
              </Badge>
            )}
          </div>

          <div className="grid gap-4">
            {memberProgress.map((member, index) => (
              <Card 
                key={member.id} 
                className={`hover:shadow-lg transition-all ${
                  index === 0 && member.completionRate === 100 
                    ? 'border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Member Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                          <AvatarImage src={getImageUrl(member.freelancer.profileImage) || undefined} />
                          <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {member.freelancer.fullName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {index === 0 && member.completionRate === 100 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg truncate">
                            {member.freelancer.fullName}
                          </h4>
                          {member.role === "leader" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shrink-0">
                              <Crown className="h-3 w-3 ml-1" />
                              قائد
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="shrink-0">
                              <User className="h-3 w-3 ml-1" />
                              عضو
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          @{member.freelancer.username}
                          {member.freelancer.jobTitle && ` • ${member.freelancer.jobTitle}`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">معدل الإنجاز</span>
                        <span className={`text-lg font-bold ${
                          member.completionRate === 100 ? 'text-green-600' :
                          member.completionRate >= 50 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {member.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={member.completionRate} 
                        className="h-2"
                      />
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">مكتملة:</span>
                          <span className="font-semibold text-green-600">{member.completedTasks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">جارية:</span>
                          <span className="font-semibold text-orange-600">{member.inProgressTasks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-muted-foreground">لم تبدأ:</span>
                          <span className="font-semibold text-gray-600">{member.notStartedTasks}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChatMember(member.freelancerId)}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        محادثة
                      </Button>
                    </div>
                  </div>

                  {/* Task Details */}
                  {member.tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                          <span>عرض تفاصيل المهام ({member.tasks.length})</span>
                          <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-3 space-y-2">
                          {member.tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  المكافأة: ${task.reward}
                                </p>
                              </div>
                              <Badge 
                                variant={
                                  task.status === "approved" ? "default" :
                                  task.status === "submitted" ? "secondary" :
                                  task.status === "in_progress" ? "outline" :
                                  "destructive"
                                }
                                className={
                                  task.status === "approved" ? "bg-green-600" :
                                  task.status === "submitted" ? "bg-blue-600" :
                                  task.status === "in_progress" ? "bg-orange-600 text-white" :
                                  ""
                                }
                              >
                                {task.status === "approved" ? "تم الموافقة" :
                                 task.status === "submitted" ? "تم التسليم" :
                                 task.status === "in_progress" ? "جارية" :
                                 "لم تبدأ"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
