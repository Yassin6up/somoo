import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    if (userType === "freelancer") {
      navigate("/freelancer-dashboard");
    } else if (userType === "product_owner") {
      navigate("/product-owner-dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}
