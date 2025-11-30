import {
  Home,
  ListTodo,
  CheckSquare,
  Users,
  Wallet,
  Download,
  ShoppingBag,
  Settings,
  ChevronDown,
  MessageCircle,
  Bell,
  Briefcase,
} from "lucide-react";
import { useLocation, Link } from "wouter";
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
      { title: "تتبع الإنجاز", url: "/freelancer-dashboard/tasks/progress" },
    ],
  },
  {
    title: "الجروبات",
    icon: Users,
    items: [
      { title: "تصفح المجموعات", url: "/groups" },
      { title: "مجموعاتي", url: "/freelancer-dashboard/groups" },
    ],
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
    title: "المشاريع",
    url: "/projects",
    icon: Briefcase,
  },
  {
    title: "المحادثات",
    url: "/freelancer-dashboard/conversations",
    icon: MessageCircle,
  },
  {
    title: "الإشعارات",
    url: "/freelancer-dashboard/notifications",
    icon: Bell,
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
    <Sidebar side="right">
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
                                  <Link href={subItem.url}>{subItem.title}</Link>
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
                      <Link href={item.url}>
                        <item.icon className="ml-2" />
                        <span>{item.title}</span>
                      </Link>
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
