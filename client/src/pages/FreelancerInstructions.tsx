import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, Wallet, Pin, XCircle, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FreelancerInstructions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);

  const acceptInstructionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/freelancers/accept-instructions", {});
    },
    onSuccess: () => {
      toast({
        title: "تم التأكيد",
        description: "تم حفظ موافقتك على التعليمات بنجاح",
      });
      // Redirect to freelancer dashboard
      setLocation("/freelancer-dashboard");
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
        description: "يجب الموافقة على التعليمات للمتابعة",
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
              <AlertCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">تعليمات هامة لكل المستقلين داخل المنصة</CardTitle>
                <CardDescription>
                  يرجى قراءة التعليمات بعناية قبل البدء في العمل على المنصة
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Section 1: التقييمات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              1. التقييمات – Google Map و Google Play و App Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-bold text-destructive">يُمنع تمامًا:</p>
              </div>
              <p className="mt-2">تقييم أي خريطة Google Map أو تطبيق يحمل <strong>3.4 نجوم أو أقل</strong>.</p>
            </div>
            
            <ul className="space-y-2 mr-6 list-disc">
              <li>يجب عليك <strong>قراءة جميع المراجعات</strong> قبل تنفيذ أي تقييم، والتأكد من أن الشركة أو التطبيق ذو سمعة جيدة.</li>
              <li>لا تعمل أبدًا بعشوائية أو "بالخَش".</li>
              <li>لا تقم بتقييم أو رفع تقييم شركة سيئة السمعة أو لا تستحق ذلك.</li>
              <li className="flex items-start gap-2 text-destructive font-semibold">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>أي مخالفة قد تؤدي لإيقاف حسابك داخل المنصة.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: التفاعل مع السوشيال ميديا */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
              2. خدمة التفاعل مع منشورات السوشيال ميديا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">قبل قبول أي طلب تفاعل، قم بالبحث عن الشركة أولًا:</p>
            
            <ul className="space-y-2 mr-6 list-disc">
              <li>سمعتها</li>
              <li>نشاطها</li>
              <li>تقييم العملاء السابقين</li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                  إذا كانت الشركة سيئة السمعة أو يتعرض لها العملاء بشكاوى كثيرة، <strong>لا تقم بأي تفاعل معها</strong>.
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              <strong>الهدف:</strong> حماية المستقل والمنصة من التعامل مع جهات غير موثوقة.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Section 3: إخلاء المسؤولية */}
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-6 w-6" />
              إخلاء مسؤولية المنصة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              نؤكد نحن كمنصّة أن <strong>هدفنا الأساسي</strong> هو دعم الشركات ذات السمعة الجيدة فعليًا، وتقديم خدمات تساعدها على الظهور بشكل أفضل، وتعزيز مكانتها الحقيقية في السوق.
            </p>

            <div className="bg-muted rounded-lg p-4">
              <p className="font-semibold">
                نحن <strong>لا نسمح بأي شكل من الأشكال</strong> بالتعامل مع شركات أو تطبيقات سيئة السمعة أو تقدم خدمات سيئة للناس، ثم يتم تحسين صورتها من خلال التقييمات أو التفاعل غير العادل.
              </p>
            </div>

            <p className="font-bold text-lg mt-4">
              وحرصًا منّا على الأمانة والصدق أمام الله أولًا، وأمام المستخدمين ثانيًا:
            </p>

            <Card className="bg-primary/5 border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="font-bold text-primary">نحن كمنصّة نُبرئ ذمتنا أمام الله من:</p>
                </div>
                <ul className="space-y-2 mr-6 list-disc">
                  <li>أي تقييم يتم تنفيذه لصالح شركة سيئة السمعة أو غير مستحقة.</li>
                  <li>أي محاولة لرفع تقييم شركة تقدم خدمات ضعيفة أو مضرة للناس.</li>
                  <li>أي نشاط يقوم به المستقل دون التأكد من سمعة الجهة التي يتعامل معها.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-bold text-lg">هدف المنصة الحقيقي:</p>
              </div>
              <p className="mb-2">دعم الشركات الجيدة التي تقدم خدمة محترمة ولكن تعرضت لانخفاض تقييم بسبب:</p>
              <ul className="space-y-1 mr-6 list-disc text-sm">
                <li>منافسين مسيئين</li>
                <li>حملات تشويه</li>
                <li>سوء فهم من المستخدمين</li>
              </ul>
              <p className="mt-3">
                مساعدة هذه الشركات على <strong>إثبات مكانتها الحقيقية وجودة خدماتها</strong> أمام الجمهور.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: مسؤولية المستقل */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertCircle className="h-6 w-6" />
              مسؤولية المستقل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">قبل قبول أي طلب (تقييم – تفاعل – مراجعات):</p>
            
            <ul className="space-y-2 mr-6 list-disc">
              <li>يجب عليك <strong>البحث عن الشركة جيدًا</strong>.</li>
              <li><strong>التأكد</strong> من أنها جيدة وسمعتها محترمة.</li>
            </ul>

            <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-6 w-6 text-destructive" />
                <p className="font-bold text-destructive text-lg">
                  إذا كانت الشركة سيئة بالفعل أو لديها شكاوى حقيقية كثيرة...
                </p>
              </div>
              <p className="font-bold text-xl mt-2 text-destructive">
                يُمنع تمامًا العمل معها أو تحسين تقييمها.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: نظام احتجاز الأموال لضمان الجودة */}
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
              <ShieldAlert className="h-6 w-6" />
              نظام احتجاز الأموال لضمان الجودة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="font-bold text-blue-800 dark:text-blue-200">
                  فترة احتجاز الأرباح
                </p>
              </div>
              <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                يتم احتجاز الأموال في حسابك لمدة <strong>أسبوع واحد (7 أيام)</strong> بعد تنفيذ أي مهمة.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pin className="h-5 w-5 text-foreground" />
                <p className="font-semibold text-lg">الهدف من فترة الاحتجاز:</p>
              </div>
              <ul className="space-y-2 mr-6 list-disc">
                <li>التأكد من أن جميع التقييمات <strong>شرعية 100%</strong></li>
                <li>التحقق من أن المهام نُفذت بواسطة <strong>أعضاء الجروب الحقيقيين</strong></li>
                <li>حماية المنصة وأصحاب المنتجات من أي تلاعب</li>
                <li>ضمان جودة الخدمة المقدمة</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="font-bold text-green-800 dark:text-green-200">
                  بعد انقضاء المدة (أسبوع واحد):
                </p>
              </div>
              <p className="text-green-900 dark:text-green-100">
                يمكنك <strong>سحب الأرباح بالكامل</strong> من محفظتك إلى حسابك البنكي أو المحفظة الإلكترونية.
              </p>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground text-sm mt-3">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>هذا النظام يحمي كل من المستقلين وأصحاب المنتجات ويضمن شفافية العمليات على المنصة.</p>
            </div>
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
                data-testid="checkbox-agree-instructions"
              />
              <Label
                htmlFor="agree"
                className="text-base font-semibold cursor-pointer leading-relaxed"
              >
                أوافق على جميع التعليمات المذكورة أعلاه، وأتعهد بالالتزام بها بشكل كامل. وأدرك أن مخالفة هذه التعليمات قد تؤدي إلى إيقاف حسابي على المنصة.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
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
