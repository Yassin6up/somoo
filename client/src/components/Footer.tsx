import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="text-xl font-semibold text-gray-900">سُمُوّ</div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              منصة رائدة تربط المستقلين المحترفين بأصحاب المنتجات الرقمية، 
              لنقدم معًا حلولاً إبداعية تلبي طموحاتك.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="h-4 w-4" />
                <span>info@somo.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="h-4 w-4" />
                <span>+966 123 456 789</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>المملكة العربية السعودية</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-2 pt-2">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Facebook className="h-3 w-3 text-gray-600" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Twitter className="h-3 w-3 text-gray-600" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Instagram className="h-3 w-3 text-gray-600" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <Linkedin className="h-3 w-3 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">الروابط السريعة</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-footer-home">
                      الرئيسية
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/services">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-footer-services">
                      الخدمات
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/projects">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm">
                      المشاريع
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/freelancers">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm">
                      المستقلين
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">قانوني</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-privacy">
                      سياسة الخصوصية
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-terms">
                      الشروط والأحكام
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-refund">
                      سياسة الاسترداد
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">الدعم</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-support">
                      مركز المساعدة
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm" data-testid="link-contact">
                      تواصل معنا
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <span className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm">
                      الأسئلة الشائعة
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-500 text-xs">
                © {currentYear} <span className="font-medium text-gray-700">سُمُوّ</span>. جميع الحقوق محفوظة.
              </p>
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-4 text-xs">
              <Link href="/sitemap">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                  خريطة الموقع
                </span>
              </Link>
              <Link href="/accessibility">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                  إمكانية الوصول
                </span>
              </Link>
              <Link href="/cookies">
                <span className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
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