import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, CheckCircle2 } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-role-title">
              اختر نوع حسابك
            </h1>
            <p className="text-lg text-muted-foreground">
              هل أنت مستقل تبحث عن فرص أم صاحب منتج تحتاج لاختباره؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Freelancer Card */}
            <Card className="rounded-2xl shadow-lg hover-elevate hover:shadow-xl transition-all group" data-testid="card-freelancer">
              <CardContent className="p-8 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">مستقل محترف</h2>
                  <p className="text-muted-foreground">
                    انضم كمختبر وابدأ في كسب الدخل
                  </p>
                </div>

                <ul className="space-y-3">
                  {[
                    "اختبر تطبيقات ومواقع حقيقية",
                    "اكتب تقييمات صادقة ومدفوعة",
                    "اكسب دخل إضافي بمرونة",
                    "طور مهاراتك في الاختبار"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/freelancer-signup">
                  <Button className="w-full rounded-2xl shadow-md" size="lg" data-testid="button-freelancer">
                    <Users className="ml-2 h-5 w-5" />
                    إنشاء حساب مستقل
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Product Owner Card */}
            <Card className="rounded-2xl shadow-lg hover-elevate hover:shadow-xl transition-all group" data-testid="card-owner">
              <CardContent className="p-8 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Briefcase className="h-10 w-10 text-primary" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">صاحب منتج رقمي</h2>
                  <p className="text-muted-foreground">
                    احصل على اختبارات وتقييمات احترافية
                  </p>
                </div>

                <ul className="space-y-3">
                  {[
                    "اختبر أداء منتجك بشكل احترافي",
                    "احصل على تقييمات حقيقية ومثبتة",
                    "حلّل تفاعل المستخدمين بذكاء",
                    "زد انتشارك على السوشيال ميديا"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/product-owner-signup">
                  <Button className="w-full rounded-2xl shadow-md" size="lg" data-testid="button-owner">
                    <Briefcase className="ml-2 h-5 w-5" />
                    إنشاء حساب صاحب منتج
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
