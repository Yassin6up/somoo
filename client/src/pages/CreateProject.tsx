import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Briefcase } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";

const createProjectSchema = insertProjectSchema.omit({ productOwnerId: true }).extend({
  budget: z.string().min(1, "الميزانية مطلوبة"),
  tasksCount: z.number().min(1, "يجب أن يكون عدد المهام 1 على الأقل"),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function CreateProject() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      targetCountry: "السعودية",
      tasksCount: 10,
      budget: "",
      deadline: undefined,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      return await apiRequest("/api/projects", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/pending"] });
      toast({
        title: "تم إنشاء المشروع",
        description: "تم إنشاء المشروع بنجاح وهو متاح الآن لقادة الجروبات",
      });
      navigate("/projects");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectForm) => {
    createProjectMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-6"
          data-testid="button-back-to-projects"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمشاريع
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                  إنشاء مشروع جديد
                </CardTitle>
                <CardDescription>
                  أنشئ مشروعاً جديداً ليقبله قادة الجروبات
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المشروع *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: اختبار تطبيق التجارة الإلكترونية"
                          {...field}
                          data-testid="input-project-title"
                        />
                      </FormControl>
                      <FormDescription>
                        عنوان واضح ومختصر للمشروع
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف المشروع *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف تفصيلي عن المشروع والمهام المطلوبة..."
                          className="resize-none min-h-[150px]"
                          {...field}
                          data-testid="input-project-description"
                        />
                      </FormControl>
                      <FormDescription>
                        اشرح تفاصيل المشروع وما هو المطلوب من الفريلانسرز
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Country */}
                  <FormField
                    control={form.control}
                    name="targetCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدولة المستهدفة *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="السعودية"
                            {...field}
                            data-testid="input-target-country"
                          />
                        </FormControl>
                        <FormDescription>
                          الدولة التي يجب أن يكون الفريلانسرز منها
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tasks Count */}
                  <FormField
                    control={form.control}
                    name="tasksCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد المهام *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-tasks-count"
                          />
                        </FormControl>
                        <FormDescription>
                          عدد المهام المطلوب إنجازها
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الميزانية (ر.س) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="1000"
                            {...field}
                            data-testid="input-budget"
                          />
                        </FormControl>
                        <FormDescription>
                          إجمالي ميزانية المشروع
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Deadline */}
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموعد النهائي (اختياري)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-deadline"
                          />
                        </FormControl>
                        <FormDescription>
                          الموعد النهائي لإنجاز المشروع
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Info Card */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3">ملاحظات هامة:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>سيكون المشروع متاحاً لجميع قادة الجروبات للقبول</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>عند قبول المشروع، سيقوم قائد الجروب بتوزيع المهام على الأعضاء</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>ستدفع 5% عمولة إضافية لقائد الجروب عند إنجاز كل مهمة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>يمكنك متابعة تقدم المشروع ومراجعة المهام المنجزة</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/projects")}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {createProjectMutation.isPending ? "جاري الإنشاء..." : "إنشاء المشروع"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
