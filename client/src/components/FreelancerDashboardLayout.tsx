import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FreelancerSidebar } from "@/components/FreelancerSidebar";

interface FreelancerDashboardLayoutProps {
  children: React.ReactNode;
}

export function FreelancerDashboardLayout({ children }: FreelancerDashboardLayoutProps) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full" dir="rtl">
        <div className="flex flex-col flex-1">
          <header className="flex items-center p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
        <FreelancerSidebar />
      </div>
    </SidebarProvider>
  );
}
