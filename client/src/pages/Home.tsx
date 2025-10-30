import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  FileCheck, 
  BarChart3, 
  Users, 
  Smartphone, 
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Target,
  Award,
  Clock,
  Globe,
  MessageSquare
} from "lucide-react";

export default function Home() {
  const stats = [
    { icon: Users, value: "500+", label: "مستخدم نشط", color: "text-blue-500" },
    { icon: CheckCircle2, value: "1,200+", label: "مهمة مكتملة", color: "text-green-500" },
    { icon: Smartphone, value: "300+", label: "منتج مختبر", color: "text-purple-500" },
    { icon: Star, value: "95%", label: "تقييم إيجابي", color: "text-amber-500" },
  ];

  const features = [
    {
      icon: Shield,
      title: "أمان وموثوقية",
      description: "نظام حماية متقدم لبياناتك ومعاملاتك المالية",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Zap,
      title: "سرعة في الإنجاز",
      description: "احصل على النتائج في وقت قياسي",
      color: "bg-amber-500/10 text-amber-500"
    },
    {
      icon: Target,
      title: "دقة عالية في التقييم",
      description: "تقييمات دقيقة من مختصين محترفين",
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: Award,
      title: "جودة مضمونة",
      description: "ضمان الجودة مع إمكانية إعادة الاختبار",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: Clock,
      title: "دعم على مدار الساعة",
      description: "فريق دعم متواجد 24/7 لمساعدتك",
      color: "bg-rose-500/10 text-rose-500"
    },
    {
      icon: Globe,
      title: "تغطية واسعة",
      description: "مختبرون من مختلف الدول والمناطق",
      color: "bg-cyan-500/10 text-cyan-500"
    }
  ];

  const services = [
    {
      icon: Smartphone,
      title: "اختبار التطبيقات",
      description: "اختبار شامل للتطبيقات على iOS وAndroid مع تقارير مفصلة",
      color: "bg-blue-500"
    },
    {
      icon: FileCheck,
      title: "تقييمات Google Maps",
      description: "تقييمات حقيقية على خرائط Google بعد تجربة فعلية",
      color: "bg-red-500"
    },
    {
      icon: TrendingUp,
      title: "تفاعل السوشيال ميديا",
      description: "زيادة التفاعل على منشوراتك لتعزيز الانتشار",
      color: "bg-pink-500"
    },
    {
      icon: BarChart3,
      title: "تحليل UX/UI",
      description: "تحليل تجربة المستخدم مع توصيات للتحسين",
      color: "bg-purple-500"
    },
    {
      icon: Globe,
      title: "اختبار المواقع",
      description: "فحص شامل للمواقع الإلكترونية والتأكد من جودتها",
      color: "bg-green-500"
    },
    {
      icon: MessageSquare,
      title: "تقييمات المستخدمين",
      description: "آراء وتقييمات حقيقية من مستخدمين فعليين",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Inspired by the image */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <div className="space-y-8 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">المنصة الأولى في المنطقة</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                <span className="block mb-2">
                  اختبر تطبيقك، حسّن
                </span>
                <span className="block mb-2">
                  تقييماتك، واجعل
                </span>
                <span className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  منتجك ينمو مع
                </span>
                <br />
                <span className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  مستخدمين حقيقيين
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0" data-testid="text-hero-description">
                نربط بين أصحاب المنتجات الرقمية والمتخصصين في{" "}
                <span className="text-primary font-semibold">Test & Grow</span> و
                <span className="text-primary font-semibold">المنصات الرقمية</span>{" "}
                المتخصصين في الاختبار والتقييم
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/role-selection">
                  <Button size="lg" className="w-full sm:w-auto rounded-2xl shadow-lg text-base px-8 hover-elevate" data-testid="button-start-now">
                    <Sparkles className="ml-2 h-5 w-5" />
                    أنشئ حسابك الآن
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto rounded-2xl shadow-md text-base px-8 hover-elevate" 
                  data-testid="button-learn-more"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <BarChart3 className="ml-2 h-5 w-5" />
                  تعرف على المزيد
                </Button>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">تقييمات حقيقية من مستخدمين متخصصين</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">دعم فوري، متواصل على مدار الساعة</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">سرعة في إنجاز المهام</span>
                </div>
              </div>
            </div>

            {/* Right Side - Stats Dashboard Card */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              
              <Card className="rounded-3xl shadow-2xl border-2 relative overflow-hidden hover-elevate" data-testid="card-stats">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">لوحة التحكم</h3>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-3">
                      <Star className="h-3 w-3 ml-1 fill-current" />
                      نشط
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div 
                        key={index} 
                        className="bg-muted/30 rounded-2xl p-4 hover-elevate active-elevate-2 transition-all group"
                        data-testid={`stat-${index}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-xl bg-background shadow-sm ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">تقدم الشهر</span>
                      <span className="text-sm text-primary font-bold">75%</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 py-1">
              <Sparkles className="h-3 w-3 ml-1" />
              لماذا سُمُوّ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-features-title">
              مميزات تجعلنا الخيار الأمثل
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نقدم لك تجربة متكاملة لاختبار وتحسين منتجك الرقمي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="rounded-2xl shadow-md hover-elevate active-elevate-2 transition-all group border-2 hover:border-primary/20" 
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.color} transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 py-1">
              <FileCheck className="h-3 w-3 ml-1" />
              خدماتنا
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-services-title">
              حلول متكاملة لنمو منتجك
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر مجموعة شاملة من الخدمات لتحسين منتجك الرقمي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="rounded-2xl shadow-md hover-elevate active-elevate-2 transition-all group overflow-hidden" 
                data-testid={`card-service-${index}`}
              >
                <div className={`h-2 ${service.color}`}></div>
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">انضم الآن</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold" data-testid="text-cta-title">
            ابدأ رحلتك مع سُمُوّ اليوم
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم إلى مئات المستقلين وأصحاب المنتجات الذين يثقون بنا لتطوير منتجاتهم الرقمية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/role-selection">
              <Button size="lg" className="rounded-2xl shadow-lg text-base px-8 hover-elevate" data-testid="button-cta">
                <UserPlus className="ml-2 h-5 w-5" />
                ابدأ الآن مجانًا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
