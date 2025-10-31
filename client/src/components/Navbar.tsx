import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, UserPlus, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [, navigate] = useLocation();

  const loadUserData = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserData();

    // Listen for storage events (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        loadUserData();
      }
    };

    // Listen for custom login event
    const handleLoginEvent = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleLoginEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleLoginEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    setUser(null);
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "م";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-xl transition-all cursor-pointer" data-testid="link-home">
              <div className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                سُمُوّ
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <div className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium cursor-pointer" data-testid="link-home-nav">
                الرئيسية
              </div>
            </Link>
            <Link href="/freelancers">
              <div className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium cursor-pointer" data-testid="link-freelancers-nav">
                المستقلين
              </div>
            </Link>
            <a href="#services" className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium" data-testid="link-services">
              الخدمات
            </a>
            <a href="#how-it-works" className="px-4 py-2 hover-elevate active-elevate-2 rounded-xl transition-all text-sm font-medium" data-testid="link-how-it-works">
              كيف تعمل
            </a>
          </div>

          {/* Desktop CTA Buttons / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-xl px-3 py-2" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8" data-testid="avatar-user">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.fullName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    لوحة التحكم
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="menu-logout">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-2xl" data-testid="button-login-header">
                    <LogIn className="ml-2 h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/role-selection">
                  <Button variant="default" className="rounded-2xl" data-testid="button-signup">
                    <UserPlus className="ml-2 h-4 w-4" />
                    إنشاء حساب
                  </Button>
                </Link>
              </>
            )}
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
              <div className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium cursor-pointer" data-testid="link-home-mobile">
                الرئيسية
              </div>
            </Link>
            <Link href="/freelancers">
              <div className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium cursor-pointer" data-testid="link-freelancers-mobile">
                المستقلين
              </div>
            </Link>
            <a href="#services" className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium" data-testid="link-services-mobile">
              الخدمات
            </a>
            <a href="#how-it-works" className="block px-4 py-2 hover-elevate active-elevate-2 rounded-xl text-sm font-medium" data-testid="link-how-it-works-mobile">
              كيف تعمل
            </a>
            
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" data-testid="mobile-user-info">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl justify-start" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} data-testid="button-dashboard-mobile">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    لوحة التحكم
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl justify-start" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} data-testid="button-profile-mobile">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl justify-start text-destructive" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} data-testid="button-logout-mobile">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full rounded-2xl" data-testid="button-login-mobile">
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button variant="default" className="w-full rounded-2xl" data-testid="button-signup-mobile">
                      <UserPlus className="ml-2 h-4 w-4" />
                      إنشاء حساب
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
