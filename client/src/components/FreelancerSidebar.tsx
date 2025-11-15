import { 
  Home, 
  ListTodo, 
  CheckSquare, 
  Users, 
  Wallet, 
  Download, 
  ShoppingBag, 
  Settings,
  ChevronDown
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
    url: "/freelancer-dashboard",
    icon: Home,
  },
  {
    title: "المهام",
    icon: ListTodo,
    items: [
      { title: "المهام المتاحة", url: "/freelancer-dashboard/tasks/available" },
      { title: "مهامي", url: "/freelancer-dashboard/tasks/my-tasks" },
    ],
  },
  {
    title: "الجروبات",
    url: "/groups",
    icon: Users,
  },
  {
    title: "المالية",
    icon: Wallet,
    items: [
      { title: "المحفظة", url: "/freelancer-dashboard/wallet" },
      { title: "السحوبات", url: "/freelancer-dashboard/withdrawals" },
    ],
  },
  {
    title: "الطلبات الواردة",
    url: "/freelancer-dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "الإعدادات",
    url: "/freelancer-dashboard/settings",
    icon: Settings,
  },
];

export function FreelancerSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary">
            لوحة التحكم - مستقل
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
