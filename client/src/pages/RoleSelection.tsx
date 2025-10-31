import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelection() {
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

          <div className="flex justify-center gap-4 flex-wrap">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/freelancer-signup">
                <Button 
                  variant="default"
                  className="rounded-full py-6 px-12 text-lg font-bold shadow-lg h-auto"
                  data-testid="button-freelancer"
                >
                  <Users className="ml-2 h-6 w-6" />
                  مستقل محترف
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/product-owner-signup">
                <Button 
                  variant="default"
                  className="rounded-full py-6 px-12 text-lg font-bold shadow-lg h-auto"
                  data-testid="button-owner"
                >
                  <Briefcase className="ml-2 h-6 w-6" />
                  صاحب منتج رقمي
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
