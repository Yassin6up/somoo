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
import GroupCommunity from "@/pages/GroupCommunity";
import ChatWithLeader from "@/pages/ChatWithLeader";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
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
import FreelancerConversations from "@/pages/freelancer-dashboard/Conversations";
import FreelancerNotifications from "@/pages/freelancer-dashboard/Notifications";
import { ProductOwnerDashboardLayout } from "@/components/ProductOwnerDashboardLayout";
import ProductOwnerOverview from "@/pages/product-owner-dashboard/Overview";
import ProductOwnerProjects from "@/pages/product-owner-dashboard/Projects";
import ActiveProjects from "@/pages/product-owner-dashboard/ActiveProjects";
import CompletedProjects from "@/pages/product-owner-dashboard/CompletedProjects";
import ProductOwnerOrders from "@/pages/product-owner-dashboard/Orders";
import PaymentsPage from "@/pages/product-owner-dashboard/Payments";
import ProductOwnerSettings from "@/pages/product-owner-dashboard/Settings";
import ProductOwnerConversations from "@/pages/product-owner-dashboard/Conversations";
import ProductOwnerNotifications from "@/pages/product-owner-dashboard/Notifications";
import FreelancerInstructions from "@/pages/FreelancerInstructions";
import ProductOwnerInstructions from "@/pages/ProductOwnerInstructions";
import Services from "@/pages/Services";
import TermsConditions from "@/pages/TermsConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import AdminLogin from "@/pages/AdminLogin";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import CreateAdminUser from "@/pages/admin/CreateUser";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/login" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/freelancer-signup" component={FreelancerSignup} />
      <Route path="/freelancer-instructions" component={FreelancerInstructions} />
      <Route path="/product-owner-signup" component={ProductOwnerSignup} />
      <Route path="/product-owner-instructions" component={ProductOwnerInstructions} />
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
      <Route path="/freelancer-dashboard/conversations">
        {() => (
          <FreelancerDashboardLayout>
            <FreelancerConversations />
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
      <Route path="/freelancer-dashboard/notifications">
        {() => (
          <FreelancerDashboardLayout>
            <FreelancerNotifications />
          </FreelancerDashboardLayout>
        )}
      </Route>

      {/* Product Owner Dashboard with Sidebar */}
      <Route path="/product-owner-dashboard">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerOverview />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/projects">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerProjects />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/projects/active">
        {() => (
          <ProductOwnerDashboardLayout>
            <ActiveProjects />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/projects/completed">
        {() => (
          <ProductOwnerDashboardLayout>
            <CompletedProjects />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/payments">
        {() => (
          <ProductOwnerDashboardLayout>
            <PaymentsPage />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/orders">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerOrders />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/settings">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerSettings />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/notifications">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerNotifications />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/product-owner-dashboard/conversations">
        {() => (
          <ProductOwnerDashboardLayout>
            <ProductOwnerConversations />
          </ProductOwnerDashboardLayout>
        )}
      </Route>
      <Route path="/profile" component={Profile} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/freelancers" component={Freelancers} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/create" component={CreateGroup} />
      <Route path="/groups/:id/community" component={GroupCommunity} />
      <Route path="/groups/:id/chat" component={ChatWithLeader} />
      <Route path="/groups/:id" component={GroupDetails} />
      <Route path="/purchase/:groupId" component={PurchaseService} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/create" component={CreateProject} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route path="/my-tasks" component={MyTasks} />
      
      {/* Admin Dashboard Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => (
          <AdminDashboardLayout>
            <AdminDashboard />
          </AdminDashboardLayout>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminDashboardLayout>
            <AdminUsers />
          </AdminDashboardLayout>
        )}
      </Route>
      <Route path="/admin/users/create">
        {() => (
          <AdminDashboardLayout>
            <CreateAdminUser />
          </AdminDashboardLayout>
        )}
      </Route>

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
