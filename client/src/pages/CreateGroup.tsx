import { useState, useEffect } from "react";
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
import { ArrowRight, Users, Image, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertGroupSchema } from "@shared/schema";
import { z } from "zod";

const createGroupSchema = insertGroupSchema.extend({
  maxMembers: z.number().min(2, "يجب أن يكون الحد الأقصى للأعضاء 2 على الأقل").max(700, "الحد الأقصى 700 عضو"),
}).omit({ leaderId: true });

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function CreateGroup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      groupImage: "",
      maxMembers: 50,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يجب اختيار صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'group');

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل رفع الصورة');
      }

      const { url } = await response.json();
      
      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Update form
      form.setValue('groupImage', url);
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الجروب بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupForm) => {
      if (!user || !user.userId) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }
      const groupData = {
        ...data,
        leaderId: user.userId,
      };
      return await apiRequest("/api/groups", "POST", groupData);
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
            <div className="flex items-center gap-4 mb-2">
              {/* Preview Image or Icon */}
              {imagePreview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="معاينة صورة الجروب"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
              
              <div className="flex-1">
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

                {/* Group Image */}
                <FormField
                  control={form.control}
                  name="groupImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>صورة الجروب</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Upload Button */}
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('group-image-input')?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                              data-testid="button-upload-group-image"
                            >
                              <Upload className="h-4 w-4" />
                              {isUploading ? "جاري الرفع..." : "اختر صورة من المعرض"}
                            </Button>
                            <input
                              id="group-image-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              data-testid="input-group-image-file"
                            />
                          </div>

                          {/* Preview */}
                          {imagePreview && (
                            <div className="relative w-full max-w-md">
                              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={imagePreview}
                                  alt="معاينة صورة الجروب"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 left-2"
                                onClick={() => {
                                  setImagePreview("");
                                  form.setValue('groupImage', "");
                                }}
                                data-testid="button-remove-group-image"
                              >
                                حذف الصورة
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        اختر صورة من معرض الصور (اختياري). الحد الأقصى 5 ميجابايت
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
                          min={2}
                          max={700}
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : parseInt(value));
                          }}
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
