import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Briefcase, Search, Calendar, DollarSign, CheckCircle2, Users, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Group } from "@shared/schema";

export default function Projects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [user, setUser] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // Fetch pending projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/pending"],
  });

  // Fetch user's groups where they are leader
  const { data: leaderGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups/my/leader"],
    enabled: !!user && user.userType === "freelancer",
  });

  // Accept project mutation
  const acceptProjectMutation = useMutation({
    mutationFn: async ({ projectId, groupId }: { projectId: string; groupId: string }) => {
      return await apiRequest(`/api/projects/${projectId}/accept`, "POST", { groupId });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects/pending"] });
      // Invalidate the specific group's projects
      queryClient.invalidateQueries({ queryKey: ["/api/projects/group", variables.groupId] });
      // Also invalidate all group project queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/projects/group";
        }
      });
      toast({
        title: "تم قبول المشروع",
        description: "تم قبول المشروع بنجاح ويمكنك الآن البدء بتوزيع المهام",
      });
      setSelectedProject(null);
      setSelectedGroupId("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء قبول المشروع",
        variant: "destructive",
      });
    },
  });

  // Filter projects
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.targetCountry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcceptProject = () => {
    if (selectedProject && selectedGroupId) {
      acceptProjectMutation.mutate({
        projectId: selectedProject.id,
        groupId: selectedGroupId,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
                المشاريع المتاحة
              </h1>
              <p className="text-muted-foreground">
                تصفح واقبل المشاريع المتاحة لجروبك
              </p>
            </div>

            {user?.userType === "productOwner" && (
              <Button
                onClick={() => navigate("/projects/create")}
                size="lg"
                data-testid="button-create-project"
              >
                <Briefcase className="ml-2 h-5 w-5" />
                إنشاء مشروع جديد
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search-projects"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع المتاحة</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الميزانيات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + parseFloat(p.budget as string), 0).toLocaleString()} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">جروباتي (كقائد)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderGroups.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "لم يتم العثور على مشاريع تطابق البحث" : "لا توجد مشاريع متاحة حالياً"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover-elevate transition-all"
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                      {project.title}
                    </CardTitle>
                    <Badge>{project.status === "pending" ? "متاح" : project.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-3 min-h-[3.5rem]">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-4">
                    {/* Budget */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="ml-2 h-4 w-4" />
                        الميزانية
                      </div>
                      <span className="font-semibold text-green-600">
                        {parseFloat(project.budget as string).toLocaleString()} ر.س
                      </span>
                    </div>

                    {/* Tasks Count */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                        عدد المهام
                      </div>
                      <span className="font-semibold">{project.tasksCount}</span>
                    </div>

                    {/* Target Country */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="ml-2 h-4 w-4" />
                        الدولة المستهدفة
                      </div>
                      <span className="font-semibold">{project.targetCountry}</span>
                    </div>

                    {/* Deadline */}
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

                  <Button
                    className="w-full"
                    onClick={() => setSelectedProject(project)}
                    disabled={leaderGroups.length === 0}
                    data-testid={`button-accept-project-${project.id}`}
                  >
                    {leaderGroups.length === 0 ? "يجب أن تكون قائد جروب" : "قبول المشروع"}
                  </Button>

                  {leaderGroups.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      أنشئ جروب لتتمكن من قبول المشاريع
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accept Project Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => {
        setSelectedProject(null);
        setSelectedGroupId("");
      }}>
        <DialogContent data-testid="dialog-accept-project">
          <DialogHeader>
            <DialogTitle>قبول المشروع</DialogTitle>
            <DialogDescription>
              اختر الجروب الذي سيعمل على هذا المشروع
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">{selectedProject.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">الميزانية:</span>
                    <span className="font-semibold mr-2 text-green-600">
                      {parseFloat(selectedProject.budget as string).toLocaleString()} ر.س
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المهام:</span>
                    <span className="font-semibold mr-2">{selectedProject.tasksCount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اختر الجروب</label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger data-testid="select-group">
                    <SelectValue placeholder="اختر جروب..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leaderGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.currentMembers}/{group.maxMembers} عضو)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    ملاحظة: بعد قبول المشروع، ستتمكن من إنشاء المهام وتوزيعها على أعضاء الجروب.
                    ستحصل على عمولة 5% من كل مهمة يكملها الأعضاء.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedProject(null);
                setSelectedGroupId("");
              }}
              data-testid="button-cancel-accept"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAcceptProject}
              disabled={!selectedGroupId || acceptProjectMutation.isPending}
              data-testid="button-confirm-accept"
            >
              {acceptProjectMutation.isPending ? "جاري القبول..." : "قبول المشروع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
