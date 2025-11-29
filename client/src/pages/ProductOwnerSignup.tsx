import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, DollarSign, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "المعلومات الأساسية" },
  { id: 2, title: "اختيار الخدمة (اختياري)" },
  { id: 3, title: "التأكيد" },
];

// قائمة الخدمات المتاحة
const servicesList = [
  { id: "google_play_review", name: "تقييم تطبيقك على Google Play", pricePerReview: 1 },
  { id: "ios_review", name: "تقييم تطبيقك على iOS", pricePerReview: 1 },
  { id: "website_review", name: "تقييم موقعك الإلكتروني", pricePerReview: 1 },
  { id: "ux_testing", name: "اختبار تجربة المستخدم لتطبيقك أو موقعك", pricePerReview: 1 },
  { id: "software_testing", name: "اختبار أنظمة السوفت وير", pricePerReview: 1 },
  { id: "social_media_engagement", name: "التفاعل مع منشورات السوشيال ميديا", pricePerReview: 1 },
  { id: "google_maps_review", name: "تقييمات خرائط جوجل ماب", pricePerReview: 2 },
];

const step1Schema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"),
});

const step2Schema = z.object({
  serviceType: z.string().optional(),
  reviewsCount: z.number().optional(),
  skipOrder: z.boolean().default(false),
});

const step3Schema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, "يجب الموافقة على الشروط والأحكام"),
});

type FormData = z.infer<typeof step1Schema> & 
  z.infer<typeof step2Schema> & 
  z.infer<typeof step3Schema>;

