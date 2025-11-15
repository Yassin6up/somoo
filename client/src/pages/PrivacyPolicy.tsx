import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Lock, Database, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 px-4" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">سياسة الخصوصية</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: المعلومات التي نجمعها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                1. المعلومات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-2">المعلومات الشخصية:</p>
                <ul className="space-y-2 mr-6 list-disc">
                  <li>الاسم الكامل</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>البلد والمنطقة الجغرافية</li>
                  <li>معلومات الدفع (يتم تخزينها بشكل آمن عبر بوابات الدفع المعتمدة)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">المعلومات التقنية:</p>
                <ul className="space-y-2 mr-6 list-disc">
                  <li>عنوان IP الخاص بك</li>
                  <li>نوع المتصفح ونظام التشغيل</li>
                  <li>سجلات النشاط على المنصة</li>
                  <li>ملفات تعريف الارتباط (Cookies)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: كيفية استخدام المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-green-600" />
                2. كيف نستخدم معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>تقديم خدماتنا وتحسينها</li>
                <li>معالجة المعاملات المالية</li>
                <li>التواصل معك بخصوص حسابك والخدمات</li>
                <li>تحسين تجربة المستخدم على المنصة</li>
                <li>منع الاحتيال وحماية أمان المنصة</li>
                <li>الامتثال للمتطلبات القانونية</li>
                <li>إرسال إشعارات مهمة حول المنصة</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: حماية البيانات */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Lock className="h-6 w-6" />
                3. حماية بياناتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                <p className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  إجراءات الأمان المتبعة:
                </p>
                <ul className="space-y-2 mr-6 list-disc text-blue-900 dark:text-blue-100">
                  <li>تشفير جميع البيانات الحساسة باستخدام SSL/TLS</li>
                  <li>استخدام بوابات دفع آمنة ومعتمدة</li>
                  <li>تخزين كلمات المرور بشكل مشفر (Hashed)</li>
                  <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                  <li>تحديثات أمنية منتظمة للأنظمة</li>
                  <li>الوصول المحدود للبيانات من قبل الموظفين المصرح لهم فقط</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: مشاركة المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                4. مشاركة معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نحن <strong>لا نبيع</strong> معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li><strong>مع مزودي الخدمات:</strong> مثل بوابات الدفع ومزودي الاستضافة</li>
                <li><strong>للامتثال القانوني:</strong> عند الطلب من الجهات الحكومية المختصة</li>
                <li><strong>لحماية الحقوق:</strong> لحماية حقوقنا وحقوق المستخدمين الآخرين</li>
                <li><strong>في حالة الاندماج:</strong> إذا تم الاستحواذ على الشركة أو دمجها مع شركة أخرى</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: ملفات تعريف الارتباط */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                5. ملفات تعريف الارتباط (Cookies)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li><strong>ملفات ضرورية:</strong> للحفاظ على تسجيل دخولك وتأمين جلساتك</li>
                <li><strong>ملفات تحليلية:</strong> لفهم كيفية استخدامك للمنصة</li>
                <li><strong>ملفات وظيفية:</strong> لتذكر تفضيلاتك وإعداداتك</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
              </p>
            </CardContent>
          </Card>

          {/* Section 6: حقوقك */}
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                6. حقوقك الخاصة بالبيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li><strong>الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية</li>
                <li><strong>التصحيح:</strong> يمكنك تحديث أو تصحيح معلوماتك</li>
                <li><strong>الحذف:</strong> يمكنك طلب حذف حسابك وبياناتك</li>
                <li><strong>الاعتراض:</strong> يمكنك الاعتراض على معالجة بياناتك لأغراض معينة</li>
                <li><strong>نقل البيانات:</strong> يمكنك طلب نقل بياناتك إلى خدمة أخرى</li>
                <li><strong>سحب الموافقة:</strong> يمكنك سحب موافقتك في أي وقت</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                للاستفادة من أي من هذه الحقوق، يرجى التواصل معنا عبر البريد الإلكتروني.
              </p>
            </CardContent>
          </Card>

          {/* Section 7: الاحتفاظ بالبيانات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                7. مدة الاحتفاظ بالبيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطًا أو حسب الحاجة لتقديم خدماتنا. عند حذف حسابك:
              </p>
              <ul className="space-y-2 mr-6 list-disc">
                <li>سيتم حذف بياناتك الشخصية خلال 30 يومًا</li>
                <li>قد نحتفظ ببعض البيانات للامتثال القانوني</li>
                <li>سيتم الاحتفاظ بسجلات المعاملات لأغراض محاسبية</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: خصوصية الأطفال */}
          <Card className="border-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
                8. خصوصية الأطفال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                منصة سُمُوّ غير مخصصة للأشخاص تحت سن 18 عامًا. نحن لا نجمع معلومات شخصية من الأطفال عن قصد. إذا اكتشفنا أن طفلاً قد قدم معلومات شخصية، سنتخذ خطوات لحذف هذه المعلومات فورًا.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: التعديلات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                9. التعديلات على سياسة الخصوصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. يُنصح بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تحديثات.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact Section */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-3">
              <p className="text-center font-semibold">
                لأي أسئلة أو استفسارات حول سياسة الخصوصية
              </p>
              <p className="text-center text-sm text-muted-foreground">
                يرجى التواصل معنا عبر البريد الإلكتروني أو من خلال نموذج الاتصال
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
