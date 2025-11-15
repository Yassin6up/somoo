import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, CheckCircle2, Clock, AlertTriangle, XCircle, Shield } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 px-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">سياسة استرداد الأموال</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    نحن ملتزمون بتقديم خدمة عالية الجودة مع ضمان حقوقك المالية
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: ضمان 7 أيام */}
          <Card className="border-green-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                1. ضمان استرداد الأموال لمدة 7 أيام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 rounded-lg p-4">
                <p className="font-bold text-green-800 dark:text-green-200 mb-3">
                  نوفر ضمان استرداد كامل المبلغ في الحالات التالية:
                </p>
                <ul className="space-y-2 mr-6 list-disc text-green-900 dark:text-green-100">
                  <li>
                    <strong>حذف التقييمات:</strong> إذا تم حذف التقييمات من قبل منصات مثل Google، App Store، أو Play Store خلال 7 أيام من تنفيذها
                  </li>
                  <li>
                    <strong>عدم التنفيذ:</strong> إذا لم يتم تنفيذ الخدمة المتفق عليها خلال المدة المحددة
                  </li>
                  <li>
                    <strong>خدمة غير مطابقة:</strong> إذا كانت الخدمة المقدمة لا تطابق المواصفات المتفق عليها
                  </li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                يتم معالجة طلبات الاسترداد خلال 3-5 أيام عمل من تاريخ التحقق من الطلب.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: نظام احتجاز الأموال للمستقلين */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Clock className="h-6 w-6" />
                2. نظام احتجاز الأموال (7 أيام)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed">
                لضمان جودة الخدمات وحماية أصحاب المنتجات، يتم احتجاز أرباح المستقلين لمدة <strong>7 أيام</strong> بعد إتمام المهمة:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>التأكد من أن التقييمات لا تزال موجودة ولم يتم حذفها</li>
                <li>التحقق من أن الخدمة تمت بشكل صحيح وفقًا للمواصفات</li>
                <li>منح فترة كافية لأصحاب المنتجات للتحقق من الجودة</li>
                <li>حماية المنصة والمستخدمين من التلاعب أو الاحتيال</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mt-3">
                <p className="text-blue-900 dark:text-blue-100">
                  بعد انقضاء فترة الـ 7 أيام، يمكن للمستقلين سحب أرباحهم بالكامل إلى حساباتهم البنكية أو محافظهم الإلكترونية.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: طلبات الاسترداد المؤهلة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                3. الحالات المؤهلة لاسترداد الأموال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold">يمكنك طلب استرداد الأموال في الحالات التالية:</p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>حذف التقييمات خلال 7 أيام من التنفيذ</li>
                <li>عدم تنفيذ المهام في الوقت المحدد (تأخير أكثر من 48 ساعة)</li>
                <li>تقديم خدمة منخفضة الجودة أو غير احترافية</li>
                <li>مخالفة المستقل للمواصفات المتفق عليها</li>
                <li>مشاكل تقنية في المنصة منعت إتمام الخدمة</li>
                <li>إلغاء الطلب قبل بدء التنفيذ</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4: الحالات غير المؤهلة */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-6 w-6" />
                4. الحالات غير المؤهلة لاسترداد الأموال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="font-bold text-destructive mb-2">لا يمكن استرداد الأموال في الحالات التالية:</p>
                <ul className="space-y-2 mr-6 list-disc text-destructive">
                  <li>بعد مرور 7 أيام من تنفيذ الخدمة بنجاح</li>
                  <li>إذا كانت المشكلة ناتجة عن معلومات خاطئة قدمها صاحب المنتج</li>
                  <li>عدم الرضا عن النتائج دون سبب موضوعي</li>
                  <li>تغيير رأيك بعد بدء تنفيذ المهمة</li>
                  <li>إذا كان المنتج أو الخدمة سيئة بالفعل (تقييم أقل من 3.4 نجوم)</li>
                  <li>استخدام الخدمة لأغراض غير قانونية أو غير أخلاقية</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: كيفية طلب الاسترداد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                5. كيفية طلب استرداد الأموال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold">اتبع الخطوات التالية لطلب استرداد أموالك:</p>
              <ol className="space-y-3 mr-6 list-decimal">
                <li>
                  <strong>تسجيل الدخول إلى حسابك</strong>
                  <p className="text-sm text-muted-foreground">قم بتسجيل الدخول إلى لوحة التحكم الخاصة بك</p>
                </li>
                <li>
                  <strong>الانتقال إلى الطلبات</strong>
                  <p className="text-sm text-muted-foreground">ابحث عن الطلب الذي تريد استرداد المال له</p>
                </li>
                <li>
                  <strong>طلب الاسترداد</strong>
                  <p className="text-sm text-muted-foreground">انقر على زر "طلب استرداد الأموال" وحدد السبب</p>
                </li>
                <li>
                  <strong>تقديم الدليل</strong>
                  <p className="text-sm text-muted-foreground">أرفق لقطات شاشة أو أي دليل يدعم طلبك</p>
                </li>
                <li>
                  <strong>انتظار المراجعة</strong>
                  <p className="text-sm text-muted-foreground">سيتم مراجعة طلبك خلال 24-48 ساعة</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Section 6: مدة معالجة الاسترداد */}
          <Card className="border-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
                6. مدة معالجة طلبات الاسترداد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 mr-6 list-disc">
                <li>
                  <strong>المراجعة:</strong> 24-48 ساعة من تقديم الطلب
                </li>
                <li>
                  <strong>الموافقة:</strong> يتم إخطارك بالقرار عبر البريد الإلكتروني
                </li>
                <li>
                  <strong>الاسترداد إلى المحفظة:</strong> فوري بعد الموافقة
                </li>
                <li>
                  <strong>الاسترداد إلى البطاقة/البنك:</strong> 5-7 أيام عمل
                </li>
                <li>
                  <strong>الاسترداد إلى المحافظ الإلكترونية:</strong> 1-3 أيام عمل
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: طرق الاسترداد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-green-600" />
                7. طرق استرداد الأموال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                يتم استرداد الأموال بنفس طريقة الدفع الأصلية:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li><strong>المحفظة داخل المنصة:</strong> استرداد فوري</li>
                <li><strong>فودافون كاش / اتصالات كاش / أورنج كاش:</strong> 1-3 أيام</li>
                <li><strong>بطاقة ائتمان / خصم:</strong> 5-7 أيام عمل</li>
                <li><strong>حوالة بنكية:</strong> 3-5 أيام عمل</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: الحماية والضمان */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Shield className="h-6 w-6" />
                8. حمايتك مضمونة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نحن نضمن لك:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>معالجة عادلة وشفافة لجميع طلبات الاسترداد</li>
                <li>حماية معلوماتك المالية والشخصية</li>
                <li>استرداد فوري في الحالات الواضحة</li>
                <li>دعم فني متواصل للمساعدة في عملية الاسترداد</li>
                <li>عدم فرض أي رسوم على عمليات الاسترداد</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 9: النزاعات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                9. حل النزاعات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                في حالة رفض طلب الاسترداد:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>يمكنك تقديم اعتراض مع أدلة إضافية</li>
                <li>سيتم مراجعة الطلب من قبل فريق مختص</li>
                <li>يمكنك التواصل مع فريق الدعم لحل ودي</li>
                <li>في حالة عدم الوصول لحل، يمكن اللجوء للتحكيم</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Section */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-3">
              <p className="text-center font-semibold">
                لأي استفسارات حول سياسة استرداد الأموال
              </p>
              <p className="text-center text-sm text-muted-foreground">
                يرجى التواصل مع فريق الدعم عبر البريد الإلكتروني أو من خلال لوحة التحكم
              </p>
              <p className="text-center text-sm text-muted-foreground mt-4">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
