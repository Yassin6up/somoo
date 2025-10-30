import { useState } from "react";
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
import { Briefcase, Users as UsersIcon, Puzzle, Edit3, Camera, CreditCard, ArrowRight, ArrowLeft, Upload } from "lucide-react";
import { serviceOptions, paymentMethods } from "@shared/schema";
import { useLocation } from "wouter";

const steps = [
  { id: 1, title: "المعلومات الأساسية" },
  { id: 2, title: "المهارات والخدمات" },
  { id: 3, title: "التوثيق" },
  { id: 4, title: "إعدادات الدفع" },
];

// Form schemas for each step
const step1Schema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  username: z.string().min(3, "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  countryCode: z.string(),
  password: z.string().min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"),
});

const step2Schema = z.object({
  bio: z.string().min(20, "الوصف يجب أن يحتوي على 20 حرفًا على الأقل"),
  jobTitle: z.string().min(3, "المسمى المهني مطلوب"),
  teamSize: z.string(),
  services: z.array(z.string()).min(1, "اختر خدمة واحدة على الأقل"),
  aboutMe: z.string().min(50, "الوصف التفصيلي يجب أن يحتوي على 50 حرفًا على الأقل"),
});

const step3Schema = z.object({
  profileImage: z.string().optional(),
  idVerification: z.string().optional(),
});

const step4Schema = z.object({
  paymentMethod: z.string().min(1, "اختر وسيلة الدفع"),
  accountNumber: z.string().optional(),
});

type FormData = z.infer<typeof step1Schema> & 
  z.infer<typeof step2Schema> & 
  z.infer<typeof step3Schema> & 
  z.infer<typeof step4Schema>;

export default function FreelancerSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<Partial<FormData>>({
    countryCode: "+966",
    teamSize: "1",
    services: [],
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

  const form = useForm<FormData>({
    resolver: zodResolver(getSchemaForStep(currentStep)),
    defaultValues: formData as any,
    mode: "onChange",
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const currentValues = form.getValues();
      setFormData({ ...formData, ...currentValues });
      
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        form.clearErrors();
      } else {
        // Submit form
        console.log("Final form data:", { ...formData, ...currentValues });
        navigate("/dashboard?role=freelancer");
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

  const toggleService = (service: string) => {
    const current = form.getValues("services") || [];
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    form.setValue("services", updated);
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
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="أحمد محمد" className="rounded-xl" data-testid="input-fullname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ahmed_tester" className="rounded-xl" data-testid="input-username" />
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
                            <FormLabel>البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="ahmed@example.com" className="rounded-xl" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كود الدولة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl" data-testid="select-country-code">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="+966">🇸🇦 +966</SelectItem>
                                  <SelectItem value="+971">🇦🇪 +971</SelectItem>
                                  <SelectItem value="+965">🇰🇼 +965</SelectItem>
                                  <SelectItem value="+20">🇪🇬 +20</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>رقم الهاتف *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="501234567" className="rounded-xl" data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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

                  {/* Step 2: Skills & Services */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف قصير عن نفسك *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="مثال: أنا محمد، مختبر تطبيقات وخرائط Google لدي 40 شخصًا قادرين على الاختبار من فريقي..." 
                                className="rounded-xl min-h-[100px]" 
                                data-testid="input-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Card className="rounded-xl bg-muted/30">
                        <CardContent className="p-6 space-y-4">
                          <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  المسمى المهني *
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="مثال: مختبر تطبيقات - مسوّق تقييمات - مدير فريق مراجعين" className="rounded-xl" data-testid="input-job-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="teamSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <UsersIcon className="h-4 w-4" />
                                  عدد أعضاء الفريق *
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="1" className="rounded-xl" data-testid="input-team-size" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  أدخل عدد الأشخاص الذين يعملون معك في تنفيذ المهام
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="services"
                            render={() => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Puzzle className="h-4 w-4" />
                                  المجالات التي تقدمها *
                                </FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                  {serviceOptions.map((service) => (
                                    <div
                                      key={service}
                                      onClick={() => toggleService(service)}
                                      className="flex items-start gap-2 p-3 rounded-xl border cursor-pointer hover-elevate transition-all"
                                      data-testid={`checkbox-service-${service}`}
                                    >
                                      <Checkbox
                                        checked={(form.watch("services") || []).includes(service)}
                                        className="mt-0.5"
                                      />
                                      <span className="text-sm">{service}</span>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="aboutMe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Edit3 className="h-4 w-4" />
                                  الوصف المهني (نبذة تفصيلية) *
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="اكتب نبذة عنك توضح كيف تنفذ المهام مع فريقك، وما يميزك عن الآخرين..." 
                                    className="rounded-xl min-h-[150px]" 
                                    data-testid="input-about-me"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Verification */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <Card className="rounded-xl bg-muted/30">
                        <CardContent className="p-6 space-y-6">
                          <FormField
                            control={form.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Camera className="h-4 w-4" />
                                  صورة الملف الشخصي
                                </FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed flex items-center justify-center">
                                      <Camera className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <Button type="button" variant="outline" className="rounded-xl" data-testid="button-upload-profile">
                                        <Upload className="ml-2 h-4 w-4" />
                                        اختر صورة
                                      </Button>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        اختر صورة واضحة لزيادة الثقة بينك وبين العملاء
                                      </p>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idVerification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>إثبات الهوية (اختياري)</FormLabel>
                                <FormControl>
                                  <div>
                                    <Button type="button" variant="outline" className="rounded-xl" data-testid="button-upload-id">
                                      <Upload className="ml-2 h-4 w-4" />
                                      رفع إثبات الهوية
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      PDF أو صورة - سيتم مراجعتها يدويًا من قبل الإدارة
                                    </p>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 4: Payment Settings */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <Card className="rounded-xl bg-accent/10">
                        <CardContent className="p-6 space-y-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  وسيلة الدفع المفضلة *
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl" data-testid="select-payment-method">
                                      <SelectValue placeholder="اختر وسيلة الدفع" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method} value={method}>
                                        {method}
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
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>رقم الحساب أو المحفظة</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="مثال: 1234 5678 9012 3456" className="rounded-xl" data-testid="input-account-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-xl">
                        <Checkbox id="terms" data-testid="checkbox-terms" />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          أوافق على{" "}
                          <a href="#terms" className="text-primary hover:underline">الشروط والأحكام</a>
                          {" "}و{" "}
                          <a href="#privacy" className="text-primary hover:underline">سياسة الخصوصية</a>
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
                    >
                      {currentStep === 4 ? "إنشاء الحساب" : "التالي"}
                      {currentStep < 4 && <ArrowRight className="mr-2 h-4 w-4" />}
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
