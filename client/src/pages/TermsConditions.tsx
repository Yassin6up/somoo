import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 px-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">الشروط والأحكام</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة سُمُوّ
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: القبول والموافقة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                1. القبول والموافقة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                باستخدامك لمنصة سُمُوّ، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>يجب أن تكون بعمر 18 عامًا على الأقل لاستخدام المنصة</li>
                <li>يجب تقديم معلومات دقيقة وصحيحة عند التسجيل</li>
                <li>أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 2: استخدام المنصة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                2. استخدام المنصة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold">يُسمح باستخدام المنصة لـ:</p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>تحسين تقييمات المنتجات والخدمات ذات الجودة الحقيقية</li>
                <li>اختبار تجربة المستخدم للمنتجات الرقمية</li>
                <li>الحصول على تفاعل حقيقي على منصات التواصل الاجتماعي</li>
                <li>تقديم خدمات مراجعة احترافية للتطبيقات والمواقع</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: الممنوعات */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-6 w-6" />
                3. الممنوعات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="font-bold text-destructive mb-2">يُمنع تمامًا:</p>
                <ul className="space-y-2 mr-6 list-disc text-destructive">
                  <li>تحسين تقييم منتجات أو خدمات سيئة أو مضللة</li>
                  <li>نشر محتوى كاذب أو مضلل</li>
                  <li>انتحال شخصية الآخرين أو استخدام حسابات وهمية</li>
                  <li>التلاعب بالنظام أو محاولة اختراق المنصة</li>
                  <li>استخدام المنصة لأغراض غير قانونية</li>
                  <li>إساءة استخدام بيانات المستخدمين الآخرين</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: حقوق الملكية الفكرية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                4. حقوق الملكية الفكرية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                جميع الحقوق الخاصة بالمحتوى والتصميم والشعارات والعلامات التجارية على منصة سُمُوّ محفوظة. لا يجوز نسخ أو توزيع أو تعديل أي محتوى من المنصة دون إذن كتابي مسبق.
              </p>
            </CardContent>
          </Card>

          {/* Section 5: المسؤولية */}
          <Card className="border-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
                5. إخلاء المسؤولية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                منصة سُمُوّ هي وسيط بين المستقلين وأصحاب المنتجات. نحن غير مسؤولين عن:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>جودة الخدمات المقدمة من قبل المستقلين</li>
                <li>صحة المعلومات المقدمة من قبل أصحاب المنتجات</li>
                <li>أي نزاعات بين المستقلين وأصحاب المنتجات</li>
                <li>أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                المستخدم يتحمل المسؤولية الكاملة عن أفعاله واستخدامه للمنصة.
              </p>
            </CardContent>
          </Card>

          {/* Section 6: الدفع والمعاملات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                6. الدفع والمعاملات المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 mr-6 list-disc">
                <li>يتم احتجاز أرباح المستقلين لمدة 7 أيام لضمان جودة الخدمة</li>
                <li>نوفر ضمان استرداد كامل المبلغ إذا تم حذف التقييمات خلال 7 أيام</li>
                <li>جميع الأسعار مذكورة بالدولار الأمريكي ما لم يُذكر خلاف ذلك</li>
                <li>نحن نستخدم بوابات دفع آمنة لحماية معلوماتك المالية</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: إنهاء الحساب */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-6 w-6" />
                7. إنهاء وإيقاف الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نحتفظ بالحق في إيقاف أو إنهاء أي حساب في الحالات التالية:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>مخالفة أي من الشروط والأحكام</li>
                <li>استخدام المنصة لأغراض غير قانونية أو غير أخلاقية</li>
                <li>محاولة التلاعب بالنظام أو الاحتيال</li>
                <li>تقديم معلومات كاذبة أو مضللة</li>
                <li>إساءة استخدام المنصة بأي شكل من الأشكال</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: التعديلات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                8. التعديلات على الشروط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: القانون الساري */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                9. القانون الساري وحل النزاعات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                تخضع هذه الشروط والأحكام للقوانين المعمول بها في الدولة التي تعمل منها المنصة. في حالة نشوء أي نزاع، يتم حله عن طريق التفاوض الودي أولاً، وإذا تعذر ذلك، يتم اللجوء إلى المحاكم المختصة.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Section */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                لأي استفسارات حول الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
