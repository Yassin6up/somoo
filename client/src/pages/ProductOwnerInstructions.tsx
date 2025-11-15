import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShieldAlert, AlertCircle, ArrowRight, Lightbulb, AlertTriangle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProductOwnerInstructions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);

  const acceptInstructionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/product-owners/accept-instructions", {});
    },
    onSuccess: () => {
      toast({
        title: "تم التأكيد",
        description: "تم حفظ موافقتك على الشروط والأحكام بنجاح",
      });
      // Redirect to product owner dashboard
      setLocation("/product-owner-dashboard");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الموافقة",
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (!agreed) {
      toast({
        title: "تنبيه",
        description: "يجب الموافقة على الشروط والأحكام للمتابعة",
        variant: "destructive",
      });
      return;
    }
    acceptInstructionsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">تعليمات هامة للشركات المتعاملة مع المنصة</CardTitle>
                <CardDescription>
                  نرحّب بجميع الشركات التي ترغب في الاستفادة من خدمات المستقلين داخل منصّتنا، ولكن لضمان الشفافية وحماية الجميع، يجب الالتزام بالتعليمات التالية
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Section 1: الالتزام بالشفافية والسمعة الجيدة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              1. الالتزام بالشفافية والسمعة الجيدة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 mr-6 list-disc">
              <li>يجب أن تكون شركتك <strong>ذات سمعة جيدة</strong> في السوق.</li>
              <li>إذا كانت لديك مشاكل حقيقية في الخدمة أو شكاوى كثيرة من العملاء، يرجى <strong>إصلاحها أولًا</strong> قبل طلب تقييمات أو تفاعل.</li>
              <li className="text-destructive font-semibold">
                المنصّة لا تسمح لأي جهة سيئة السمعة باستخدام خدمات المستقلين لتحسين صورة غير حقيقية.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: عدم تقديم معلومات مضللة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
              2. عدم تقديم معلومات مضللة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 mr-6 list-disc">
              <li><strong>يُمنع تقديم</strong> أي معلومات غير صحيحة أو مضللة للمستقلين.</li>
              <li className="text-destructive font-semibold">
                أي محاولة لتزييف الحقائق أو إخفاء شكاوى العملاء ستؤدي إلى <strong>إيقاف حساب الشركة على الفور</strong>.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3: قبول النقد البنّاء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-amber-500" />
              3. قبول النقد البنّاء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 mr-6 list-disc">
              <li>إذا قام المستقل بقراءة المراجعات ووجد أن هناك مشاكل واضحة، <strong>يحق له رفض الطلب</strong>.</li>
              <li>هذا الرفض <strong>لا يُعتبر إساءة</strong> بل جزء من سياسات المنصة للحفاظ على المصداقية.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: السماح للمستقل بالتحقق من الشركة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-purple-500" />
              4. السماح للمستقل بالتحقق من الشركة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">على الشركة أن تتفهّم أن المستقل سيقوم بـ:</p>
            <ul className="space-y-2 mr-6 list-disc">
              <li>مراجعة التقييمات</li>
              <li>الاطلاع على الشكاوى</li>
              <li>البحث عن اسم الشركة</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mt-4">
              <p className="font-semibold text-blue-800 dark:text-blue-200">
                هذا <strong>إجراء أساسي وضروري</strong> لحماية الطرفين.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: استخدام المنصة للجهات التي تستحق تحسين السمعة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              5. استخدام المنصة للجهات التي تستحق تحسين السمعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-bold text-lg">المنصة مخصصة لـ:</p>
              </div>
              <ul className="space-y-1 mr-6 list-disc text-sm">
                <li>شركات خدمية جيدة لديها بعض المشاكل البسيطة.</li>
                <li>شركات تضررت من هجمات منافسين أو تقييمات غير عادلة.</li>
                <li>تطبيقات أو متاجر لديها جودة جيدة لكن تقييمها لا يعكس الحقيقة.</li>
              </ul>
            </div>

            <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-bold text-destructive">وليست مخصصة لـ:</p>
              </div>
              <ul className="space-y-1 mr-6 list-disc text-sm text-destructive">
                <li>شركات سيئة فعليًا</li>
                <li>شركات تستغل العملاء</li>
                <li>شركات تقدم خدمات مضرة أو تضليلية</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: احترام المستقل وعدم إجباره على مهام غير شرعية */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertCircle className="h-6 w-6" />
              6. احترام المستقل وعدم إجباره على مهام غير شرعية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 mr-6 list-disc">
              <li><strong>لا يجوز مطالبة المستقل</strong> بعمل مخالف للسياسات أو للأمانة المهنية.</li>
              <li className="text-destructive font-bold">
                أي محاولة للضغط على المستقل أو طلب رفع تقييمات لشركة سيئة ستؤدي لإيقاف حساب الشركة نهائيًا.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7: هدف المنصة */}
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <CheckCircle2 className="h-6 w-6" />
              7. هدف المنصة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              هدفنا هو <strong>تحسين سمعة الشركات التي تستحق فعلًا</strong>، ومساعدتها على الظهور بالشكل الصحيح، 
              وليس <span className="text-destructive font-bold">"تلميع"</span> شركات غير جيدة أو مضللة.
            </p>
          </CardContent>
        </Card>

        {/* Section 8: آلية العمل وضمان التقييمات */}
        <Card className="border-green-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
              <ShieldAlert className="h-6 w-6" />
              8. آلية العمل لضمان تقييمات حقيقية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="font-bold text-green-800 dark:text-green-200 text-lg">
                  نوفر ضمان لمدة أسبوع
                </p>
              </div>
              <p className="text-green-900 dark:text-green-100">
                إذا تم مسح التقييمات خلال أسبوع من تنفيذها، <strong>يتم استرداد كامل المبلغ إلى حسابك تلقائيًا</strong>.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="font-bold text-amber-800 dark:text-amber-200">
                  نصيحتنا لك لضمان بقاء التقييمات:
                </p>
              </div>
              <ul className="space-y-2 mr-6 list-disc text-amber-900 dark:text-amber-100">
                <li className="font-semibold">
                  اختر مستقلين من <strong>نفس بلدك</strong>
                </li>
                <li>
                  <strong>مثال:</strong> إذا كنت في مصر، اختر مستقلين من مصر لتقييم مطعمك أو شركتك
                </li>
                <li>
                  <strong>مثال:</strong> إذا كنت في السعودية، اختر مستقلين من السعودية
                </li>
                <li className="flex items-start gap-2 text-amber-800 dark:text-amber-200 font-bold mt-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>هذا يقلل بشكل كبير من احتمالية مسح التقييمات من قبل المنصات (Google, App Store, إلخ)</span>
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground text-sm mt-4">
              التقييمات من نفس المنطقة الجغرافية تبدو أكثر طبيعية ومصداقية للخوارزميات الآلية.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Consent Checkbox */}
        <Card className="border-primary border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                data-testid="checkbox-agree-terms"
              />
              <Label
                htmlFor="agree"
                className="text-base font-semibold cursor-pointer leading-relaxed"
              >
                أتعهد بعدم طلب تقييمات غير حقيقية، وجميع التجارب ستكون فعلية داخل المنصة. أوافق على جميع الشروط والأحكام المذكورة أعلاه، وأتعهد بالالتزام بها بشكل كامل. وأدرك أن مخالفة هذه التعليمات قد تؤدي إلى إيقاف حساب الشركة على المنصة.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center gap-4 pb-8">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!agreed || acceptInstructionsMutation.isPending}
            className="px-8"
            data-testid="button-continue-to-dashboard"
          >
            {acceptInstructionsMutation.isPending ? "جاري الحفظ..." : "موافق - التالي"}
            <ArrowRight className="mr-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
