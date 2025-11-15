import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import googleMapsCard from "@assets/generated_images/Google_Maps_Reviews_Card_d9574a88.png";
import appReviewsCard from "@assets/generated_images/App_Reviews_Card_1c7a7d75.png";
import uxTestingCard from "@assets/generated_images/UX_Testing_Card_843ea192.png";
import socialMediaCard from "@assets/generated_images/Social_Media_Engagement_Card_ced69d5b.png";

const services = [
  {
    title: "تقييمات خرائط Google Map",
    description: "رفع تقييم نشاطك التجاري على الخرائط بطريقة احترافية مبنية على مخاطبة الفئة المستهدفة بذكاء.",
    image: googleMapsCard,
    gradient: "from-[#0a1628] to-[#1a2844]",
  },
  {
    title: "تقييمات تطبيقات Android و iOS",
    description: "تحسين تقييم تطبيقك عبر مراجعات حقيقية تساعد في رفع الثقة وزيادة التحميلات.",
    image: appReviewsCard,
    gradient: "from-[#1e3a8a] to-[#2563eb]",
  },
  {
    title: "اختبار تجربة المستخدم قبل الإطلاق",
    description: "تحليل شامل لتجربة المستخدم وتصميم رحلة واضحة تساعدك على نجاح مشروعك قبل طرحه للجمهور.",
    image: uxTestingCard,
    gradient: "from-[#2563eb] to-[#3b82f6]",
  },
  {
    title: "التفاعل مع منشورات السوشيال ميديا",
    description: "زيادة نسبة الوصول والمتابعة من خلال فريق متخصص بالتفاعل الحقيقي.",
    image: socialMediaCard,
    gradient: "from-[#3b82f6] to-[#60a5fa]",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712]">
      <Navbar />
      
      <main className="flex-1 py-16 px-4" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              خدماتنا المتميزة
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات الاحترافية لتحسين وجودك الرقمي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${service.gradient} border-none shadow-2xl rounded-3xl overflow-hidden hover-elevate transition-all duration-300`}
                data-testid={`card-service-${index}`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1 flex flex-col items-center justify-center mb-6">
                    <div className="w-full aspect-square relative mb-6">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-contain"
                        data-testid={`img-service-${index}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white leading-tight text-center">
                      {service.title}
                    </h3>
                    
                    <p className="text-white/80 text-sm leading-relaxed text-center min-h-[4.5rem]">
                      {service.description}
                    </p>

                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        className="border-2 border-white/80 text-white bg-transparent hover:bg-white/10 hover:border-white rounded-full px-8 py-2 font-semibold transition-all duration-300"
                        data-testid={`button-learn-more-${index}`}
                      >
                        يتعلّم أكثر
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
