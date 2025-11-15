import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, DollarSign, Users } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function CompletedProjectsPage() {
  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/my"],
  });

  // Filter for completed projects only
  const completedProjects = allProjects.filter((p) => p.status === "completed");

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
          <h1 className="text-3xl font-bold" data-testid="text-completed-projects-title">
            المشاريع المكتملة
          </h1>
          <p className="text-muted-foreground">
            المشاريع التي تم إنجازها بنجاح ({completedProjects.length})
          </p>
        </div>
      </div>

      {completedProjects.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع مكتملة</h3>
            <p className="text-muted-foreground text-center mb-6">
              لم تكمل أي مشاريع بعد
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
          {completedProjects.map((project) => (
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
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      مكتمل
                    </Badge>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    تاريخ الإنشاء: {format(new Date(project.createdAt), "dd MMMM yyyy", { locale: ar })}
                  </span>
                </div>
                {project.updatedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      تاريخ الإكمال: {format(new Date(project.updatedAt), "dd MMMM yyyy", { locale: ar })}
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
          ))}
        </div>
      )}
    </div>
  );
}
