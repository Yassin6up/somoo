import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusConfig = {
  pending: { label: "قيد الانتظار", variant: "secondary" as const, icon: Clock },
  accepted: { label: "مقبول", variant: "default" as const, icon: CheckCircle },
  in_progress: { label: "قيد التنفيذ", variant: "default" as const, icon: Briefcase },
  completed: { label: "مكتمل", variant: "default" as const, icon: CheckCircle },
  cancelled: { label: "ملغي", variant: "destructive" as const, icon: XCircle },
};

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/my"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مشاريعي</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingProjects = projects.filter((p) => p.status === "pending");
  const activeProjects = projects.filter((p) => p.status === "accepted" || p.status === "in_progress");
  const completedProjects = projects.filter((p) => p.status === "completed");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-projects-title">مشاريعي</h1>
          <p className="text-muted-foreground">إدارة جميع مشاريعك</p>
        </div>
        <Link href="/projects/create">
          <Button data-testid="button-create-project">
            <Plus className="ml-2 h-4 w-4" />
            مشروع جديد
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-projects">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-projects">{pendingProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-projects">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-projects">{completedProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع بعد</h3>
            <p className="text-muted-foreground text-center mb-4">
              ابدأ بإنشاء مشروعك الأول
            </p>
            <Link href="/projects/create">
              <Button data-testid="button-create-first-project">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء مشروع جديد
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = statusConfig[project.status as keyof typeof statusConfig];
            const StatusIcon = config?.icon || Briefcase;

            return (
              <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg" data-testid={`text-project-title-${project.id}`}>
                      {project.title}
                    </CardTitle>
                    <Badge variant={config?.variant || "secondary"} data-testid={`badge-status-${project.id}`}>
                      <StatusIcon className="ml-1 h-3 w-3" />
                      {config?.label || project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الميزانية:</span>
                    <span className="font-semibold" data-testid={`text-budget-${project.id}`}>
                      ${project.budget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">عدد المهام:</span>
                    <span className="font-semibold" data-testid={`text-tasks-count-${project.id}`}>
                      {project.tasksCount || 0}
                    </span>
                  </div>
                  {project.createdAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                      <span className="text-xs">
                        {format(new Date(project.createdAt), "dd MMM yyyy", { locale: ar })}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" className="w-full" data-testid={`button-view-project-${project.id}`}>
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
