import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, UserPlus, User, LogOut, LayoutDashboard, Briefcase, Building2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
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
  const [userType, setUserType] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadUserData = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const type = localStorage.getItem("userType");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setUserType(type);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setUser(null);
        setUserType(null);
      }
    } else {
      setUser(null);
      setUserType(null);
    }
  };

  useEffect(() => {
    loadUserData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token" || e.key === "userType") {
        loadUserData();
      }
    };

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

  const navItemClass = "px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer";
  const mobileNavItemClass = "block px-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/80 backdrop-blur-md border-b border-gray-200" 
        : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="text-xl font-semibold text-gray-900">سُمُوّ</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <div className={navItemClass} data-testid="link-home-nav">
                الرئيسية
              </div>
            </Link>
            <Link href="/services">
              <div className={navItemClass} data-testid="link-services-nav">
                الخدمات
              </div>
            </Link>
            <Link href="/groups">
              <div className={navItemClass} data-testid="link-projects-nav">
                جروبات 
              </div>
            </Link>
            <Link href="/freelancers">
              <div className={navItemClass} data-testid="link-freelancers-nav">
                المستقلين
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ابحث..." 
                  className="w-48 pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* User Profile / Auth */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <NotificationsDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors duration-200" data-testid="button-user-menu">
                        <Avatar className="h-8 w-8 border border-gray-200">
                          <AvatarImage src={user.profileImage} alt={user.fullName} />
                          <AvatarFallback className="bg-gray-900 text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-gray-100 text-gray-600 border-0"
                          >
                            {userType === 'freelancer' ? 'مستقل' : 'صاحب مشروع'}
                          </Badge>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border border-gray-200">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate("/dashboard")} 
                        className="cursor-pointer rounded-lg"
                      >
                        <LayoutDashboard className="ml-2 h-4 w-4" />
                        <span>لوحة التحكم</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate("/profile")} 
                        className="cursor-pointer rounded-lg"
                      >
                        <User className="ml-2 h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="cursor-pointer rounded-lg text-red-600"
                      >
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="rounded-lg text-gray-600 hover:text-gray-900"
                    >
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button 
                      variant="default" 
                      className="rounded-lg bg-gray-900 hover:bg-gray-800 border-0"
                    >
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
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 bg-white">
            {/* Mobile Search */}
            <div className="px-4 pb-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ابحث..." 
                  className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <Link href="/">
              <div className={mobileNavItemClass}>الرئيسية</div>
            </Link>
            <Link href="/services">
              <div className={mobileNavItemClass}>الخدمات</div>
            </Link>
            <Link href="/groups">
              <div className={mobileNavItemClass}>جروبات </div>
            </Link>
            <Link href="/freelancers">
              <div className={mobileNavItemClass}>المستقلين</div>
            </Link>

            {/* Mobile User Section */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback className="bg-gray-900 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-lg" 
                    onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    لوحة التحكم
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-lg" 
                    onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                  >
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-lg text-red-600" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-lg" 
                    >
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button 
                      variant="default" 
                      className="w-full justify-start rounded-lg bg-gray-900 hover:bg-gray-800" 
                    >
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