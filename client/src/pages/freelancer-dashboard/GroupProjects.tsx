import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Briefcase, DollarSign, CheckCircle2, MapPin, Calendar, Users, Clock, Check } from "lucide-react";
import type { Group, Project } from "@shared/schema";
import { Link } from "wouter";

// Helper function to translate status to Arabic
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    "pending": "قيد الانتظار",
    "accepted": "مقبولة",
    "in_progress": "قيد التنفيذ",
    "completed": "مكتملة",
    "cancelled": "ملغي"
  };
  return statusLabels[status] || status;
}

export default function GroupProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"accepted" | "in_progress" | "completed">("accepted");

  // Fetch groups where current freelancer is a leader
  const { data: leaderGroups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups/my/leader"],
  });

  // Initialize selectedGroupId to first group if available
  useEffect(() => {
    if (!selectedGroupId && leaderGroups.length > 0) {
      setSelectedGroupId(leaderGroups[0].id);
    }
  }, [leaderGroups, selectedGroupId]);

  // Fetch projects accepted by selected group
  const { data: groupProjects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/group", selectedGroupId],
    enabled: !!selectedGroupId,
  });

  // Filter by status first, then by search term
  const filteredProjects = groupProjects
    .filter((project) => {
      if (statusFilter === "accepted") return project.status === "accepted";
      if (statusFilter === "in_progress") return project.status === "in_progress";
      if (statusFilter === "completed") return project.status === "completed";
      return true;
    })
    .filter((project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.targetCountry.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مشاريع مجموعتي</h1>
          <p className="text-muted-foreground">استعرض المشاريع المقبولة لجروباتك كقائد</p>
        </div>
      </div>

      {/* Group Selector + Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">اختر الجروب</label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger data-testid="select-leader-group">
              <SelectValue placeholder={groupsLoading ? "جاري التحميل..." : "اختر جروب"} />
            </SelectTrigger>
            <SelectContent>
              {leaderGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.currentMembers}/{group.maxMembers} عضو)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {leaderGroups.length === 0 && !groupsLoading && (
            <p className="text-xs text-muted-foreground mt-2">أنت لست قائدًا لأي جروب حاليًا</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">ابحث في المشاريع</label>
          <Input
            placeholder="ابحث بعنوان المشروع أو الدولة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-group-projects"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${statusFilter === "accepted"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500"
          }`}
          onClick={() => setStatusFilter("accepted")}
        >
          <CheckCircle2 className="w-4 h-4 ml-2" />
          المقبولة ({groupProjects.filter((p) => p.status === "accepted").length})
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${statusFilter === "in_progress"
            ? "border-orange-600 text-orange-600"
            : "border-transparent text-gray-500"
          }`}
          onClick={() => setStatusFilter("in_progress")}
        >
          <Clock className="w-4 h-4 ml-2" />
          قيد التنفيذ ({groupProjects.filter((p) => p.status === "in_progress").length})
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${statusFilter === "completed"
            ? "border-green-600 text-green-600"
            : "border-transparent text-gray-500"
          }`}
          onClick={() => setStatusFilter("completed")}
        >
          <Check className="w-4 h-4 ml-2" />
          المكتملة ({groupProjects.filter((p) => p.status === "completed").length})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المشاريع</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-group-projects">{groupProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الميزانيات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupProjects.reduce((sum, p) => sum + parseFloat(p.budget as string), 0).toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الجروبات التي تقودها</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-leader-groups">{leaderGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded mb-4" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع مقبولة لهذا الجروب</h3>
            <p className="text-muted-foreground text-center">اختر جروبًا مختلفًا أو اقبل مشروعًا جديدًا من صفحة المشاريع</p>
            <Link href="/projects">
              <Button className="mt-4">استكشاف المشاريع المتاحة</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover-elevate transition-all" data-testid={`card-group-project-${project.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {project.title}
                  </CardTitle>
                  <Badge>{getStatusLabel(project.status)}</Badge>
                </div>
                <CardDescription className="line-clamp-3 min-h-[3.5rem]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="ml-2 h-4 w-4" />
                      الميزانية
                    </div>
                    <span className="font-semibold text-green-600">
                      {parseFloat(project.budget as string).toLocaleString()} ر.س
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                      عدد المهام
                    </div>
                    <span className="font-semibold">{project.tasksCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="ml-2 h-4 w-4" />
                      الدولة المستهدفة
                    </div>
                    <span className="font-semibold">{project.targetCountry}</span>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="ml-2 h-4 w-4" />
                        الموعد النهائي
                      </div>
                      <span className="font-semibold">
                        {new Date(project.deadline).toLocaleDateString("ar")}
                      </span>
                    </div>
                  )}
                </div>

                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" className="w-full">عرض التفاصيل</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
