import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  ArrowRight, 
  Star,
  MapPin,
  MessageCircle,
  Smartphone,
  Users,
  TrendingUp,
  CheckCircle,
  Play,
  Shield,
  Zap,
  Award,
  Clock,
  ThumbsUp,
  Eye,
  BarChart3,
  Target,
  Calendar,
  Mail,
  Phone,
  Map
} from "lucide-react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const services = [
    { 
      icon: MapPin, 
      title: "Google Maps", 
      description: "تقييمات حقيقية لمتجرك أو عملك",
      features: ["تقييمات 5 نجوم", "تعليقات حقيقية", "تحسين التصنيف"]
    },
    { 
      icon: MessageCircle, 
      title: "Social Media", 
      description: "تعزيز وجودك على منصات التواصل",
      features: ["متابعين حقيقيين", "إعجابات وتفاعل", "تعليقات إيجابية"]
    },
    { 
      icon: Smartphone, 
      title: "App Testing", 
      description: "اختبارات دقيقة لتطبيقات الجوال",
      features: ["اختبار UX/UI", "كشف الأخطاء", "تحسين الأداء"]
    },
    { 
      icon: Star, 
      title: "Store Ratings", 
      description: "تحسين تصنيف متجرك الإلكتروني",
      features: ["تقييمات المنتجات", "مراجعات حقيقية", "زيادة المبيعات"]
    },
  ];

  const process = [
    {
      step: "1",
      title: "اختر الخدمة",
      description: "اختر منصة التقييم المناسبة لك"
    },
    {
      step: "2",
      title: "حدد العدد",
      description: "اختر عدد التقييمات المطلوبة"
    },
    {
      step: "3",
      title: "ادفع بسهولة",
      description: "دفع آمن عبر multiple options"
    },
    {
      step: "4",
      title: "استلم النتائج",
      description: "احصل على تقييمات حقيقية من فريقنا"
    }
  ];

  const stats = [
    { number: "25K", label: "مختبر نشط", icon: Users },
    { number: "50K", label: "تقييم مكتمل", icon: Star },
    { number: "98%", label: "رضا العملاء", icon: ThumbsUp },
    { number: "24/7", label: "دعم فني", icon: Clock },
  ];

  const features = [
    {
      icon: Shield,
      title: "آمن وموثوق",
      description: "جميع التقييمات حقيقية وآمنة 100%"
    },
    {
      icon: Zap,
      title: "نتائج سريعة",
      description: "احصل على النتائج خلال 24 ساعة"
    },
    {
      icon: Award,
      title: "جودة مضمونة",
      description: "نضمن لك الحصول على أفضل النتائج"
    },
    {
      icon: TrendingUp,
      title: "تحليلات مفصلة",
      description: "تقارير شاملة عن أداء تقييماتك"
    }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      business: "مطعم اللذة الشرقية",
      comment: "ارتفع تصنيفنا من 3.2 إلى 4.8 في أسبوعين فقط!",
      rating: 5
    },
    {
      name: "سارة العلي",
      business: "متجر إلكتروني",
      comment: "المبيعات تضاعفت بعد تحسين التقييمات",
      rating: 5
    },
    {
      name: "خالد عبدالله",
      business: "تطبيق توصيل",
      comment: "أفضل استثمار قمنا به لتحسين سمعة التطبيق",
      rating: 5
    }
  ];

  const pricing = [
    {
      name: "الباقة الأساسية",
      price: "99",
      features: [
        "10 تقييمات حقيقية",
        "تقييمات 5 نجوم",
        "دعم عبر البريد الإلكتروني",
        "نتائج خلال 3 أيام"
      ]
    },
    {
      name: "الباقة المتوسطة",
      price: "199",
      popular: true,
      features: [
        "25 تقييمات حقيقية",
        "تقييمات 5 نجوم",
        "تعليقات مكتوبة",
        "دعم فني سريع",
        "نتائج خلال 48 ساعة"
      ]
    },
    {
      name: "الباقة المتقدمة",
      price: "399",
      features: [
        "50 تقييمات حقيقية",
        "تقييمات 5 نجوم",
        "تعليقات مفصلة",
        "دعم فني مخصص",
        "نتائج خلال 24 ساعة",
        "تقرير تحليلي مفصل"
      ]
    }
  ];

  const platforms = [
    { name: "Google Maps", icon: "🗺️" },
    { name: "Facebook", icon: "📘" },
    { name: "Instagram", icon: "📷" },
    { name: "App Store", icon: "📱" },
    { name: "Google Play", icon: "🎮" },
    { name: "Amazon", icon: "📦" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 -z-10"
        />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-gray-600 text-sm mb-8"
            >
              <Star className="h-4 w-4" />
              المنصة الأولى للتصنيف والاختبار
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              اصنع <span className="text-blue-600">سمعتك</span>
              <br />
              <span className="text-gray-600">الرقمية</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              مع <span className="font-semibold">25,000+ مختبر محترف</span>، 
              نحن نضمن حصولك على التقييمات الحقيقية التي تجعل عملك مشهورًا
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/get-started">
                <Button size="lg" className="px-8 bg-gray-900 hover:bg-gray-800">
                  ابدأ التقييم الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="px-8 border-gray-300">
                  <Play className="mr-2 h-4 w-4" />
                  شاهد كيف نعمل
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <StatIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">نعمل على جميع المنصات</h3>
            <p className="text-gray-600">ندعم جميع منصات التقييم والاختبار الرئيسية</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl mb-2">{platform.icon}</span>
                <span className="text-xs font-medium text-center text-gray-700">{platform.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">خدماتنا المتخصصة</h2>
            <p className="text-gray-600 max-w-xl mx-auto">اختر منصة التقييم المناسبة لاحتياجاتك</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  <ServiceIcon className="h-12 w-12 text-blue-600 mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Link href={`/services/${service.title.toLowerCase().replace(' ', '-')}`}>
                    <Button variant="outline" className="w-full mt-6">
                      اختر هذه الخدمة
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">كيف نعمل</h2>
            <p className="text-gray-600 max-w-xl mx-auto">4 خطوات بسيطة تفصلك عن تحقيق الشهرة الرقمية</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-lg font-medium mx-auto">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">لماذا تختارنا؟</h2>
            <p className="text-gray-600 max-w-xl mx-auto">نقدم مميزات استثنائية تضمن نجاحك</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg border border-gray-200 text-center"
                >
                  <FeatureIcon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">ماذا يقول عملاؤنا؟</h2>
            <p className="text-gray-600 max-w-xl mx-auto">انضم إلى آلاف العملاء الراضين عن خدماتنا</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.business}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">باقات الأسعار</h2>
            <p className="text-gray-600 max-w-xl mx-auto">اختر الباقة المناسبة لاحتياجاتك</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl border-2 ${
                  plan.popular ? 'border-blue-500 relative' : 'border-gray-200'
                } p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      الأكثر شيوعًا
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/شهريًا</span>
                </div>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                  اختر الباقة
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">الأسئلة الشائعة</h2>
            <p className="text-gray-600">إجابات على أسئلتك الأكثر شيوعًا</p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "هل التقييمات حقيقية وآمنة؟",
                answer: "نعم، جميع التقييمات من مستخدمين حقيقيين وتتم بطريقة آمنة تمامًا."
              },
              {
                question: "كم تستغرق عملية التقييم؟",
                answer: "تستغرق معظم الطلبات من 24 إلى 72 ساعة حسب حجم الطلب."
              },
              {
                question: "هل يمكنني إلغاء الطلب؟",
                answer: "نعم، يمكنك إلغاء الطلب خلال 24 ساعة من تقديمه."
              },
              {
                question: "كيف أضمن جودة التقييمات؟",
                answer: "نحن نعمل مع فريق من المختبرين المحترفين ونراجع جميع التقييمات قبل تسليمها."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">مستعد للبدء؟</h2>
            <p className="text-gray-300 mb-8 text-xl">
              انضم إلى آلاف العملاء الذين حصلوا على تقييمات حقيقية وحققوا نجاحًا ملحوظًا
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/get-started">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8">
                  ابدأ التقييم الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/become-tester">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  <Users className="mr-2 h-4 w-4" />
                  انضم كمختبر
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                تقييمات حقيقية 100%
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                أمان وخصوصية تامة
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                نتائج فورية
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}