export default function ProductOwnerSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<FormData>>({
    reviewsCount: 50,
    skipOrder: false,
  });

  const createOwnerMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch("/api/product-owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          services: data.skipOrder ? [] : (data.serviceType ? [data.serviceType] : []),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "فشل إنشاء الحساب";
        
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.error)) {
          errorMessage = errorData.error.map((e: any) => e.message || e.code).join(', ');
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", "product_owner");
      
      window.dispatchEvent(new Event("userLoggedIn"));
      
      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "مرحبًا بك في منصة سُمُوّ",
      });
      navigate("/product-owner-instructions");
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
      default: return step1Schema;
    }
  };

  const defaultFormValues = useMemo(() => ({
    ...formData,
  }), [currentStep]);

  const form = useForm<FormData>({
    resolver: zodResolver(getSchemaForStep(currentStep)),
    values: defaultFormValues as any,
    mode: "onChange",
  });

  // حساب التكلفة
  const selectedService = servicesList.find(s => s.id === formData.serviceType);
  const reviewsCount = formData.reviewsCount || 0;
  const pricePerReview = selectedService?.pricePerReview || 0;
  const totalCost = reviewsCount * pricePerReview;

  const handleNext = async () => {
    if (currentStep === 2) {
      const currentValues = form.getValues();
      const updatedFormData = { ...formData, ...currentValues };
      setFormData(updatedFormData);
      
      if (currentValues.skipOrder) {
        setCurrentStep(currentStep + 1);
        form.clearErrors();
        return;
      }
    }
    
    const isValid = await form.trigger();
    if (isValid) {
      const currentValues = form.getValues();
      const updatedFormData = { ...formData, ...currentValues };
      setFormData(updatedFormData);
      
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        form.clearErrors();
      } else {
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 py-8 px-4 mt-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">إنشاء حساب صاحب منتج</h1>
            <p className="text-gray-600">احصل على تقييمات واختبارات حقيقية لمنتجك</p>
          </div>

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
                            <FormLabel className="text-gray-700">الاسم الكامل / اسم الشركة *</FormLabel>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">البريد الإلكتروني *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="info@company.com" 
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

                  {/* Step 2: Service Selection (Optional) */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="skipOrder"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  setFormData({ ...formData, skipOrder: !!checked });
                                }}
                                data-testid="checkbox-skip-order"
                                className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-gray-700 font-medium cursor-pointer">
                                أتجاهل إنشاء طلب الآن وأنشئ حسابي فقط
                              </FormLabel>
                              <FormDescription className="mt-1 text-gray-600">
                                يمكنك إضافة طلب لاحقاً من لوحة تحكمك
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!formData.skipOrder && (
                        <>
                          <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">اختر نوع الخدمة</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setFormData({ ...formData, serviceType: value });
                                  }} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="rounded-lg border-gray-300" data-testid="select-service-type">
                                      <SelectValue placeholder="اختر الخدمة المطلوبة" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {servicesList.map((service) => (
                                      <SelectItem key={service.id} value={service.id}>
                                        {service.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {formData.serviceType && (
                            <>
                              <FormField
                                control={form.control}
                                name="reviewsCount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">أدخل عدد التقييمات المطلوبة</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number"
                                        min="1"
                                        max="1000"
                                        placeholder="50" 
                                        className="rounded-lg border-gray-300 focus:border-gray-400" 
                                        data-testid="input-reviews-count"
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 0;
                                          field.onChange(value);
                                          setFormData({ ...formData, reviewsCount: value });
                                        }}
                                      />
                                    </FormControl>
                                    <FormDescription className="text-gray-600">
                                      أدخل عدد التقييمات التي تحتاجها (من 1 إلى 1000)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* عرض ملخص التكلفة */}
                              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
                                <h3 className="font-semibold text-gray-900">ملخص التكلفة</h3>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">نوع الخدمة:</span>
                                    <span className="font-medium text-gray-900">{selectedService?.name}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">عدد التقييمات:</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      {reviewsCount} تقييم
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">سعر التقييم الواحد:</span>
                                    <span className="font-medium text-gray-900">{pricePerReview} دولار</span>
                                  </div>
                                  
                                  <div className="h-px bg-gray-200 my-2"></div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">التكلفة الإجمالية:</span>
                                    <span className="font-bold text-lg text-gray-900">
                                      ${totalCost}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {formData.skipOrder && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center space-y-2">
                          <p className="font-medium text-green-900">سيتم إنشاء حسابك بدون طلب</p>
                          <p className="text-sm text-green-800">يمكنك إضافة طلب جديد من لوحة التحكم في أي وقت</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-gray-900">ملخص الحساب</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">الاسم:</span>
                            <span className="font-medium text-gray-900">{formData.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <span className="font-medium text-gray-900">{formData.email}</span>
                          </div>
                          
                          {!formData.skipOrder && (
                            <>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <h4 className="font-semibold text-gray-900">تفاصيل الطلب:</h4>
                              <div className="flex justify-between">
                                <span className="text-gray-600">الخدمة:</span>
                                <span className="font-medium text-gray-900">{selectedService?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">عدد التقييمات:</span>
                                <span className="font-medium text-gray-900">{reviewsCount} تقييم</span>
                              </div>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">التكلفة الإجمالية:</span>
                                <span className="font-bold text-gray-900">${totalCost}</span>
                              </div>
                            </>
                          )}
                          
                          {formData.skipOrder && (
                            <>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-green-800 font-medium">بدون طلب</p>
                                <p className="text-xs text-green-700">يمكنك إنشاء طلب لاحقاً</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-2 space-y-0 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-terms"
                                className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                                أتعهد بعدم طلب تقييمات غير حقيقية، وجميع التجارب ستكون فعلية داخل المنصة. أوافق على{" "}
                                <a href="#terms" className="text-gray-900 hover:underline">الشروط والأحكام</a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
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
                        رجوع
                      </Button>
                    )}
                    
                    <Button 
                      type="button"
                      onClick={handleNext}
                      disabled={createOwnerMutation.isPending}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                      data-testid="button-next"
                    >
                      {currentStep === 3 ? (
                        createOwnerMutation.isPending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"
                      ) : (
                        <>
                          التالي
                          <ArrowRight className="mr-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              هل لديك حساب بالفعل؟{" "}
              <a href="/login" className="text-gray-900 hover:underline font-medium">
                تسجيل الدخول
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}