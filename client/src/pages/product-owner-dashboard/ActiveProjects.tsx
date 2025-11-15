import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, DollarSign, Users } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function ActiveProjectsPage() {
  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/my"],
  });

  // Filter for active projects only
  const activeProjects = allProjects.filter(
    (p) => p.status === "accepted" || p.status === "in_progress"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-active-projects-title">
            المشاريع النشطة
          </h1>
          <p className="text-muted-foreground">
            المشاريع قيد التنفيذ حالياً ({activeProjects.length})
          </p>
        </div>
        <Link href="/projects/create">
          <Button data-testid="button-create-project">
            إنشاء مشروع جديد
          </Button>
        </Link>
      </div>

      {activeProjects.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع نشطة</h3>
            <p className="text-muted-foreground text-center mb-6">
              ليس لديك مشاريع قيد التنفيذ في الوقت الحالي
            </p>
            <Link href="/projects/create">
              <Button data-testid="button-create-first-project">
                إنشاء مشروع جديد
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.map((project) => {
            const statusConfig = {
              accepted: { label: "مقبول", variant: "default" as const },
              in_progress: { label: "قيد التنفيذ", variant: "default" as const },
            };

            const status = statusConfig[project.status as keyof typeof statusConfig];

            return (
              <Card
                key={project.id}
                className="rounded-2xl hover-elevate"
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2" data-testid={`project-title-${project.id}`}>
                        {project.title}
                      </CardTitle>
                      {status && (
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      )}
                    </div>
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>الميزانية: ${parseFloat(project.budget).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>عدد المهام: {project.tasksCount}</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        الموعد النهائي: {format(new Date(project.deadline), "dd MMMM yyyy", { locale: ar })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      تاريخ الإنشاء: {format(new Date(project.createdAt), "dd MMMM yyyy", { locale: ar })}
                    </span>
                  </div>
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
