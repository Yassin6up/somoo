import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Star, 
  MapPin,
  Smartphone,
  Users,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
  Play,
  MessageCircle,
  ThumbsUp,
  Target,
  Award,
  Clock,
  Quote
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: MapPin,
      title: "تقييمات خرائط جوجل",
      description: "تعزيز وجودك على خرائط جوجل بتقييمات حقيقية وموثوقة"
    },
    {
      icon: Smartphone,
      title: "تقييمات متاجر التطبيقات",
      description: "تحسين تصنيف تطبيقك في متجري App Store و Google Play"
    },
    {
      icon: Users,
      title: "مختبرون محترفون",
      description: "فريق من المختبرين المؤهلين لتقييم تجربة المستخدم"
    },
    {
      icon: TrendingUp,
      title: "تحليلات مفصلة",
      description: "تقارير شاملة تساعدك في فهم أداء منتجك الرقمي"
    }
  ];

  const services = [
    {
      icon: Star,
      title: "تقييمات جوجل",
      stats: "2,500+ تقييم",
      description: "تقييمات موثوقة لتحسين تصنيفك على خرائط جوجل",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Smartphone,
      title: "تقييمات التطبيقات",
      stats: "1,800+ تقييم",
      description: "تعزيز وجود تطبيقك في متاجر التطبيقات",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "اختبار UX/UI",
      stats: "950+ اختبار",
      description: "تحسين تجربة المستخدم من خلال اختبارات احترافية",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: ThumbsUp,
      title: "مراجعات وسائل التواصل",
      stats: "3,200+ مراجعة",
      description: "زيادة التفاعل والمصداقية على المنصات الاجتماعية",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "مدير مطعم",
      content: "ساعدتني سومو في زيادة تقييم مطعمي على جوجل من 3.2 إلى 4.8 في شهرين فقط!",
      rating: 5
    },
    {
      name: "فاطمة العلي",
      role: "مطور تطبيقات",
      content: "التقييمات الحقيقية ساعدت تطبيقي على الصعود إلى المراكز الأولى في المتجر",
      rating: 5
    },
    {
      name: "خالد السعيد",
      role: "صاحب شركة",
      content: "الخدمة احترافية والمختبرون يقدمون ملاحظات قيمة ساعدت في تطوير خدماتنا",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000", label: "تقييم مكتمل" },
    { number: "2,500", label: "عميل راضي" },
    { number: "4.9", label: "تقييم متوسط" },
    { number: "98%", label: "رضا العملاء" }
  ];

  const process = [
    {
      step: "01",
      title: "اختر الخدمة",
      description: "اختر من بين خدماتنا المتنوعة للتقييم والاختبار"
    },
    {
      step: "02",
      title: "حدد المتطلبات",
      description: "أخبرنا باحتياجاتك ومتطلباتك الخاصة"
    },
    {
      step: "03",
      title: "تنفيذ المهمة",
      description: "فريقنا المحترف ينفذ المهمة بدقة واحترافية"
    },
    {
      step: "04",
      title: "تسليم النتائج",
      description: "احصل على تقرير مفصل ونتائج ملموسة"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Full Screen Hero Section with Fixed Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Fixed Background */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url('/pattern.svg')",
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30 animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-blue-100 text-blue-600 border-0 mb-6 px-6 py-3 text-lg font-medium">
              <Star className="w-5 h-5 ml-2" />
              المنصة الرائدة للتقييمات والاختبارات
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="block">ارتقِ بتقييماتك</span>
              <span className="block text-blue-600 mt-4">الرقمية</span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              نوفر لك تقييمات حقيقية واختبارات احترافية لتعزيز وجودك الرقمي على 
              خرائط جوجل، متاجر التطبيقات، ومنصات التواصل الاجتماعي
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/role-selection">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                  ابدأ رحلتك الآن
                  <ArrowRight className="mr-3 h-6 w-6" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 px-12 py-6 text-xl rounded-2xl backdrop-blur-sm bg-white/80">
                <Play className="mr-3 h-6 w-6" />
                شاهد التجارب
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                خدماتنا <span className="text-blue-600">المتميزة</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                نقدم مجموعة متكاملة من خدمات التقييم والاختبارات لتعزيز وجودك الرقمي
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group text-center p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-blue-50 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-purple-100 text-purple-600 border-0 mb-6 px-4 py-2">
                حلول متكاملة
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                كيف يمكننا <span className="text-purple-600">مساعدتك؟</span>
              </h2>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                    <Badge className="bg-gray-100 text-gray-700 border-0 px-4 py-2 font-semibold">
                      {service.stats}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-green-100 text-green-600 border-0 mb-6 px-4 py-2">
                خطوات العمل
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                <span className="text-green-600">4 خطوات</span> بسيطة للنتيجة
              </h2>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-8 right-8 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 rounded-full"></div>
            
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.step}
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl mt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-yellow-100 text-yellow-600 border-0 mb-6 px-4 py-2">
                <Quote className="w-4 h-4 ml-1" />
                آراء العملاء
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                يثق بنا <span className="text-yellow-600">آلاف العملاء</span>
              </h2>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              مستعد لتحسين تقييماتك الرقمية؟
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              انضم إلى آلاف الشركات والأفراد الذين حققوا نجاحات مذهلة في تعزيز وجودهم الرقمي
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/role-selection">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-xl rounded-2xl shadow-2xl">
                  ابدأ مجاناً الآن
                  <ArrowRight className="mr-3 h-6 w-6" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl backdrop-blur-sm">
                <MessageCircle className="mr-3 h-6 w-6" />
                تواصل معنا
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}