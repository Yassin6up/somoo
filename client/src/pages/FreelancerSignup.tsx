import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { PasswordStrength } from "@/components/PasswordStrength";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Users as UsersIcon, Puzzle, Edit3, Camera, CreditCard, ArrowRight, ArrowLeft } from "lucide-react";
import { serviceOptions, paymentMethods, paymentMethodDetails } from "@shared/schema";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<FormData>>({
    countryCode: "+966",
    teamSize: "1",
    services: [],
  });

  const createFreelancerMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch("/api/freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          teamSize: parseInt(data.teamSize || "1", 10),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل إنشاء الحساب");
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", "freelancer");
      
      window.dispatchEvent(new Event("userLoggedIn"));
      
      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "مرحبًا بك في منصة سُمُوّ",
      });
      navigate("/freelancer-instructions");
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

  const defaultFormValues = useMemo(() => ({
    fullName: formData.fullName || "",
    username: formData.username || "",
    email: formData.email || "",
    phone: formData.phone || "",
    countryCode: formData.countryCode || "+966",
    password: formData.password || "",
    bio: formData.bio || "",
    jobTitle: formData.jobTitle || "",
    teamSize: formData.teamSize || "1",
    services: formData.services || [],
    aboutMe: formData.aboutMe || "",
    profileImage: formData.profileImage || "",
    idVerification: formData.idVerification || "",
    paymentMethod: formData.paymentMethod || "",
    accountNumber: formData.accountNumber || "",
  }), [currentStep, formData]);

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
        createFreelancerMutation.mutate(updatedFormData);
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

  const selectedPaymentMethod = form.watch("paymentMethod");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <StepIndicator steps={steps} currentStep={currentStep} />

          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl text-center text-gray-900">
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
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
                            <FormLabel className="text-gray-700">الاسم الكامل *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="أحمد محمد" 
                                className="rounded-lg border-gray-300 focus:border-gray-400" 
                                data-testid="input-fullname" 
                              />
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
                            <FormLabel className="text-gray-700">اسم المستخدم *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="ahmed_tester" 
                                className="rounded-lg border-gray-300 focus:border-gray-400" 
                                data-testid="input-username" 
                              />
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
                            <FormLabel className="text-gray-700">البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="ahmed@example.com" 
                                className="rounded-lg border-gray-300 focus:border-gray-400" 
                                data-testid="input-email" 
                                autoComplete="email" 
                                name="email" 
                              />
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
                              <FormLabel className="text-gray-700">كود الدولة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-lg border-gray-300" data-testid="select-country-code">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="+966">🇸🇦 +966</SelectItem>
                                  <SelectItem value="+971">🇦🇪 +971</SelectItem>
                                  <SelectItem value="+965">🇰🇼 +965</SelectItem>
                                  <SelectItem value="+973">🇧🇭 +973</SelectItem>
                                  <SelectItem value="+974">🇶🇦 +974</SelectItem>
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
                              <FormLabel className="text-gray-700">رقم الهاتف *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="501234567" 
                                  className="rounded-lg border-gray-300 focus:border-gray-400" 
                                  data-testid="input-phone" 
                                />
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
                            <FormLabel className="text-gray-700">كلمة المرور *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="••••••••" 
                                className="rounded-lg border-gray-300 focus:border-gray-400" 
                                data-testid="input-password" 
                                autoComplete="new-password" 
                                name="password" 
                              />
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
                            <FormLabel className="text-gray-700">وصف قصير عن نفسك *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="مثال: أنا محمد، مختبر تطبيقات وخرائط Google..." 
                                className="rounded-lg border-gray-300 focus:border-gray-400 min-h-[100px]" 
                                data-testid="input-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Card className="border border-gray-200 rounded-lg bg-gray-50">
                        <CardContent className="p-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">المسمى المهني *</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="مثال: مختبر تطبيقات - مسوّق تقييمات" 
                                    className="rounded-lg border-gray-300 focus:border-gray-400" 
                                    data-testid="input-job-title" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">المجالات التي تقدمها *</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  {serviceOptions.map((service) => (
                                    <FormField
                                      key={service}
                                      control={form.control}
                                      name="services"
                                      render={({ field }) => (
                                        <FormItem className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
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
                                              className="mt-0.5 border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                                              data-testid={`checkbox-service-${service}`}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal text-gray-700 cursor-pointer">
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
                            name="aboutMe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">الوصف المهني (نبذة تفصيلية) *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="اكتب نبذة عنك توضح كيف تنفذ المهام مع فريقك، وما يميزك عن الآخرين..." 
                                    className="rounded-lg border-gray-300 focus:border-gray-400 min-h-[120px]" 
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
                      <Card className="border border-gray-200 rounded-lg bg-gray-50">
                        <CardContent className="p-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">صورة الملف الشخصي</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-4">
                                    <FileUpload
                                      type="profile"
                                      currentFile={field.value}
                                      onFileUploaded={(url) => field.onChange(url)}
                                      accept="image/*"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-600">
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
                                <FormLabel className="text-gray-700">إثبات الهوية (اختياري)</FormLabel>
                                <FormControl>
                                  <div>
                                    <FileUpload
                                      type="verification"
                                      currentFile={field.value}
                                      onFileUploaded={(url) => field.onChange(url)}
                                      accept="image/*,application/pdf"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">
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
                      <Card className="border border-gray-200 rounded-lg bg-gray-50">
                        <CardContent className="p-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">وسيلة الدفع المفضلة *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-lg border-gray-300" data-testid="select-payment-method">
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

                          {selectedPaymentMethod && selectedPaymentMethod !== "محفظة سُمُوّ" && (
                            <FormField
                              control={form.control}
                              name="accountNumber"
                              render={({ field }) => {
                                const methodDetails = paymentMethodDetails[selectedPaymentMethod];
                                
                                return (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">{methodDetails?.label || "رقم الحساب أو المحفظة"}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type={methodDetails?.inputType || "text"}
                                        placeholder={methodDetails?.placeholder || "مثال: 1234 5678 9012 3456"} 
                                        className="rounded-lg border-gray-300 focus:border-gray-400" 
                                        data-testid="input-account-number" 
                                      />
                                    </FormControl>
                                    <FormDescription className="text-sm text-gray-600">
                                      {selectedPaymentMethod === "التحويل البنكي" && "أدخل رقم الحساب البنكي الدولي (IBAN)"}
                                      {selectedPaymentMethod.includes("كاش") && "أدخل رقم هاتف المحفظة"}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          )}
                          
                          {selectedPaymentMethod === "محفظة سُمُوّ" && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-700">
                                سيتم إنشاء محفظة سُمُوّ تلقائيًا لك عند إنشاء الحساب.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Checkbox 
                          id="terms" 
                          data-testid="checkbox-terms" 
                          className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                          أوافق على{" "}
                          <a href="#terms" className="text-gray-900 hover:underline">الشروط والأحكام</a>
                          {" "}و{" "}
                          <a href="#privacy" className="text-gray-900 hover:underline">سياسة الخصوصية</a>
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
                        className="flex-1 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                        data-testid="button-back"
                      >
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        السابق
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                      data-testid="button-next"
                      disabled={createFreelancerMutation.isPending}
                    >
                      {createFreelancerMutation.isPending ? "جاري الإنشاء..." : currentStep === 4 ? "إنشاء الحساب" : "التالي"}
                      {currentStep < 4 && !createFreelancerMutation.isPending && <ArrowRight className="mr-2 h-4 w-4" />}
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