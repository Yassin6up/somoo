import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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

// Component for advanced fade-in animations on scroll with 3D effects
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15, scale: 0.95 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        scale: 1
      } : { 
        opacity: 0, 
        y: 50, 
        rotateX: -15,
        scale: 0.95
      }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

// Advanced animated background particles
function AnimatedParticle({ delay = 0, x = "0%", y = "0%" }: { delay?: number; x?: string; y?: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-primary/20 rounded-full"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        opacity: [0.2, 0.5, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Floating icon component with advanced motion
function FloatingIcon({ icon: Icon, color, delay = 0 }: { icon: any; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ 
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`${color}`}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
  );
}

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

            {/* Right Side - Review Services Card - Horizontal Layout */}
            <div className="relative w-full">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0
                }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  y: { duration: 0.5 }
                }}
                whileHover={{
                  scale: 1.01,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="rounded-3xl shadow-2xl border-2 relative overflow-visible hover-elevate backdrop-blur-sm bg-card/95" data-testid="card-review-services">
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">خدماتنا المميزة</h3>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-3 shadow-sm">
                        <Sparkles className="h-3 w-3 ml-1" />
                        احترافي
                      </Badge>
                    </div>

                    {/* Horizontal Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                      {reviewServices.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="bg-gradient-to-br from-background to-muted/30 rounded-2xl p-4 hover-elevate active-elevate-2 transition-all group border border-border/50 shadow-sm text-center"
                          data-testid={`service-${index}`}
                        >
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
                            className={`inline-flex p-4 rounded-xl ${service.bgColor} shadow-lg mb-3`}
                          >
                            <service.icon className={`h-8 w-8 ${service.color}`} />
                          </motion.div>
                          
                          <h4 className="text-sm font-bold text-foreground mb-1">{service.title}</h4>
                          <p className="text-xs text-muted-foreground font-medium mb-3">{service.subtitle}</p>
                          
                          <div className="flex items-center justify-center gap-2">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                              {service.value}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              className={`p-1.5 rounded-full ${service.bgColor}`}
                            >
                              <Star className={`h-3 w-3 ${service.color} fill-current`} />
                            </motion.div>
                          </div>
                          <span className="text-xs text-muted-foreground block mt-1">{service.label}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20 shadow-sm mt-6"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
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
          <FadeInSection>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 py-1">
                <Sparkles className="h-3 w-3 ml-1" />
                عن المنصة
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" data-testid="text-about-title">
                منصة سُمُوّ - الحل الأمثل لاختبار وتطوير المنتجات الرقمية
              </h2>
            </div>
          </FadeInSection>

          <div className="prose prose-lg max-w-none text-right space-y-6">
            <FadeInSection delay={0.1}>
              <p className="text-lg text-foreground leading-relaxed">
                <strong>منصة سُمُوّ</strong> هي المنصة الرائدة في المنطقة العربية التي تربط بين أصحاب المنتجات الرقمية والمستقلين المحترفين المتخصصين في اختبار التطبيقات، المواقع الإلكترونية، وتحسين تجربة المستخدم. نوفر لك حلولاً متكاملة لضمان جودة منتجك الرقمي وزيادة انتشاره على جميع المنصات.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">ما الذي تقدمه منصة سُمُوّ؟</h3>
              <p className="text-foreground leading-relaxed">
                نحن نقدم <strong>خدمات شاملة ومتنوعة</strong> تساعدك على تحسين منتجك الرقمي وزيادة انتشاره. من خلال شبكة واسعة من المستقلين المحترفين في جميع أنحاء الوطن العربي، نضمن لك الحصول على <strong>تقييمات حقيقية</strong> و<strong>اختبارات دقيقة</strong> و<strong>تفاعل فعّال</strong> على منصات التواصل الاجتماعي.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">خدماتنا المتخصصة</h3>
            </FadeInSection>
            
            <div className="space-y-4 text-foreground">
              <FadeInSection delay={0.1}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-blue-500/10 to-transparent overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated background particles */}
                  <AnimatedParticle delay={0} x="10%" y="20%" />
                  <AnimatedParticle delay={0.5} x="80%" y="60%" />
                  <AnimatedParticle delay={1} x="50%" y="40%" />
                  
                  {/* Floating decorative icons */}
                  <motion.div className="absolute top-4 left-4 opacity-20">
                    <FloatingIcon icon={Apple} color="text-blue-400" delay={0} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Smartphone className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-xl font-bold text-blue-600 mb-2 flex items-center gap-2">
                      اختبار التطبيقات (iOS & Android)
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ⚡
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      نوفر <strong>اختبارات شاملة للتطبيقات</strong> على نظامي iOS وAndroid من قبل مختبرين محترفين. نقدم تقارير مفصلة تشمل اكتشاف الأخطاء، تحسين الأداء، وتجربة المستخدم، مما يساعدك على إطلاق تطبيق خالٍ من المشاكل وجاهز للمنافسة في متاجر التطبيقات.
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>

              <FadeInSection delay={0.15}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-red-500/10 to-transparent overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated background particles */}
                  <AnimatedParticle delay={0.2} x="15%" y="30%" />
                  <AnimatedParticle delay={0.7} x="75%" y="50%" />
                  <AnimatedParticle delay={1.2} x="45%" y="70%" />
                  
                  {/* Floating star ratings */}
                  <motion.div className="absolute top-6 left-6 opacity-20">
                    <FloatingIcon icon={Star} color="text-red-400" delay={0.3} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MapPin className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                      تقييمات خرائط جوجل (Google Maps Reviews)
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block"
                      >
                        📍
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      احصل على <strong>تقييمات حقيقية وموثوقة</strong> على Google Maps من مستخدمين فعليين قاموا بتجربة خدماتك. نساعدك على <strong>تحسين ترتيبك</strong> في نتائج البحث المحلية وزيادة ثقة العملاء الجدد، مما يؤدي إلى زيادة المبيعات والانتشار.
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>

              <FadeInSection delay={0.2}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-pink-500/15 to-transparent border-2 border-pink-500/30 overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5, borderColor: "rgba(236, 72, 153, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Featured badge with animation */}
                  <motion.div 
                    className="absolute top-3 left-3 z-20"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg px-3 py-1 shadow-lg border-0">
                      <motion.span
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block"
                      >
                        <Sparkles className="h-3 w-3 ml-1" />
                      </motion.span>
                      مميزة
                    </Badge>
                  </motion.div>
                  
                  {/* Animated background particles - more for featured */}
                  <AnimatedParticle delay={0} x="20%" y="25%" />
                  <AnimatedParticle delay={0.3} x="70%" y="45%" />
                  <AnimatedParticle delay={0.6} x="40%" y="65%" />
                  <AnimatedParticle delay={0.9} x="85%" y="30%" />
                  
                  {/* Floating social icons */}
                  <motion.div className="absolute top-8 right-8 opacity-15">
                    <FloatingIcon icon={Users} color="text-pink-400" delay={0.5} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl relative z-10"
                    whileHover={{ rotate: [0, -15, 15, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(236, 72, 153, 0.3)",
                        "0 0 30px rgba(236, 72, 153, 0.5)",
                        "0 0 20px rgba(236, 72, 153, 0.3)"
                      ]
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <TrendingUp className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10 pt-8">
                    <h4 className="text-xl font-bold text-pink-600 mb-2 flex items-center gap-2">
                      التفاعل مع منشورات السوشيال ميديا
                      <motion.span
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block"
                      >
                        💫
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      <strong>خدمة حصرية</strong> تساعدك على <strong>زيادة التفاعل والانتشار</strong> لمحتواك على منصات التواصل الاجتماعي مثل Facebook، Instagram، Twitter، وLinkedIn. يقوم مستقلون حقيقيون بالتفاعل مع منشوراتك من خلال الإعجابات، التعليقات الحقيقية، والمشاركات، مما يعزز من <strong>ظهور المحتوى</strong> في خوارزميات السوشيال ميديا ويزيد من الوصول إلى جمهور أوسع. هذه الخدمة مثالية لـ:
                    </p>
                    <ul className="list-disc list-inside mr-6 space-y-2 mt-3 text-sm">
                      <li>أصحاب الأعمال الذين يرغبون في زيادة الوعي بعلامتهم التجارية</li>
                      <li>المؤثرين والمبدعين الذين يسعون لزيادة التفاعل مع محتواهم</li>
                      <li>الشركات الناشئة التي تحتاج إلى بناء حضور قوي على السوشيال ميديا</li>
                      <li>الحملات التسويقية التي تستهدف الوصول لجمهور أكبر</li>
                    </ul>
                  </div>
                </motion.div>
              </FadeInSection>

              <FadeInSection delay={0.25}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-purple-500/10 to-transparent overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedParticle delay={0.4} x="25%" y="35%" />
                  <AnimatedParticle delay={0.9} x="65%" y="55%" />
                  <AnimatedParticle delay={1.4} x="55%" y="75%" />
                  
                  <motion.div className="absolute top-6 right-6 opacity-15">
                    <FloatingIcon icon={Target} color="text-purple-400" delay={0.6} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <BarChart3 className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-xl font-bold text-purple-600 mb-2 flex items-center gap-2">
                      تحليل تجربة المستخدم (UX/UI)
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="inline-block"
                      >
                        🎨
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      احصل على <strong>تحليل احترافي</strong> لتجربة المستخدم وواجهة التطبيق أو الموقع الخاص بك. نقدم توصيات عملية لتحسين التصميم، سهولة الاستخدام، وزيادة معدلات التحويل، مما يساعدك على <strong>تقليل معدل الارتداد</strong> وزيادة رضا المستخدمين.
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>

              <FadeInSection delay={0.3}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-green-500/10 to-transparent overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedParticle delay={0.6} x="30%" y="40%" />
                  <AnimatedParticle delay={1.1} x="60%" y="60%" />
                  <AnimatedParticle delay={1.6} x="50%" y="80%" />
                  
                  <motion.div className="absolute bottom-8 left-8 opacity-15">
                    <FloatingIcon icon={Zap} color="text-green-400" delay={0.8} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Globe className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-xl font-bold text-green-600 mb-2 flex items-center gap-2">
                      اختبار المواقع الإلكترونية
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        className="inline-block"
                      >
                        🌐
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      فحص شامل لموقعك الإلكتروني يشمل اختبار الأداء، التوافق مع المتصفحات، الاستجابة على الأجهزة المختلفة، وأمان الموقع. نضمن لك موقع <strong>سريع، آمن، ومتوافق</strong> مع جميع الأجهزة.
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>

              <FadeInSection delay={0.35}>
                <motion.div 
                  className="relative flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-l from-orange-500/10 to-transparent overflow-hidden group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedParticle delay={0.8} x="35%" y="45%" />
                  <AnimatedParticle delay={1.3} x="70%" y="65%" />
                  <AnimatedParticle delay={1.8} x="45%" y="85%" />
                  
                  <motion.div className="absolute top-8 left-8 opacity-15">
                    <FloatingIcon icon={Award} color="text-orange-400" delay={1} />
                  </motion.div>
                  
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -7, 0],
                        scale: [1, 1.15, 1]
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MessageSquare className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-xl font-bold text-orange-600 mb-2 flex items-center gap-2">
                      تقييمات المستخدمين الحقيقية
                      <motion.span
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="inline-block"
                      >
                        ⭐
                      </motion.span>
                    </h4>
                    <p className="leading-relaxed text-foreground">
                      احصل على <strong>آراء وتقييمات صادقة</strong> من مستخدمين فعليين على متاجر التطبيقات (App Store & Google Play). نساعدك على بناء <strong>سمعة قوية</strong> وزيادة التحميلات من خلال تقييمات إيجابية موثوقة.
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>
            </div>

            <FadeInSection delay={0.4}>
              <h3 className="text-2xl font-bold text-foreground mt-12 mb-6">لماذا تختار منصة سُمُوّ؟</h3>
            </FadeInSection>
            
            <div className="grid md:grid-cols-2 gap-4 text-foreground">
              <FadeInSection delay={0.1}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">شبكة واسعة من المستقلين المحترفين</strong> في جميع أنحاء الوطن العربي
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.15}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">نظام أمان متقدم</strong> لحماية بياناتك ومعاملاتك المالية
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.2}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">سرعة في الإنجاز</strong> واحصل على النتائج في وقت قياسي
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.25}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">دقة عالية</strong> في التقييمات والاختبارات من مختصين محترفين
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">ضمان الجودة</strong> مع إمكانية إعادة الاختبار
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.35}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">دعم فني على مدار الساعة</strong> لمساعدتك في أي وقت
                  </div>
                </div>
              </FadeInSection>
            </div>

            <FadeInSection delay={0.5}>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 mt-12 border border-primary/20 shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  كيف تعمل المنصة؟
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
                    <div>
                      <strong className="text-foreground block mb-1">أصحاب المنتجات:</strong>
                      <p className="text-sm text-muted-foreground">قم بإنشاء حساب وأضف حملتك الخاصة بتفاصيل المنتج والخدمات المطلوبة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
                    <div>
                      <strong className="text-foreground block mb-1">المستقلون:</strong>
                      <p className="text-sm text-muted-foreground">تصفح الحملات المتاحة واختر المهام التي تناسب خبراتك</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
                    <div>
                      <strong className="text-foreground block mb-1">الإنجاز:</strong>
                      <p className="text-sm text-muted-foreground">يقوم المستقلون بتنفيذ المهام وتقديم التقارير التفصيلية</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
                    <div>
                      <strong className="text-foreground block mb-1">المراجعة والدفع:</strong>
                      <p className="text-sm text-muted-foreground">يتم مراجعة العمل والموافقة عليه، ثم يتم الدفع بشكل آمن</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.6}>
              <p className="text-lg text-foreground leading-relaxed mt-12 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20">
                انضم اليوم إلى <strong>مئات العملاء الراضين</strong> الذين يثقون بمنصة سُمُوّ لتطوير منتجاتهم الرقمية. سواء كنت صاحب منتج رقمي تبحث عن اختبارات موثوقة وتقييمات حقيقية، أو مستقل محترف يبحث عن فرص عمل مرنة ومربحة، <strong className="text-primary">منصة سُمُوّ هي خيارك الأمثل</strong>.
              </p>
            </FadeInSection>
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
