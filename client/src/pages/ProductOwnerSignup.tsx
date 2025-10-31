import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { serviceOptions, productTypes, packages } from "@shared/schema";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "المعلومات العامة" },
  { id: 2, title: "معلومات المنتج" },
  { id: 3, title: "الخدمات والباقات" },
  { id: 4, title: "الميزانية والتأكيد" },
];

const step1Schema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  companyName: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"),
});

const step2Schema = z.object({
  productName: z.string().min(3, "اسم المنتج مطلوب"),
  productType: z.string().min(1, "نوع المنتج مطلوب"),
  productDescription: z.string().min(20, "وصف المنتج يجب أن يحتوي على 20 حرفًا على الأقل"),
  productUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
});

const step3Schema = z.object({
  services: z.array(z.string()).min(1, "اختر خدمة واحدة على الأقل"),
  package: z.string().optional(),
});

const step4Schema = z.object({
  budget: z.string().optional(),
  duration: z.string().optional(),
});

type FormData = z.infer<typeof step1Schema> & 
  z.infer<typeof step2Schema> & 
  z.infer<typeof step3Schema> & 
  z.infer<typeof step4Schema>;

export default function ProductOwnerSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<FormData>>({
    services: [],
  });

  const createOwnerMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch("/api/product-owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل إنشاء الحساب");
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", "product_owner");
      
      // Dispatch custom event to update Navbar
      window.dispatchEvent(new Event("userLoggedIn"));
      
      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "مرحبًا بك في منصة سُمُوّ",
      });
      navigate("/campaigns");
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في إنشاء الحساب. حاول مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const getSchemaForStep = (step: number) => {
    switch (step) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      default: return step1Schema;
    }
  };

  // Memoize default values to prevent re-initialization
  const defaultFormValues = useMemo(() => ({
    ...formData,
    services: formData.services || [],
  }), [currentStep]);

  const form = useForm<FormData>({
    resolver: zodResolver(getSchemaForStep(currentStep)),
    values: defaultFormValues as any,
    mode: "onChange",
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const currentValues = form.getValues();
      const updatedFormData = { ...formData, ...currentValues };
      setFormData(updatedFormData);
      
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        form.clearErrors();
      } else {
        // Submit form to backend
        createOwnerMutation.mutate(updatedFormData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const currentValues = form.getValues();
      setFormData({ ...formData, ...currentValues });
      setCurrentStep(currentStep - 1);
    }
  };

  const selectPackage = (packageId: string) => {
    form.setValue("package", packageId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <StepIndicator steps={steps} currentStep={currentStep} />

          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl text-center">
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form className="space-y-6">
                  {/* Step 1: General Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل / اسم الشركة *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="شركة التقنية المتقدمة" className="rounded-xl" data-testid="input-fullname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم الشركة (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Advanced Tech Co." className="rounded-xl" data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني الرسمي *</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="info@company.com" className="rounded-xl" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="501234567" className="rounded-xl" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور *</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="••••••••" className="rounded-xl" data-testid="input-password" />
                            </FormControl>
                            <PasswordStrength password={field.value || ""} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Product Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المنتج *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="تطبيق التوصيل السريع" className="rounded-xl" data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع المنتج *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl" data-testid="select-product-type">
                                  <SelectValue placeholder="اختر نوع المنتج" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف قصير عن المنتج *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="مثال: تطبيق لتوصيل الطلبات المحلية مع تتبع مباشر للسائقين..." 
                                className="rounded-xl min-h-[120px]" 
                                data-testid="input-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط التطبيق أو الموقع</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://example.com" className="rounded-xl" data-testid="input-product-url" />
                            </FormControl>
                            <FormDescription className="text-xs">
                              إذا لم يُنشر بعد، اتركه فارغًا
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Services & Packages */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الخدمات المطلوبة *</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {serviceOptions.map((service) => (
                                <FormField
                                  key={service}
                                  control={form.control}
                                  name="services"
                                  render={({ field }) => (
                                    <FormItem className="flex items-start gap-2 p-3 rounded-xl border hover-elevate transition-all">
                                      <FormControl>
                                        <Checkbox
                                          checked={(field.value || []).includes(service)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            const updated = checked
                                              ? [...current, service]
                                              : current.filter((s) => s !== service);
                                            field.onChange(updated);
                                          }}
                                          className="mt-0.5"
                                          data-testid={`checkbox-service-${service}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {service}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="package"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اختر الباقة المناسبة</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              {packages.map((pkg) => (
                                <Card
                                  key={pkg.id}
                                  onClick={() => selectPackage(pkg.id)}
                                  className={cn(
                                    "rounded-2xl cursor-pointer transition-all hover-elevate",
                                    field.value === pkg.id 
                                      ? "ring-2 ring-primary shadow-lg" 
                                      : "shadow-md",
                                    'recommended' in pkg && pkg.recommended && "border-primary"
                                  )}
                                  data-testid={`card-package-${pkg.id}`}
                                >
                              <CardContent className="p-6 space-y-4">
                                {'recommended' in pkg && pkg.recommended && (
                                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                                    الأكثر طلبًا
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-xl font-bold">{pkg.nameAr}</h3>
                                  <p className="text-sm text-muted-foreground">{pkg.testers} مختبر</p>
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                  {pkg.price} <span className="text-base font-normal text-muted-foreground">ر.س</span>
                                </div>
                                <ul className="space-y-2">
                                  {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 4: Budget & Confirmation */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الميزانية المخصصة (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="5000 ر.س" className="rounded-xl" data-testid="input-budget" />
                            </FormControl>
                            <FormDescription className="text-xs">
                              اترك فارغًا إذا اخترت باقة جاهزة
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مدة التنفيذ المتوقعة (اختياري)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl" data-testid="select-duration">
                                  <SelectValue placeholder="اختر المدة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="3-5">3-5 أيام</SelectItem>
                                <SelectItem value="5-7">5-7 أيام</SelectItem>
                                <SelectItem value="7-14">7-14 يوم</SelectItem>
                                <SelectItem value="14+">أكثر من 14 يوم</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-accent/10 p-6 rounded-2xl space-y-4">
                        <h3 className="font-semibold">ملخص الطلب</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">المنتج:</span>
                            <span className="font-medium">{formData.productName || "غير محدد"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الباقة:</span>
                            <span className="font-medium">
                              {formData.package ? packages.find(p => p.id === formData.package)?.nameAr : "غير محدد"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">عدد الخدمات:</span>
                            <span className="font-medium">{formData.services?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-xl">
                        <Checkbox id="terms" data-testid="checkbox-terms" />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          أتعهد بعدم طلب تقييمات غير حقيقية، وجميع التجارب ستكون فعلية داخل المنصة. أوافق على{" "}
                          <a href="#terms" className="text-primary hover:underline">الشروط والأحكام</a>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    {currentStep > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBack}
                        className="flex-1 rounded-2xl"
                        data-testid="button-back"
                      >
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        السابق
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      className="flex-1 rounded-2xl"
                      data-testid="button-next"
                      disabled={createOwnerMutation.isPending}
                    >
                      {createOwnerMutation.isPending ? "جاري الإنشاء..." : currentStep === 4 ? "إنشاء الحساب" : "التالي"}
                      {currentStep < 4 && !createOwnerMutation.isPending && <ArrowRight className="mr-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
