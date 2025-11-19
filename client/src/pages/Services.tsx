import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MapPin, Star, Users, MessageSquare, TrendingUp, Search, Target, Palette, X, CheckCircle, Clock, Zap, Target as TargetIcon } from "lucide-react";

// Import images
import googleMapsCard from "@assets/generated_images/Google_Maps_Reviews_Card_d9574a88.png";
import appReviewsCard from "@assets/generated_images/App_Reviews_Card_1c7a7d75.png";
import uxTestingCard from "@assets/generated_images/UX_Testing_Card_843ea192.png";
import socialMediaCard from "@assets/generated_images/Social_Media_Engagement_Card_ced69d5b.png";

const services = [
  {
    title: "تقييمات خرائط Google Map",
    description: "رفع تقييم نشاطك التجاري على الخرائط بطريقة احترافية مبنية على مخاطبة الفئة المستهدفة بذكاء.",
    image: googleMapsCard,
    icon: MapPin,
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
    title: "تقييمات تطبيقات Android و iOS",
    description: "تحسين تقييم تطبيقك عبر مراجعات حقيقية تساعد في رفع الثقة وزيادة التحميلات.",
    image: appReviewsCard,
    icon: Star,
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
    title: "اختبار تجربة المستخدم قبل الإطلاق",
    description: "تحليل شامل لتجربة المستخدم وتصميم رحلة واضحة تساعدك على نجاح مشروعك قبل طرحه للجمهور.",
    image: uxTestingCard,
    icon: Users,
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
    title: "التفاعل مع منشورات السوشيال ميديا",
    description: "زيادة نسبة الوصول والمتابعة من خلال فريق متخصص بالتفاعل الحقيقي.",
    image: socialMediaCard,
    icon: MessageSquare,
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
    title: "تحسين محركات البحث (SEO)",
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

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" dir="rtl">
            خدماتنا <span className="text-blue-600">المتميزة</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10" dir="rtl">
            نقدم مجموعة متكاملة من الخدمات الاحترافية لتحسين وجودك الرقمي وزيادة تفاعل العملاء مع علامتك التجارية
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300">
              ابدأ الآن
            </Button>
            <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300">
              تعرف أكثر
            </Button>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" dir="rtl">
              خدماتنا <span className="text-blue-600">الرئيسية</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" dir="rtl">
              نقدم حلولاً رقمية متكاملة تساعدك على النمو والتميز في عالم الأعمال الرقمية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6 flex flex-col h-full text-white">
                    {/* Icon and Image Section */}
                    <div className="flex-1 flex flex-col items-center mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-full h-40 relative mb-4 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center p-4">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold leading-tight text-center" dir="rtl">
                        {service.title}
                      </h3>
                      
                      <p className="text-white/90 text-sm leading-relaxed text-center flex-1" dir="rtl">
                        {service.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-2 mt-2">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-white/80 text-sm" dir="rtl">
                            <div className="w-2 h-2 rounded-full bg-white ml-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Learn More Button */}
                      <div className="flex justify-center pt-4 mt-auto">
                        <div className="text-white/90 text-sm bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
                          يتعلّم أكثر
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" dir="rtl">
              أرقام <span className="text-blue-600">تدل على نجاحنا</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "500+", label: "مشروع مكتمل" },
              { number: "98%", label: "عملاء راضون" },
              { number: "50+", label: "خبير محترف" },
              { number: "10+", label: "سنوات خبرة" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-lg" dir="rtl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" dir="rtl">
              خدمات <span className="text-blue-600">إضافية</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" dir="rtl">
              نقدم مجموعة واسعة من الخدمات المتخصصة لتلبية جميع احتياجاتك الرقمية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="group cursor-pointer">
                  <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-6 border-0 h-full transition-all duration-300 hover:shadow-xl hover:scale-105 text-white`}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-4">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3" dir="rtl">{service.title}</h3>
                    <p className="text-white/90 text-sm" dir="rtl">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-5xl mx-auto text-center rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" dir="rtl">
              مستعد لبدء مشروعك؟
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto" dir="rtl">
              اتصل بنا اليوم واحصل على استشارة مجانية لتحسين وجودك الرقمي وزيادة مبيعاتك
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300">
                اتصل بنا الآن
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300">
                اطلب عرض سعر
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 flex-1" dir="rtl">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <selectedService.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900" dir="rtl">
                    {selectedService.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image */}
              <div className="w-full h-48 mb-6 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" dir="rtl">الوصف الكامل</h3>
                <p className="text-gray-700 leading-relaxed" dir="rtl">
                  {selectedService.fullDescription}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" dir="rtl">المميزات الرئيسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2" dir="rtl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" dir="rtl">خطوات العمل</h3>
                <div className="space-y-3">
                  {selectedService.process.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" dir="rtl">
                        <StepIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">{step.step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" dir="rtl">الفوائد المتوقعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedService.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2" dir="rtl">
                      <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  onClick={() => setSelectedService(null)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}