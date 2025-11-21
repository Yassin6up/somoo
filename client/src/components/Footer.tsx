import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-200/50 mt-auto relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg">س</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  سُمُوّ
                </div>
                <div className="text-sm text-gray-500 -mt-1">منصة العمل الحر</div>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed max-w-md">
              منصة رائدة تربط المستقلين المحترفين بأصحاب المنتجات الرقمية، 
              لنقدم معًا حلولاً إبداعية تلبي طموحاتك وتتجاوز توقعاتك.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">info@somo.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="text-sm">+966 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="text-sm">المملكة العربية السعودية</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 pt-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white border border-gray-300 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white border border-gray-300 rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:border-sky-500 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white border border-gray-300 rounded-2xl flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white border border-gray-300 rounded-2xl flex items-center justify-center hover:bg-blue-700 hover:border-blue-700 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg relative inline-block">
                الروابط السريعة
                <div className="absolute bottom-0 right-0 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-footer-home">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      الرئيسية
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/services">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-footer-services">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      الخدمات
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/projects">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      المشاريع
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/freelancers">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      المستقلين
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg relative inline-block">
                قانوني
                <div className="absolute bottom-0 right-0 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacy-policy">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-privacy">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      سياسة الخصوصية
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-terms">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      الشروط والأحكام
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-refund">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      سياسة الاسترداد
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg relative inline-block">
                الدعم
                <div className="absolute bottom-0 right-0 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/help">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-support">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      مركز المساعدة
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium" data-testid="link-contact">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      تواصل معنا
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <span className="text-gray-600 hover:text-blue-600 transition-all duration-300 cursor-pointer flex items-center gap-2 group text-sm font-medium">
                      <ArrowLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      الأسئلة الشائعة
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-300/50">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-600 text-sm">
                © {currentYear} <span className="font-semibold text-gray-900">سُمُوّ</span>. جميع الحقوق محفوظة.
              </p>
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/sitemap">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-xs font-medium">
                  خريطة الموقع
                </span>
              </Link>
              <Link href="/accessibility">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-xs font-medium">
                  إمكانية الوصول
                </span>
              </Link>
              <Link href="/cookies">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-xs font-medium">
                  سياسة الكوكيز
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}