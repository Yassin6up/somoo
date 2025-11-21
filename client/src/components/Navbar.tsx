import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, UserPlus, User, LogOut, LayoutDashboard, Briefcase, Building2, Search, BookOpen } from "lucide-react";
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
      setIsScrolled(window.scrollY > 20);
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

  const getUserTypeBadge = () => {
    if (userType === "freelancer") {
      return (
        <Badge 
          variant="secondary" 
          className="text-xs gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-2 py-1"
          data-testid="badge-user-type"
        >
          <Briefcase className="h-3 w-3" />
          مستقل
        </Badge>
      );
    } else if (userType === "product_owner") {
      return (
        <Badge 
          variant="secondary" 
          className="text-xs gap-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 px-2 py-1"
          data-testid="badge-user-type"
        >
          <Building2 className="h-3 w-3" />
          صاحب مشروع
        </Badge>
      );
    }
    return null;
  };

  const navItemClass = "px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 cursor-pointer relative group";
  const mobileNavItemClass = "block px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 cursor-pointer";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50" 
        : "bg-transparent"
    }`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Main Navigation */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group" data-testid="link-home">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    سُمُوّ
                  </div>
                  <div className="text-xs text-gray-500 font-light -mt-1">منصة العمل الحر</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/">
                <div className={navItemClass} data-testid="link-home-nav">
                  الرئيسية
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              </Link>
              <Link href="/services">
                <div className={navItemClass} data-testid="link-services-nav">
                  الخدمات
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              </Link>
              <Link href="/groups">
                <div className={navItemClass} data-testid="link-groups-nav">
                  الجروبات
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              </Link>
              <Link href="/projects">
                <div className={navItemClass} data-testid="link-projects-nav">
                  المشاريع
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              </Link>
              <Link href="/freelancers">
                <div className={navItemClass} data-testid="link-freelancers-nav">
                  المستقلين
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Section - Search, User Profile, CTA */}
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ابحث عن خدمات، مشاريع..." 
                  className="w-64 pr-10 pl-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-300/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* User Profile / Auth Buttons */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NotificationsDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-3 hover:bg-white/50 active:scale-95 rounded-2xl px-4 py-2 transition-all duration-300 border border-transparent hover:border-gray-300/50 group" data-testid="button-user-menu">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-gray-900">{user.fullName}</span>
                          <span className="text-xs text-gray-500">{userType === 'freelancer' ? 'مستقل' : 'صاحب مشروع'}</span>
                        </div>
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg group-hover:ring-blue-100 transition-all duration-300" data-testid="avatar-user">
                            <AvatarImage src={user.profileImage} alt={user.fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md" data-testid="avatar-badge-container">
                            {userType === "freelancer" ? (
                              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-1 rounded-full">
                                <Briefcase className="h-2 w-2 text-white" data-testid="icon-freelancer" />
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-1 rounded-full">
                                <Building2 className="h-2 w-2 text-white" data-testid="icon-product-owner" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-xl border border-gray-200/60 backdrop-blur-xl">
                      <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <div className="pt-1">{getUserTypeBadge()}</div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate("/dashboard")} 
                        className="cursor-pointer rounded-xl m-1 transition-all duration-200 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50"
                        data-testid="menu-dashboard"
                      >
                        <LayoutDashboard className="ml-2 h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">لوحة التحكم</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate("/profile")} 
                        className="cursor-pointer rounded-xl m-1 transition-all duration-200 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50"
                        data-testid="menu-profile"
                      >
                        <User className="ml-2 h-4 w-4 text-purple-600" />
                        <span className="text-gray-700">الملف الشخصي</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="cursor-pointer rounded-xl m-1 transition-all duration-200 hover:bg-red-50 text-red-600"
                        data-testid="menu-logout"
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
                      className="rounded-2xl text-gray-700 hover:text-blue-600 font-medium transition-all duration-300"
                      data-testid="button-login-header"
                    >
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button 
                      variant="default" 
                      className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-6"
                      data-testid="button-signup"
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
              className="lg:hidden p-3 hover:bg-white/50 active:scale-95 rounded-2xl transition-all duration-300 border border-transparent hover:border-gray-300/50"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 space-y-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl">
            {/* Mobile Search */}
            <div className="px-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ابحث عن خدمات، مشاريع..." 
                  className="w-full pr-10 pl-4 py-3 bg-white border border-gray-300/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link href="/">
                <div className={mobileNavItemClass} data-testid="link-home-mobile">
                  الرئيسية
                </div>
              </Link>
              <Link href="/services">
                <div className={mobileNavItemClass} data-testid="link-services-mobile">
                  الخدمات
                </div>
              </Link>
              <Link href="/groups">
                <div className={mobileNavItemClass} data-testid="link-groups-mobile">
                  الجروبات
                </div>
              </Link>
              <Link href="/projects">
                <div className={mobileNavItemClass} data-testid="link-projects-mobile">
                  المشاريع
                </div>
              </Link>
              <Link href="/freelancers">
                <div className={mobileNavItemClass} data-testid="link-freelancers-mobile">
                  المستقلين
                </div>
              </Link>
            </div>
            
            {/* Mobile User Section */}
            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50" data-testid="mobile-user-info">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={user.profileImage} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md" data-testid="avatar-badge-container-mobile">
                        {userType === "freelancer" ? (
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-1 rounded-full">
                            <Briefcase className="h-2 w-2 text-white" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-1 rounded-full">
                            <Building2 className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="mt-2">{getUserTypeBadge()}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-2xl justify-start border-gray-300 hover:border-blue-500 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50 transition-all duration-300" 
                    onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} 
                    data-testid="button-dashboard-mobile"
                  >
                    <LayoutDashboard className="ml-2 h-4 w-4 text-blue-600" />
                    لوحة التحكم
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-2xl justify-start border-gray-300 hover:border-blue-500 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50 transition-all duration-300" 
                    onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} 
                    data-testid="button-profile-mobile"
                  >
                    <User className="ml-2 h-4 w-4 text-purple-600" />
                    الملف الشخصي
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-2xl justify-start text-red-600 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-2xl border-gray-300 hover:border-blue-500 hover:bg-gradient-to-l hover:from-blue-50 hover:to-purple-50 transition-all duration-300" 
                      data-testid="button-login-mobile"
                    >
                      <LogIn className="ml-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/role-selection">
                    <Button 
                      variant="default" 
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0" 
                      data-testid="button-signup-mobile"
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