import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Shield, 
  Briefcase, 
  Building2, 
  UsersRound, 
  FolderKanban, 
  ShoppingCart, 
  Wallet, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Bell,
  FileText,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "لوحة التحكم",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "المستخدمون الإداريون",
    url: "/admin/users",
    icon: UserCog,
  },
  {
    title: "الأدوار والصلاحيات",
    url: "/admin/roles",
    icon: Shield,
  },
  {
    title: "الفريلانسرز",
    url: "/admin/freelancers",
    icon: Briefcase,
  },
  {
    title: "أصحاب المنتجات",
    url: "/admin/product-owners",
    icon: Building2,
  },
  {
    title: "الجروبات",
    url: "/admin/groups",
    icon: UsersRound,
  },
  {
    title: "المشاريع",
    url: "/admin/projects",
    icon: FolderKanban,
  },
  {
    title: "الطلبات",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "السحوبات",
    url: "/admin/withdrawals",
    icon: Wallet,
  },
  {
    title: "المدفوعات",
    url: "/admin/payments",
    icon: DollarSign,
  },
  {
    title: "التقارير",
    url: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "الإشعارات",
    url: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "السجلات",
    url: "/admin/logs",
    icon: FileText,
  },
  {
    title: "الإعدادات",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً",
    });
    
    setLocation("/admin/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Sidebar side="right">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">منصة سُمُوّ</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, '-')}`}>
                      <item.icon className="ml-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
