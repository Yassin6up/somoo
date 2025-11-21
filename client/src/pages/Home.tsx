import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  UserPlus, 
  BarChart3, 
  Users, 
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Target,
  Award,
  Clock,
  MessageSquare,
  MapPin,
  Share2,
  Palette,
  Globe,
  Rocket,
  ChevronRight,
  Play,
  ArrowRight,
  Smartphone,
  Map,
  ThumbsUp,
  Layout,
  ShieldCheck,
  Zap as Lightning,
  Users as Community,
  ArrowUpRight,
  Quote,
  type LucideIcon
} from "lucide-react";

// Import the Ballpit component
import Ballpit from "@/components/Ballpit";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animated section wrapper with GSAP
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const element = ref.current;
    if (element) {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="opacity-0">
      {children}
    </div>
  );
}

// Professional gradient background component
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();
    tl.fromTo(".hero-badge", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    )
    .fromTo(".hero-title", 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, "-=0.4"
    )
    .fromTo(".hero-description", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 }, "-=0.3"
    )
    .fromTo(".hero-cta", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.2"
    )
    .fromTo(".hero-stats", 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 }, "-=0.3"
    );

    // Stats counter animation
    gsap.fromTo(".stat-number",
      { innerText: 0 },
      {
        innerText: (i, target) => {
          const value = target.getAttribute("data-value");
          return value;
        },
        duration: 2,
        ease: "power2.out",
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 70%",
          end: "bottom 30%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      title: "تقييمات موثوقة",
      description: "احصل على تقييمات حقيقية من مستخدمين فعليين مع ضمان الجودة والأصالة",
      color: "from-emerald-500 to-cyan-500"
    },
    {
      icon: Lightning,
      title: "سرعة الأداء",
      description: "خدمات سريعة الإنجاز مع نتائج فورية تلبي توقعاتك في الوقت المحدد",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Community,
      title: "مجتمع محترف",
      description: "انضم إلى آلاف المحترفين المؤهلين في مختلف المجالات الرقمية",
      color: "from-orange-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "تحليلات متقدمة",
      description: "تقارير مفصلة وتحليلات دقيقة تساعدك في اتخاذ القرارات الصحيحة",
      color: "from-purple-500 to-indigo-500"
    }
  ];

  const services = [
    {
      icon: Smartphone,
      title: "تقييمات التطبيقات",
      description: "تعزيز تصنيف تطبيقك على متاجر التطبيقات من خلال تقييمات مستخدمين حقيقيين",
      stats: "2,500+ تقييم",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Map,
      title: "خرائط Google",
      description: "تحسين وجودك على خرائط جوجل بتقييمات موثوقة ومراجعات حقيقية",
      stats: "1,200+ موقع",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Share2,
      title: "وسائل التواصل",
      description: "زيادة التفاعل والمتابعين على منصات التواصل الاجتماعي المختلفة",
      stats: "2,500+ تفاعل",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Layout,
      title: "اختبار UX/UI",
      description: "تحسين تجربة المستخدم من خلال اختبارات احترافية وملاحظات قيمة",
      stats: "950+ اختبار",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { value: "5000", label: "مستخدم نشط", suffix: "+" },
    { value: "15000", label: "مهمة منجزة", suffix: "+" },
    { value: "98", label: "رضا العملاء", suffix: "%" },
    { value: "24", label: "دعم فني", suffix: "/7" }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "مؤسس تطبيق تجارة إلكترونية",
      content: "منصة سمو غيرت طريقة تعاملنا مع التقييمات بشكل كامل. النتائج كانت مذهلة وساعدتنا في زيادة تحميل التطبيق بنسبة 40%",
      avatar: "AM",
      rating: 5
    },
    {
      name: "فاطمة علي",
      role: "مديرة تسويق رقمي",
      content: "الاحترافية في العمل والدقة في التنفيذ جعلتنا نعتمد على سمو في جميع حملاتنا التسويقية الرقمية",
      avatar: "فع",
      rating: 5
    },
    {
      name: "خالد السعيد",
      role: "مطور تطبيقات",
      content: "أفضل منصة واجهتها من حيث الجودة والاحترافية. فريق الدعم يستجيب بسرعة وحلولهم فعالة جداً",
      avatar: "خس",
      rating: 5
    }
  ];

  const processSteps = [
    { 
      num: "01", 
      title: "إنشاء الحساب", 
      desc: "سجل في دقائق وابدأ رحلتك مع منصة سمو", 
      icon: UserPlus 
    },
    { 
      num: "02", 
      title: "اختر الخدمة", 
      desc: "اختر من بين مجموعة خدماتنا المتنوعة والمتخصصة", 
      icon: Target 
    },
    { 
      num: "03", 
      title: "التنفيذ", 
      desc: "فريقنا المحترف ينفذ مهامك بدقة وسرعة فائقة", 
      icon: Rocket 
    },
    { 
      num: "04", 
      title: "النتائج", 
      desc: "احصل على تقارير مفصلة واشهد تحسن أداء منتجك", 
      icon: Award 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <Navbar />

      {/* Enhanced Hero Section with Ballpit Background */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-24 pb-32">
        {/* Ballpit Background */}
        <div className="absolute inset-0 z-0">
          <Ballpit
            count={150}
            gravity={0.1}
            friction={0.997}
            wallBounce={0.95}
            followCursor={true}
            colors={["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"]}
            className="w-full h-full opacity-80"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 z-1"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-right space-y-8">
              <Badge className="hero-badge bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-3 rounded-full inline-flex items-center gap-3 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                المنصة الرائدة في التحول الرقمي
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </Badge>

              <h1 className="hero-title text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="block text-gray-900">ارتقِ بمنتجك</span>
                <span className="block text-gray-900 mt-2">الرقمي</span>
                <span className="block mt-4">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    نحو التميز
                  </span>
                </span>
              </h1>

              <p className="hero-description text-xl text-gray-600 leading-relaxed max-w-2xl ml-auto backdrop-blur-sm bg-white/30 rounded-2xl p-6">
                نوفر حلولاً رقمية متكاملة تربط أصحاب المنتجات بمحترفين موثوقين لتحسين التقييمات، 
                تعزيز التواجد الرقمي، ورفع أداء الأعمال بشكل استثنائي
              </p>

              <div className="hero-cta flex flex-col sm:flex-row gap-4">
                <Link href="/role-selection">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                    ابدأ رحلتك الآن
                    <Rocket className="mr-3 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-blue-500 px-10 py-7 rounded-2xl text-lg font-semibold hover:bg-blue-50 group backdrop-blur-sm bg-white/80">
                  <Play className="mr-3 h-5 w-5 group-hover:text-blue-600" />
                  شاهد قصتنا
                </Button>
              </div>

              {/* Enhanced Stats Row */}
              <div className="hero-stats flex gap-12 pt-12 border-t border-gray-200 backdrop-blur-sm bg-white/30 rounded-2xl p-6">
                {[
                  { number: "5000+", label: "مستخدم نشط" },
                  { number: "98%", label: "رضا العملاء" },
                  { number: "15K+", label: "مشروع مكتمل" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Right Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl border border-gray-100 backdrop-blur-sm">
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                
                <div className="bg-white rounded-2xl p-8 space-y-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 font-medium">إجمالي المشاريع</div>
                      <div className="text-3xl font-bold text-gray-900">15,847</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {services.slice(0, 4).map((service, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group">
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${service.gradient} mb-3 group-hover:scale-110 transition-transform`}>
                          <service.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{service.title.split(' ')[0]}</div>
                        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {service.stats.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of your existing sections remain the same */}
      {/* Enhanced Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-6 py-2 rounded-full mb-6 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                لماذا تختار سمو؟
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                نوفر لك <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">الأفضل دائماً</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                نتميز بتقديم حلول رقمية مبتكرة تجمع بين الجودة العالية والأداء المتميز، 
                لنساعدك في تحقيق أهدافك بكل كفاءة واحترافية
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group text-center p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed relative z-10">{feature.description}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                خدماتنا المتخصصة
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                حلول <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">شاملة</span> لجميع احتياجاتك
              </h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-3xl border border-gray-200 hover:border-transparent shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 text-right">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-0 px-4 py-2 rounded-full font-semibold">
                            {service.stats}
                          </Badge>
                          <div className="bg-gray-100 group-hover:bg-blue-100 p-2 rounded-full transition-colors">
                            <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                كيف نعمل
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">4 خطوات</span> فقط لفعالية مضمونة
              </h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Enhanced Connection Line */}
            <div className="hidden md:block absolute top-24 left-8 right-8 h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full"></div>
            
            {processSteps.map((step, index) => (
              <FadeInSection key={index} delay={index * 0.15}>
                <div className="relative">
                  <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group text-center relative z-10">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-lg font-bold flex items-center justify-center shadow-lg">
                      {step.num}
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-flex">
                      <step.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                <Quote className="h-4 w-4 mr-2" />
                آراء عملائنا
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                يثق بنا <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">آلاف العملاء</span>
              </h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8 text-right">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section ref={statsRef} className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-5xl lg:text-6xl font-bold mb-4"
                  >
                    <span className="stat-number" data-value={stat.value}>0</span>
                    {stat.suffix}
                  </motion.div>
                  <div className="text-blue-100 text-lg font-medium">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 relative z-10">
                مستعد للبدء في رحلتك الرقمية؟
              </h2>
              <p className="text-xl mb-10 text-blue-100 relative z-10 max-w-2xl mx-auto leading-relaxed">
                انضم إلى آلاف الشركات والناشئين الذين حققوا نجاحات مذهلة مع منصة سمو
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                <Link href="/role-selection">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-7 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    ابدأ مجاناً الآن
                    <Rocket className="mr-3 h-6 w-6" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-7 rounded-2xl text-lg font-semibold backdrop-blur-sm">
                  <MessageSquare className="mr-3 h-6 w-6" />
                  تواصل مع خبرائنا
                </Button>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}