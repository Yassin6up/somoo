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
import { ArrowRight, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertGroupSchema } from "@shared/schema";
import { z } from "zod";

const createGroupSchema = insertGroupSchema.extend({
  maxMembers: z.number().min(2, "يجب أن يكون الحد الأقصى للأعضاء 2 على الأقل").max(700, "الحد الأقصى 700 عضو"),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      maxMembers: 50,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupForm) => {
      return await apiRequest("/api/groups", "POST", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "تم إنشاء الجروب بنجاح",
        description: "تم إنشاء الجروب وأنت الآن قائد الجروب",
      });
      navigate(`/groups/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الجروب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-6"
          data-testid="button-back-to-groups"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للجروبات
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                  إنشاء جروب جديد
                </CardTitle>
                <CardDescription>
                  أنشئ جروب وابدأ باستقبال أعضاء والعمل على المشاريع
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Group Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الجروب *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: فريق التطبيقات المحترف"
                          {...field}
                          data-testid="input-group-name"
                        />
                      </FormControl>
                      <FormDescription>
                        اختر اسماً واضحاً وجذاباً للجروب
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
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف مختصر عن الجروب وأهدافه..."
                          className="resize-none min-h-[120px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-group-description"
                        />
                      </FormControl>
                      <FormDescription>
                        اشرح للأعضاء ما يميز جروبك
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Members */}
                <FormField
                  control={form.control}
                  name="maxMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأقصى للأعضاء *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          max="700"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-group-max-members"
                        />
                      </FormControl>
                      <FormDescription>
                        يمكنك استقبال حتى 700 عضو (الحد الأقصى للمنصة)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Info Card */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3">ملاحظات هامة:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>ستصبح قائد الجروب تلقائياً بعد الإنشاء</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>ستحصل على عمولة 5% من كل مهمة يكملها أعضاء جروبك</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>يمكنك قبول المشاريع وتوزيع المهام على الأعضاء</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>يمكنك إزالة الأعضاء غير النشطين من الجروب</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/groups")}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {createGroupMutation.isPending ? "جاري الإنشاء..." : "إنشاء الجروب"}
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
