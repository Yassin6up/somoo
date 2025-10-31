import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelection() {

  const freelancerFeatures = [
    "اختبر تطبيقات ومواقع حقيقية",
    "اكتب تقييمات صادقة ومدفوعة",
    "اكسب دخل إضافي بمرونة",
    "طور مهاراتك في الاختبار"
  ];

  const ownerFeatures = [
    "اختبر أداء منتجك بشكل احترافي",
    "احصل على تقييمات حقيقية ومثبتة",
    "حلّل تفاعل المستخدمين بذكاء",
    "زد انتشارك على السوشيال ميديا"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">ابدأ رحلتك معنا</span>
            </div>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-role-title">
              اختر نوع حسابك
            </h1>
            <p className="text-lg text-muted-foreground">
              هل أنت مستقل تبحث عن فرص أم صاحب منتج تحتاج لاختباره؟
            </p>
          </div>

          <Tabs 
            defaultValue="freelancer" 
            className="w-full" 
            dir="rtl"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted rounded-2xl h-auto" data-testid="tabs-list">
              <TabsTrigger 
                value="freelancer" 
                className="rounded-xl py-4 px-6 text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-testid="tab-freelancer"
              >
                <Users className="ml-2 h-5 w-5" />
                مستقل محترف
              </TabsTrigger>
              <TabsTrigger 
                value="owner" 
                className="rounded-xl py-4 px-6 text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-testid="tab-owner"
              >
                <Briefcase className="ml-2 h-5 w-5" />
                صاحب منتج
              </TabsTrigger>
            </TabsList>

            <TabsContent value="freelancer" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-2xl shadow-lg border-primary/20" data-testid="card-freelancer">
                  <CardContent className="p-8 space-y-8">
                    <div className="text-center">
                      <motion.div 
                        className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Users className="h-12 w-12 text-primary" />
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold mb-3">مستقل محترف</h2>
                      <p className="text-lg text-muted-foreground">
                        انضم كمختبر وابدأ في كسب الدخل من اختبار التطبيقات والمواقع
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 text-primary">مميزات الحساب:</h3>
                      <ul className="space-y-3">
                        {freelancerFeatures.map((feature, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-base">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <Link href="/freelancer-signup">
                      <Button 
                        className="w-full rounded-2xl shadow-lg text-lg py-6" 
                        size="lg" 
                        data-testid="button-freelancer"
                      >
                        <Users className="ml-2 h-6 w-6" />
                        إنشاء حساب مستقل الآن
                      </Button>
                    </Link>

                    <p className="text-center text-sm text-muted-foreground">
                      لديك حساب بالفعل؟{" "}
                      <Link href="/login">
                        <a className="text-primary font-medium hover:underline" data-testid="link-login-freelancer">تسجيل الدخول</a>
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="owner" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-2xl shadow-lg border-primary/20" data-testid="card-owner">
                  <CardContent className="p-8 space-y-8">
                    <div className="text-center">
                      <motion.div 
                        className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Briefcase className="h-12 w-12 text-primary" />
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold mb-3">صاحب منتج رقمي</h2>
                      <p className="text-lg text-muted-foreground">
                        احصل على اختبارات وتقييمات احترافية لمنتجك الرقمي
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 text-primary">مميزات الحساب:</h3>
                      <ul className="space-y-3">
                        {ownerFeatures.map((feature, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-base">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <Link href="/product-owner-signup">
                      <Button 
                        className="w-full rounded-2xl shadow-lg text-lg py-6" 
                        size="lg" 
                        data-testid="button-owner"
                      >
                        <Briefcase className="ml-2 h-6 w-6" />
                        إنشاء حساب صاحب منتج الآن
                      </Button>
                    </Link>

                    <p className="text-center text-sm text-muted-foreground">
                      لديك حساب بالفعل؟{" "}
                      <Link href="/login">
                        <a className="text-primary font-medium hover:underline" data-testid="link-login-owner">تسجيل الدخول</a>
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
