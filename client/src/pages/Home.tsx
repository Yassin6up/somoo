import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, FileCheck, BarChart3, Users, Smartphone, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
              <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                اختبر منتجك الرقمي
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                مع فريق محترف من المستقلين
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-description">
              منصة سُمُوّ تربط أصحاب المنتجات الرقمية بمختبرين محترفين لاختبار التطبيقات، المواقع، والأنظمة - مع تقييمات حقيقية وتفاعل على السوشيال ميديا لزيادة انتشارك
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/role-selection">
                <Button size="lg" className="w-full sm:w-auto rounded-2xl shadow-lg text-base px-8" data-testid="button-freelancer-signup">
                  <Users className="ml-2 h-5 w-5" />
                  أنشئ حساب مستقل
                </Button>
              </Link>
              <Link href="/role-selection">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl shadow-lg text-base px-8" data-testid="button-owner-signup">
                  <Smartphone className="ml-2 h-5 w-5" />
                  أنشئ حساب صاحب منتج
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">
              كيف تعمل المنصة
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ثلاث خطوات بسيطة للحصول على تقييمات واختبارات احترافية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="rounded-2xl shadow-md hover-elevate transition-all" data-testid="card-step-1">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">1. أنشئ حسابك</h3>
                <p className="text-muted-foreground">
                  سجّل كمستقل أو صاحب منتج في دقائق معدودة
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="rounded-2xl shadow-md hover-elevate transition-all" data-testid="card-step-2">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">2. اختر نوع الخدمة</h3>
                <p className="text-muted-foreground">
                  اختبار تطبيقات، تقييمات Google Maps، أو تفاعل السوشيال ميديا
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="rounded-2xl shadow-md hover-elevate transition-all" data-testid="card-step-3">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">3. استلم النتائج</h3>
                <p className="text-muted-foreground">
                  احصل على تقارير ذكية مفصلة وتحليلات شاملة
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-services-title">
              خدماتنا
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              حلول متكاملة لتحسين منتجك الرقمي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "اختبار التطبيقات",
                description: "اختبار شامل للتطبيقات على iOS وAndroid مع تقارير مفصلة"
              },
              {
                icon: FileCheck,
                title: "تقييمات Google Maps",
                description: "تقييمات حقيقية على خرائط Google بعد تجربة فعلية مثبتة"
              },
              {
                icon: TrendingUp,
                title: "تفاعل السوشيال ميديا",
                description: "زيادة التفاعل على منشوراتك لتعزيز الانتشار"
              },
              {
                icon: BarChart3,
                title: "تحليل UX/UI",
                description: "تحليل تجربة المستخدم مع توصيات للتحسين"
              },
              {
                icon: Users,
                title: "اختبار المواقع",
                description: "فحص شامل للمواقع الإلكترونية والتأكد من جودتها"
              },
              {
                icon: FileCheck,
                title: "اختبار الأنظمة",
                description: "اختبار أنظمة السوفت وير وتقييم أدائها"
              }
            ].map((service, index) => (
              <Card key={index} className="rounded-2xl shadow-md hover-elevate transition-all" data-testid={`card-service-${index}`}>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold" data-testid="text-cta-title">
            ابدأ رحلتك مع سُمُوّ اليوم
          </h2>
          <p className="text-lg text-muted-foreground">
            انضم إلى مئات المستقلين وأصحاب المنتجات الذين يثقون بنا
          </p>
          <Link href="/role-selection">
            <Button size="lg" className="rounded-2xl shadow-lg text-base px-8" data-testid="button-cta">
              ابدأ الآن مجانًا
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
