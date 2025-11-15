import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProductOwnerSidebar } from "@/components/ProductOwnerSidebar";
import { Navbar } from "@/components/Navbar";

interface ProductOwnerDashboardLayoutProps {
  children: React.ReactNode;
}

export function ProductOwnerDashboardLayout({ children }: ProductOwnerDashboardLayoutProps) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex w-full">
          <ProductOwnerSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
