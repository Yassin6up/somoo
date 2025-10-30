import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
  MessageSquare,
  MapPin,
  Apple
} from "lucide-react";

export default function Home() {
  const reviewServices = [
    { 
      icon: MapPin, 
      title: "تقييمات خرائط جوجل",
      subtitle: "Google Maps Reviews", 
      value: "1,200+", 
      label: "تقييم تم", 
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      gradient: "from-red-500 to-red-600"
    },
    { 
      icon: Smartphone, 
      title: "تقييمات تطبيقات Android",
      subtitle: "Android App Reviews", 
      value: "850+", 
      label: "تقييم تم", 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500 to-green-600"
    },
    { 
      icon: Apple, 
      title: "تقييمات تطبيقات iOS",
      subtitle: "iOS App Reviews", 
      value: "620+", 
      label: "تقييم تم", 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-blue-600"
    },
  ];


  const services = [
    {
      icon: Smartphone,
      title: "اختبار التطبيقات",
      description: "اختبار شامل للتطبيقات على iOS وAndroid مع تقارير مفصلة عن الأخطاء والأداء",
      color: "bg-blue-500",
      featured: false
    },
    {
      icon: FileCheck,
      title: "تقييمات Google Maps",
      description: "تقييمات حقيقية على خرائط Google بعد تجربة فعلية لتحسين ترتيبك المحلي",
      color: "bg-red-500",
      featured: false
    },
    {
      icon: TrendingUp,
      title: "التفاعل مع السوشيال ميديا",
      description: "زيادة التفاعل والانتشار على منشوراتك من خلال إعجابات وتعليقات ومشاركات حقيقية",
      color: "bg-pink-500",
      featured: true
    },
    {
      icon: BarChart3,
      title: "تحليل UX/UI",
      description: "تحليل احترافي لتجربة المستخدم مع توصيات عملية لتحسين التصميم والتحويل",
      color: "bg-purple-500",
      featured: false
    },
    {
      icon: Globe,
      title: "اختبار المواقع",
      description: "فحص شامل للمواقع الإلكترونية يشمل الأداء، الأمان، والتوافق",
      color: "bg-green-500",
      featured: false
    },
    {
      icon: MessageSquare,
      title: "تقييمات المستخدمين",
      description: "آراء وتقييمات صادقة من مستخدمين فعليين على متاجر التطبيقات",
      color: "bg-orange-500",
      featured: false
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

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-testid="text-hero-title">
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
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
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

            {/* Right Side - Review Services Card */}
            <div className="relative" style={{ perspective: '1000px' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -10, 0],
                  rotateX: 0
                }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  rotateX: { duration: 0.5 },
                  y: { 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
                whileHover={{
                  rotateY: 5,
                  rotateX: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <Card className="rounded-3xl shadow-2xl border-2 relative overflow-visible hover-elevate backdrop-blur-sm bg-card/95 max-w-md mx-auto" data-testid="card-review-services" style={{ transform: 'translateZ(50px)' }}>
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">خدماتنا المميزة</h3>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-3 shadow-sm">
                        <Sparkles className="h-3 w-3 ml-1" />
                        احترافي
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {reviewServices.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-background to-muted/30 rounded-2xl p-5 hover-elevate active-elevate-2 transition-all group border border-border/50 shadow-sm"
                          data-testid={`service-${index}`}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              animate={{ 
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                              }}
                              className={`p-3 rounded-xl ${service.bgColor} shadow-lg`}
                            >
                              <service.icon className={`h-6 w-6 ${service.color}`} />
                            </motion.div>
                            
                            <div className="flex-1 space-y-1">
                              <h4 className="text-base font-bold text-foreground">{service.title}</h4>
                              <p className="text-xs text-muted-foreground font-medium">{service.subtitle}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className={`text-xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                                  {service.value}
                                </div>
                                <span className="text-xs text-muted-foreground">{service.label}</span>
                              </div>
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              className={`p-2 rounded-full ${service.bgColor}`}
                            >
                              <Star className={`h-4 w-4 ${service.color} fill-current`} />
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground mb-1">جاهز للبدء؟</p>
                          <p className="text-xs text-muted-foreground">انضم لأكثر من 500+ عميل راضٍ</p>
                        </div>
                        <Link href="/role-selection">
                          <Button size="sm" className="rounded-xl shadow-md hover-elevate">
                            <UserPlus className="h-4 w-4 ml-2" />
                            ابدأ الآن
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform - SEO Content */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 py-1">
              <Sparkles className="h-3 w-3 ml-1" />
              عن المنصة
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" data-testid="text-about-title">
              منصة سُمُوّ - الحل الأمثل لاختبار وتطوير المنتجات الرقمية
            </h2>
          </div>

          <div className="prose prose-lg max-w-none text-right space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>منصة سُمُوّ</strong> هي المنصة الرائدة في المنطقة العربية التي تربط بين أصحاب المنتجات الرقمية والمستقلين المحترفين المتخصصين في اختبار التطبيقات، المواقع الإلكترونية، وتحسين تجربة المستخدم. نوفر لك حلولاً متكاملة لضمان جودة منتجك الرقمي وزيادة انتشاره على جميع المنصات.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">ما الذي تقدمه منصة سُمُوّ؟</h3>
            <p className="text-foreground leading-relaxed">
              نحن نقدم <strong>خدمات شاملة ومتنوعة</strong> تساعدك على تحسين منتجك الرقمي وزيادة انتشاره. من خلال شبكة واسعة من المستقلين المحترفين في جميع أنحاء الوطن العربي، نضمن لك الحصول على <strong>تقييمات حقيقية</strong> و<strong>اختبارات دقيقة</strong> و<strong>تفاعل فعّال</strong> على منصات التواصل الاجتماعي.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">خدماتنا المتخصصة</h3>
            
            <div className="space-y-4 text-foreground">
              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">1. اختبار التطبيقات (iOS & Android)</h4>
                <p className="leading-relaxed">
                  نوفر <strong>اختبارات شاملة للتطبيقات</strong> على نظامي iOS وAndroid من قبل مختبرين محترفين. نقدم تقارير مفصلة تشمل اكتشاف الأخطاء، تحسين الأداء، وتجربة المستخدم، مما يساعدك على إطلاق تطبيق خالٍ من المشاكل وجاهز للمنافسة في متاجر التطبيقات.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">2. تقييمات خرائط جوجل (Google Maps Reviews)</h4>
                <p className="leading-relaxed">
                  احصل على <strong>تقييمات حقيقية وموثوقة</strong> على Google Maps من مستخدمين فعليين قاموا بتجربة خدماتك. نساعدك على <strong>تحسين ترتيبك</strong> في نتائج البحث المحلية وزيادة ثقة العملاء الجدد، مما يؤدي إلى زيادة المبيعات والانتشار.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">3. التفاعل مع منشورات السوشيال ميديا</h4>
                <p className="leading-relaxed">
                  <strong>خدمة حصرية</strong> تساعدك على <strong>زيادة التفاعل والانتشار</strong> لمحتواك على منصات التواصل الاجتماعي مثل Facebook، Instagram، Twitter، وLinkedIn. يقوم مستقلون حقيقيون بالتفاعل مع منشوراتك من خلال الإعجابات، التعليقات الحقيقية، والمشاركات، مما يعزز من <strong>ظهور المحتوى</strong> في خوارزميات السوشيال ميديا ويزيد من الوصول إلى جمهور أوسع. هذه الخدمة مثالية لـ:
                </p>
                <ul className="list-disc list-inside mr-6 space-y-2 mt-3">
                  <li>أصحاب الأعمال الذين يرغبون في زيادة الوعي بعلامتهم التجارية</li>
                  <li>المؤثرين والمبدعين الذين يسعون لزيادة التفاعل مع محتواهم</li>
                  <li>الشركات الناشئة التي تحتاج إلى بناء حضور قوي على السوشيال ميديا</li>
                  <li>الحملات التسويقية التي تستهدف الوصول لجمهور أكبر</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">4. تحليل تجربة المستخدم (UX/UI)</h4>
                <p className="leading-relaxed">
                  احصل على <strong>تحليل احترافي</strong> لتجربة المستخدم وواجهة التطبيق أو الموقع الخاص بك. نقدم توصيات عملية لتحسين التصميم، سهولة الاستخدام، وزيادة معدلات التحويل، مما يساعدك على <strong>تقليل معدل الارتداد</strong> وزيادة رضا المستخدمين.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">5. اختبار المواقع الإلكترونية</h4>
                <p className="leading-relaxed">
                  فحص شامل لموقعك الإلكتروني يشمل اختبار الأداء، التوافق مع المتصفحات، الاستجابة على الأجهزة المختلفة، وأمان الموقع. نضمن لك موقع <strong>سريع، آمن، ومتوافق</strong> مع جميع الأجهزة.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-primary mb-2">6. تقييمات المستخدمين الحقيقية</h4>
                <p className="leading-relaxed">
                  احصل على <strong>آراء وتقييمات صادقة</strong> من مستخدمين فعليين على متاجر التطبيقات (App Store & Google Play). نساعدك على بناء <strong>سمعة قوية</strong> وزيادة التحميلات من خلال تقييمات إيجابية موثوقة.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">لماذا تختار منصة سُمُوّ؟</h3>
            <div className="grid md:grid-cols-2 gap-4 text-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">شبكة واسعة من المستقلين المحترفين</strong> في جميع أنحاء الوطن العربي
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">نظام أمان متقدم</strong> لحماية بياناتك ومعاملاتك المالية
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">سرعة في الإنجاز</strong> واحصل على النتائج في وقت قياسي
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">دقة عالية</strong> في التقييمات والاختبارات من مختصين محترفين
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">ضمان الجودة</strong> مع إمكانية إعادة الاختبار
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">دعم فني على مدار الساعة</strong> لمساعدتك في أي وقت
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-2xl p-6 mt-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">كيف تعمل المنصة؟</h3>
              <ol className="list-decimal list-inside space-y-3 text-foreground mr-4">
                <li><strong>أصحاب المنتجات:</strong> قم بإنشاء حساب وأضف حملتك الخاصة بتفاصيل المنتج والخدمات المطلوبة</li>
                <li><strong>المستقلون:</strong> تصفح الحملات المتاحة واختر المهام التي تناسب خبراتك</li>
                <li><strong>الإنجاز:</strong> يقوم المستقلون بتنفيذ المهام وتقديم التقارير التفصيلية</li>
                <li><strong>المراجعة والدفع:</strong> يتم مراجعة العمل والموافقة عليه، ثم يتم الدفع بشكل آمن</li>
              </ol>
            </div>

            <p className="text-lg text-foreground leading-relaxed mt-8">
              انضم اليوم إلى <strong>مئات العملاء الراضين</strong> الذين يثقون بمنصة سُمُوّ لتطوير منتجاتهم الرقمية. سواء كنت صاحب منتج رقمي تبحث عن اختبارات موثوقة وتقييمات حقيقية، أو مستقل محترف يبحث عن فرص عمل مرنة ومربحة، <strong>منصة سُمُوّ هي خيارك الأمثل</strong>.
            </p>
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
                className={`rounded-2xl shadow-md hover-elevate active-elevate-2 transition-all group overflow-hidden relative ${
                  service.featured ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                }`}
                data-testid={`card-service-${index}`}
              >
                {service.featured && (
                  <div className="absolute -top-3 -left-3 z-10">
                    <Badge className="bg-primary text-white rounded-xl px-3 py-1 shadow-lg" data-testid="badge-featured-service">
                      <Sparkles className="h-3 w-3 ml-1" />
                      خدمة مميزة
                    </Badge>
                  </div>
                )}
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
