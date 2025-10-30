import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-xl transition-all" data-testid="link-home">
              <div className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                سُمُوّ
              </div>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <a className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium" data-testid="link-home-nav">
                الرئيسية
              </a>
            </Link>
            <Link href="#services">
              <a className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium" data-testid="link-services">
                الخدمات
              </a>
            </Link>
            <Link href="#how-it-works">
              <a className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium" data-testid="link-how-it-works">
                كيف تعمل
              </a>
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/role-selection">
              <Button variant="outline" className="rounded-2xl" data-testid="button-signup">
                إنشاء حساب
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover-elevate active-elevate-2 rounded-xl"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            <Link href="/">
              <a className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium" data-testid="link-home-mobile">
                الرئيسية
              </a>
            </Link>
            <Link href="#services">
              <a className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium" data-testid="link-services-mobile">
                الخدمات
              </a>
            </Link>
            <Link href="#how-it-works">
              <a className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium" data-testid="link-how-it-works-mobile">
                كيف تعمل
              </a>
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/role-selection">
                <Button variant="default" className="w-full rounded-2xl" data-testid="button-signup-mobile">
                  إنشاء حساب
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
