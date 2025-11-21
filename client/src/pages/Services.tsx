import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion"; // Added motion import
import { 
  MapPin, 
  Star, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Target, 
  Palette, 
  X, 
  CheckCircle, 
  Clock, 
  Zap, 
  ArrowRight,
  Rocket,
  Play,
  Quote,
  Shield,
  Sparkles,
  BarChart3,
  ThumbsUp,
  Smartphone,
  Share2,
  Layout,
  Globe,
  Award,
  UserCheck,
  Target as TargetIcon
} from "lucide-react";

// Import images
import googleMapsCard from "@assets/generated_images/Google_Maps_Reviews_Card_d9574a88.png";
import appReviewsCard from "@assets/generated_images/App_Reviews_Card_1c7a7d75.png";
import uxTestingCard from "@assets/generated_images/UX_Testing_Card_843ea192.png";
import socialMediaCard from "@assets/generated_images/Social_Media_Engagement_Card_ced69d5b.png";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animated section wrapper with GSAP
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);

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

// Gradient background component
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
    </div>
  );
}

const services = [
  {
    title: "تقييمات خرائط Google",
    description: "رفع تقييم نشاطك التجاري على الخرائط بطريقة احترافية مبنية على مخاطبة الفئة المستهدفة بذكاء.",
    image: googleMapsCard,
    icon: MapPin,
    gradient: "from-blue-500 to-cyan-500",
    features: ["مراجعات حقيقية", "تحسين محركات البحث المحلي", "زيادة المصداقية"],
    fullDescription: "نقدم خدمة متكاملة لتحسين تقييمات خرائط Google من خلال استراتيجيات مدروسة تزيد من مرئية نشاطك التجاري وتجذب المزيد من العملاء المحليين. نحن نضمن نتائج حقيقية وقابلة للقياس من خلال فريق متخصص في إدارة السمعة الرقمية.",
    process: [
      { step: "تحليل الملف الحالي", icon: TargetIcon },
      { step: "تطوير استراتيجية مخصصة", icon: Zap },
      { step: "تنفيذ الحملة", icon: CheckCircle },
      { step: "متابعة النتائج", icon: Clock }
    ],
    benefits: ["زيادة الثقة في علامتك", "جذب عملاء جدد", "تحسين الترتيب في البحث"]
  },
  {
    title: "تقييمات التطبيقات",
    description: "تحسين تقييم تطبيقك عبر مراجعات حقيقية تساعد في رفع الثقة وزيادة التحميلات.",
    image: appReviewsCard,
    icon: Smartphone,
    gradient: "from-purple-500 to-pink-500",
    features: ["مراجعات موثوقة", "تحسين ترتيب المتجر", "زيادة التنزيلات"],
    fullDescription: "نساعدك في تحسين تقييمات تطبيقك على متاجر التطبيقات مما يزيد من ثقة المستخدمين ويحسن ترتيب التطبيق ويزيد من عدد التحميلات بشكل ملحوظ. نعمل على بناء سمعة إيجابية لتطبيقك.",
    process: [
      { step: "تقييم التطبيق الحالي", icon: TargetIcon },
      { step: "تحديد مجالات التحسين", icon: Zap },
      { step: "تنفيذ استراتيجية المراجعات", icon: CheckCircle },
      { step: "تحسين التصنيف", icon: Clock }
    ],
    benefits: ["تحسين ترتيب المتجر", "زيادة ثقة المستخدمين", "نمو مستمر في التحميلات"]
  },
  {
    title: "اختبار تجربة المستخدم",
    description: "تحليل شامل لتجربة المستخدم وتصميم رحلة واضحة تساعدك على نجاح مشروعك قبل طرحه للجمهور.",
    image: uxTestingCard,
    icon: Layout,
    gradient: "from-orange-500 to-red-500",
    features: ["اختبارات شاملة", "تحليل البيانات", "تحسين التحويلات"],
    fullDescription: "نقوم باختبار شامل لتجربة المستخدم قبل إطلاق مشروعك لاكتشاف نقاط الضعف وتحسينها، مما يضمن تجربة مستخدم سلسة وناجحة من اليوم الأول. نستخدم أحدث أدوات التحليل لضمان أفضل النتائج.",
    process: [
      { step: "اختبار الوظائف الأساسية", icon: TargetIcon },
      { step: "تحليل سلوك المستخدم", icon: Zap },
      { step: "تحديد نقاط التحسين", icon: CheckCircle },
      { step: "تنفيذ التوصيات", icon: Clock }
    ],
    benefits: ["تجربة مستخدم محسنة", "تقليل معدلات الخروج", "زيادة التحويلات"]
  },
  {
    title: "التفاعل على وسائل التواصل",
    description: "زيادة نسبة الوصول والمتابعة من خلال فريق متخصص بالتفاعل الحقيقي.",
    image: socialMediaCard,
    icon: Share2,
    gradient: "from-green-500 to-emerald-500",
    features: ["تفاعل حقيقي", "زيادة المتابعين", "تحسين الوصول"],
    fullDescription: "نخلق تفاعلاً حقيقياً ومستمراً على منصات التواصل الاجتماعي لزيادة وصولك ومتابعيك وتحسين وجودك الرقمي بشكل عام. نضمن تفاعلاً طبيعياً يعكس صورة إيجابية عن علامتك التجارية.",
    process: [
      { step: "تحليل الجمهور المستهدف", icon: TargetIcon },
      { step: "تخطيط استراتيجية المحتوى", icon: Zap },
      { step: "تنفيذ التفاعل اليومي", icon: CheckCircle },
      { step: "قياس وتحليل النتائج", icon: Clock }
    ],
    benefits: ["وصول أوسع للجمهور", "متابعين نشطين", "تفاعل حقيقي ومستمر"]
  },
];

