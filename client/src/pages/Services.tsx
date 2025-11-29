import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Smartphone,
  MessageCircle,
  Layout,
  Globe,
  Shield,
  Users,
  ThumbsUp,
  BarChart3,
  CheckCircle,
  Target,
  Zap,
  Clock
} from "lucide-react";

// FadeInSection component
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

const services = [
  {
    title: "تقييمات خرائط Google",
    description: "خدمة متكاملة لتحسين تقييمات خرائط Google من خلال استراتيجيات مدروسة تزيد من مرئية نشاطك التجاري وتجذب المزيد من العملاء المحليين.",
    icon: MapPin,
    features: ["مراجعات حقيقية", "تحسين محركات البحث المحلي", "زيادة المصداقية", "تحسين الترتيب في البحث"],
    process: [
      { step: "تحليل الملف الحالي", icon: Target },
      { step: "تطوير استراتيجية مخصصة", icon: Zap },
      { step: "تنفيذ الحملة", icon: CheckCircle },
      { step: "متابعة النتائج", icon: Clock }
    ],
    benefits: ["زيادة الثقة في علامتك", "جذب عملاء جدد", "تحسين الترتيب في البحث"]
  },
  {
    title: "تقييمات التطبيقات",
    description: "نساعدك في تحسين تقييمات تطبيقك على متاجر التطبيقات مما يزيد من ثقة المستخدمين ويحسن ترتيب التطبيق ويزيد من عدد التحميلات.",
    icon: Smartphone,
    features: ["مراجعات موثوقة", "تحسين ترتيب المتجر", "زيادة التنزيلات", "تحليل الأداء"],
    process: [
      { step: "تقييم التطبيق الحالي", icon: Target },
      { step: "تحديد مجالات التحسين", icon: Zap },
      { step: "تنفيذ استراتيجية المراجعات", icon: CheckCircle },
      { step: "تحسين التصنيف", icon: Clock }
    ],
    benefits: ["تحسين ترتيب المتجر", "زيادة ثقة المستخدمين", "نمو مستمر في التحميلات"]
  },
  {
    title: "تقييمات السوشيال ميديا",
    description: "نخلق تفاعلاً حقيقياً ومستمراً على منصات التواصل الاجتماعي لزيادة وصولك ومتابعيك وتحسين وجودك الرقمي بشكل عام.",
    icon: MessageCircle,
    features: ["تفاعل حقيقي", "زيادة المتابعين", "تحسين الوصول", "تحليل الجمهور"],
    process: [
      { step: "تحليل الجمهور المستهدف", icon: Target },
      { step: "تخطيط استراتيجية المحتوى", icon: Zap },
      { step: "تنفيذ التفاعل اليومي", icon: CheckCircle },
      { step: "قياس وتحليل النتائج", icon: Clock }
    ],
    benefits: ["وصول أوسع للجمهور", "متابعين نشطين", "تفاعل حقيقي ومستمر"]
  },
  {
    title: "اختبار تجربة المستخدم",
    description: "نقوم باختبار شامل لتجربة المستخدم قبل إطلاق مشروعك لاكتشاف نقاط الضعف وتحسينها، مما يضمن تجربة مستخدم سلسة وناجحة.",
    icon: Layout,
    features: ["اختبارات شاملة", "تحليل البيانات", "تحسين التحويلات", "تقارير مفصلة"],
    process: [
      { step: "اختبار الوظائف الأساسية", icon: Target },
      { step: "تحليل سلوك المستخدم", icon: Zap },
      { step: "تحديد نقاط التحسين", icon: CheckCircle },
      { step: "تنفيذ التوصيات", icon: Clock }
    ],
    benefits: ["تجربة مستخدم محسنة", "تقليل معدلات الخروج", "زيادة التحويلات"]
  },
  {
    title: "تقييمات المتاجر الإلكترونية",
    description: "تحسين تصنيف متجرك الإلكتروني بتقييمات حقيقية ومؤثرة تزيد من ثقة العملاء وتعزز المبيعات.",
    icon: Globe,
    features: ["تقييمات المنتجات", "مراجعات حقيقية", "زيادة المبيعات", "بناء السمعة"],
    process: [
      { step: "تحليل المتجر الحالي", icon: Target },
      { step: "تطوير خطة التقييم", icon: Zap },
      { step: "تنفيذ التقييمات", icon: CheckCircle },
      { step: "تحسين الأداء", icon: Clock }
    ],
    benefits: ["زيادة المبيعات", "تحسين السمعة", "جذب عملاء جدد"]
  },
  {
    title: "إدارة السمعة الرقمية",
    description: "خدمة شاملة لمراقبة وتحسين السمعة الرقمية لعلامتك التجارية عبر جميع المنصات الرقمية.",
    icon: Shield,
    features: ["مراقبة التقييمات", "ردود على التعليقات", "تحسين الصورة", "إدارة الأزمات"],
    process: [
      { step: "تحليل السمعة الحالية", icon: Target },
      { step: "تطوير استراتيجية التحسين", icon: Zap },
      { step: "تنفيذ خطة التحسين", icon: CheckCircle },
      { step: "مراقبة مستمرة", icon: Clock }
    ],
    benefits: ["صورة إيجابية", "ثقة العملاء", "حماية السمعة"]
  }
];

const stats = [
  { value: "25,000", label: "مختبر نشط", suffix: "+", icon: Users },
  { value: "50,000", label: "تقييم مكتمل", suffix: "+", icon: Star },
  { value: "98", label: "رضا العملاء", suffix: "%", icon: ThumbsUp },
  { value: "4.9", label: "تقييم المنصة", suffix: "/5", icon: BarChart3 }
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Services Header */}
      <section className="py-16 bg-white border-b border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4" dir="rtl">
              خدماتنا
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed" dir="rtl">
              نقدم مجموعة متكاملة من خدمات التقييم والاختبار الاحترافية التي تساعد في تحسين وجودك الرقمي 
              وبناء سمعة قوية لعلامتك التجارية
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg border border-gray-200">
                  <IconComponent className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <div className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-gray-600 text-sm" dir="rtl">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <FadeInSection key={index} delay={index * 0.1}>
                  <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full hover:border-gray-300 transition-all duration-200">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Service Header */}
                      <div className="flex items-center gap-4 mb-4" dir="rtl">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900" dir="rtl">
                            {service.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1" dir="rtl">
                        {service.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-semibold text-gray-900" dir="rtl">المميزات:</h4>
                        <div className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-700 text-sm" dir="rtl">
                              <CheckCircle className="w-4 h-4 text-green-500 ml-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Process */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900" dir="rtl">خطوات العمل:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {service.process.map((step, idx) => {
                            const StepIcon = step.icon;
                            return (
                              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                <StepIcon className="w-3 h-3 flex-shrink-0" />
                                <span>{step.step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4" dir="rtl">
                كيف نعمل
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto" dir="rtl">
                نتبع منهجية واضحة لضمان تقديم خدمات عالية الجودة تحقق أهداف عملائنا
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "التحليل", description: "نقوم بتحليل دقيق لاحتياجاتك وأهدافك" },
              { step: "التخطيط", description: "نضع خطة عمل مفصلة ومخصصة" },
              { step: "التنفيذ", description: "ننفذ الخدمة بدقة واحترافية" },
              { step: "المتابعة", description: "نقدم تقارير ومتابعة مستمرة" }
            ].map((item, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center mx-auto mb-4 text-lg font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">{item.step}</h3>
                  <p className="text-gray-600 text-sm" dir="rtl">{item.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}