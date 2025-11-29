import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Briefcase } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4" data-testid="text-role-title">
              اختر نوع حسابك
            </h1>
            <p className="text-lg text-gray-600">
              هل أنت مستقل تبحث عن فرص أم صاحب منتج تحتاج لاختباره؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/freelancer-signup">
              <div 
                className="border border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group"
                data-testid="button-freelancer"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">مستقل محترف</h3>
                <p className="text-gray-600">
                  انضم كفريلانسر وابدأ في تقديم خدماتك للعملاء
                </p>
              </div>
            </Link>

            <Link href="/product-owner-signup">
              <div 
                className="border border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group"
                data-testid="button-owner"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">صاحب منتج رقمي</h3>
                <p className="text-gray-600">
                  اختر محترفين لاختبار وتقييم منتجاتك الرقمية
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-gray-900 font-medium hover:underline" data-testid="link-login">
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