// Additional services for the expanded section
const additionalServices = [
  {
    title: "استشارات التسويق الرقمي",
    description: "خطط استراتيجية مخصصة لتحقيق أهدافك التسويقية في العالم الرقمي.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "تحسين محركات البحث",
    description: "تحسين موقعك لتحقيق ترتيب أعلى في نتائج محركات البحث وجذب المزيد من الزوار.",
    icon: Search,
    gradient: "from-blue-600 to-blue-700"
  },
  {
    title: "إدارة الحملات الإعلانية",
    description: "تصميم وإدارة حملات إعلانية فعالة عبر منصات التواصل الاجتماعي ومحركات البحث.",
    icon: Target,
    gradient: "from-blue-700 to-blue-800"
  },
  {
    title: "تصميم الهوية البصرية",
    description: "إنشاء هوية بصرية متكاملة تعبر عن علامتك التجارية وتجذب عملائك المستهدفين.",
    icon: Palette,
    gradient: "from-blue-800 to-blue-900"
  },
];

const stats = [
  { value: "500", label: "مشروع مكتمل", suffix: "+" },
  { value: "98", label: "عملاء راضون", suffix: "%" },
  { value: "50", label: "خبير محترف", suffix: "+" },
  { value: "10", label: "سنوات خبرة", suffix: "+" }
];

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();
    tl.fromTo(".hero-title", 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }
    )
    .fromTo(".hero-description", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 }, "-=0.3"
    )
    .fromTo(".hero-cta", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.2"
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

    // Service cards animation
    gsap.fromTo(".service-card",
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <section ref={heroRef} className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        <GradientBackground />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <Badge className="hero-badge bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-3 rounded-full inline-flex items-center gap-3 shadow-lg mb-8">
            <Sparkles className="h-4 w-4" />
            خدماتنا الاحترافية
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </Badge>

          <h1 className="hero-title text-4xl md:text-6xl font-bold text-gray-900 mb-6" dir="rtl">
            حلول <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">رقمية متكاملة</span> لنجاحك
          </h1>
          
          <p className="hero-description text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed" dir="rtl">
            نقدم مجموعة متكاملة من الخدمات الاحترافية المصممة خصيصاً لتحسين وجودك الرقمي، 
            زيادة تفاعل العملاء، وتحقيق نمو مستمر لعلامتك التجارية
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              ابدأ مشروعك الآن
              <Rocket className="mr-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 group">
              <Play className="mr-2 h-5 w-5 group-hover:text-blue-600" />
              شاهد أعمالنا
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Main Services Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                خدماتنا الأساسية
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" dir="rtl">
                حلول <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">مبتكرة</span> لتحقيق التميز
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" dir="rtl">
                نقدم مجموعة متكاملة من الخدمات الرقمية المصممة لتحقيق أهدافك ودفع نمو أعمالك إلى الأمام
              </p>
            </div>
          </FadeInSection>

          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="service-card group cursor-pointer"
                >
                  <Card 
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:border-transparent"
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-6 flex flex-col h-full relative">
                      {/* Gradient Overlay on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}></div>
                      
                      {/* Icon and Image Section */}
                      <div className="flex-1 flex flex-col items-center mb-6">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <div className="w-full h-40 relative mb-6 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-4 border border-gray-200">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-4 flex-1 flex flex-col relative z-10">
                        <h3 className="text-xl font-bold leading-tight text-center text-gray-900 group-hover:text-blue-600 transition-colors" dir="rtl">
                          {service.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed text-center flex-1" dir="rtl">
                          {service.description}
                        </p>

                        {/* Features List */}
                        <div className="space-y-3 mt-4">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-700 text-sm" dir="rtl">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient} ml-3 group-hover:scale-125 transition-transform duration-300`}></div>
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* Learn More Button */}
                        <div className="flex justify-center pt-6 mt-auto">
                          <div className={`text-white text-sm bg-gradient-to-r ${service.gradient} px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg group-hover:scale-105 flex items-center gap-2`}>
                            تعرف على المزيد
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section ref={statsRef} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        <GradientBackground />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                <TrendingUp className="h-4 w-4 mr-2" />
                إنجازاتنا بالأرقام
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" dir="rtl">
                ثقة <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">العملاء</span> تدفعنا للأمام
              </h2>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    <span className="stat-number" data-value={stat.value}>0</span>
                    {stat.suffix}
                  </div>
                  <div className="text-gray-600 text-lg font-medium" dir="rtl">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Additional Services Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-20">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-6 py-2 rounded-full mb-6">
                خدمات متخصصة
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" dir="rtl">
                حلول <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">شاملة</span> لجميع احتياجاتك
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" dir="rtl">
                نقدم مجموعة واسعة من الخدمات المتخصصة لتلبية جميع متطلباتك الرقمية وتحقيق أهدافك الاستراتيجية
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <FadeInSection key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <div className={`bg-gradient-to-br ${service.gradient} rounded-3xl p-8 border-0 h-full transition-all duration-300 hover:shadow-2xl text-white relative overflow-hidden`}>
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 leading-tight" dir="rtl">{service.title}</h3>
                        <p className="text-white/90 text-sm leading-relaxed" dir="rtl">{service.description}</p>
                        
                        {/* Learn More Arrow */}
                        <div className="flex justify-end mt-6">
                          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-5xl mx-auto text-center rounded-3xl p-16 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <FadeInSection>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" dir="rtl">
                مستعد لبدء رحلتك الرقمية؟
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed" dir="rtl">
                اتصل بنا اليوم واحصل على استشارة مجانية لتطوير وجودك الرقمي وتحقيق نمو استثنائي لأعمالك
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  اتصل بنا الآن
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-all duration-300">
                  <UserCheck className="mr-3 h-5 w-5" />
                  اطلب استشارة مجانية
                </Button>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <Footer />

      {/* Enhanced Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4 flex-1" dir="rtl">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${selectedService.gradient} flex items-center justify-center`}>
                    <selectedService.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900" dir="rtl">
                      {selectedService.title}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1" dir="rtl">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image */}
              <div className="w-full h-64 mb-8 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-6 border border-gray-200">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Full Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" dir="rtl">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  نظرة عامة على الخدمة
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg" dir="rtl">
                  {selectedService.fullDescription}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" dir="rtl">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    المميزات الرئيسية
                  </h3>
                  <div className="space-y-3">
                    {selectedService.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl" dir="rtl">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedService.gradient}`}></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" dir="rtl">
                    <Award className="w-5 h-5 text-yellow-500" />
                    الفوائد المتوقعة
                  </h3>
                  <div className="space-y-3">
                    {selectedService.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl" dir="rtl">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedService.gradient}`}></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Process */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" dir="rtl">
                  <Zap className="w-5 h-5 text-orange-500" />
                  خطوات العمل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedService.process.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-300 flex items-center justify-center mx-auto mb-3">
                          <StepIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{step.step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                <Button 
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
                  onClick={() => setSelectedService(null)}
                >
                  إغلاق
                </Button>
                <Button 
                  className={`bg-gradient-to-r ${selectedService.gradient} text-white px-8 py-3 hover:shadow-lg transition-all duration-300`}
                >
                  اختر هذه الخدمة
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}