import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RoleSelection from "@/pages/RoleSelection";
import FreelancerSignup from "@/pages/FreelancerSignup";
import ProductOwnerSignup from "@/pages/ProductOwnerSignup";
import Dashboard from "@/pages/Dashboard";
import FreelancerDashboard from "@/pages/FreelancerDashboard";
import ProductOwnerDashboard from "@/pages/ProductOwnerDashboard";
import Login from "@/pages/Login";
import Campaigns from "@/pages/Campaigns";
import Freelancers from "@/pages/Freelancers";
import Profile from "@/pages/Profile";
import Groups from "@/pages/Groups";
import CreateGroup from "@/pages/CreateGroup";
import GroupDetails from "@/pages/GroupDetails";
import Projects from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import MyTasks from "@/pages/MyTasks";
import PurchaseService from "@/pages/PurchaseService";
import { FreelancerDashboardLayout } from "@/components/FreelancerDashboardLayout";
import FreelancerOverview from "@/pages/freelancer-dashboard/Overview";
import AvailableTasks from "@/pages/freelancer-dashboard/AvailableTasks";
import MyTasksPage from "@/pages/freelancer-dashboard/MyTasks";
import WalletPage from "@/pages/freelancer-dashboard/Wallet";
import WithdrawalsPage from "@/pages/freelancer-dashboard/Withdrawals";
import OrdersPage from "@/pages/freelancer-dashboard/Orders";
import SettingsPage from "@/pages/freelancer-dashboard/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/freelancer-signup" component={FreelancerSignup} />
      <Route path="/product-owner-signup" component={ProductOwnerSignup} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Freelancer Dashboard with Sidebar */}
      <Route path="/freelancer-dashboard">
        {() => (
          <FreelancerDashboardLayout>
            <FreelancerOverview />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/tasks/available">
        {() => (
          <FreelancerDashboardLayout>
            <AvailableTasks />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/tasks/my-tasks">
        {() => (
          <FreelancerDashboardLayout>
            <MyTasksPage />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/wallet">
        {() => (
          <FreelancerDashboardLayout>
            <WalletPage />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/withdrawals">
        {() => (
          <FreelancerDashboardLayout>
            <WithdrawalsPage />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/orders">
        {() => (
          <FreelancerDashboardLayout>
            <OrdersPage />
          </FreelancerDashboardLayout>
        )}
      </Route>
      <Route path="/freelancer-dashboard/settings">
        {() => (
          <FreelancerDashboardLayout>
            <SettingsPage />
          </FreelancerDashboardLayout>
        )}
      </Route>

      <Route path="/product-owner-dashboard" component={ProductOwnerDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/freelancers" component={Freelancers} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/create" component={CreateGroup} />
      <Route path="/groups/:id" component={GroupDetails} />
      <Route path="/purchase/:groupId" component={PurchaseService} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/create" component={CreateProject} />
      <Route path="/my-tasks" component={MyTasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
