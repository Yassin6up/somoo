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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/freelancer-signup" component={FreelancerSignup} />
      <Route path="/product-owner-signup" component={ProductOwnerSignup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/freelancer-dashboard" component={FreelancerDashboard} />
      <Route path="/product-owner-dashboard" component={ProductOwnerDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/freelancers" component={Freelancers} />
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
