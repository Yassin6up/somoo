import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
              سُمُوّ
            </div>
            <p className="text-sm text-muted-foreground">
              منصة تربط المستقلين المحترفين بأصحاب المنتجات الرقمية
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">الروابط السريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-home">
                    الرئيسية
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#services">
                  <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-services">
                    الخدمات
                  </a>
                </Link>
              </li>
              <li>
                <Link href="#how-it-works">
                  <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
                    كيف تعمل
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">قانوني</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                  الشروط والأحكام
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">الدعم</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#support" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-support">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} سُمُوّ. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
