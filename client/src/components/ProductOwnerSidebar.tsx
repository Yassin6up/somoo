import {
  Home,
  FolderKanban,
  Clock,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "الرئيسية",
    url: "/product-owner-dashboard",
    icon: Home,
  },
  {
    title: "المشاريع",
    icon: FolderKanban,
    items: [
      { title: "جميع المشاريع", url: "/product-owner-dashboard/projects" },
      { title: "قيد التنفيذ", url: "/product-owner-dashboard/projects/active" },
      { title: "المكتملة", url: "/product-owner-dashboard/projects/completed" },
    ],
  },
  {
    title: "المدفوعات",
    url: "/product-owner-dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "طلباتي",
    url: "/product-owner-dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "الإعدادات",
    url: "/product-owner-dashboard/settings",
    icon: Settings,
  },
];

export function ProductOwnerSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary">
            لوحة التحكم - صاحب مشروع
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                
                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={item.items.some((subItem) => location === subItem.url)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid={`sidebar-${item.title}`}>
                            <item.icon className="ml-2" />
                            <span>{item.title}</span>
                            <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location === subItem.url}
                                  data-testid={`sidebar-sub-${subItem.title}`}
                                >
                                  <a href={subItem.url}>{subItem.title}</a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`sidebar-${item.title}`}
                    >
                      <a href={item.url}>
                        <item.icon className="ml-2" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
