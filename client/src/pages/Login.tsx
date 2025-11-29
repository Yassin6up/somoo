import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل تسجيل الدخول");
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Store token and user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", data.userType);
      
      // Dispatch custom event to update Navbar
      window.dispatchEvent(new Event("userLoggedIn"));
      
      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحبًا بعودتك إلى منصة سُمُوّ",
      });
      
      // Navigate based on user type
      if (data.userType === "product_owner") {
        navigate("/campaigns");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-8 px-4 mt-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">تسجيل الدخول</h1>
            <p className="text-gray-600">
              ادخل إلى حسابك في منصة سُمُوّ
            </p>
          </div>

          {/* Login Card */}
          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl text-center text-gray-900">تسجيل الدخول</CardTitle>
              <CardDescription className="text-center text-gray-600">
                ادخل بياناتك للوصول إلى حسابك
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="example@email.com" 
                              className="rounded-lg border-gray-300 focus:border-gray-400 pr-10" 
                              data-testid="input-email"
                              autoComplete="email"
                              name="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">كلمة المرور</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="password"
                              placeholder="••••••••" 
                              className="rounded-lg border-gray-300 focus:border-gray-400 pr-10" 
                              data-testid="input-password"
                              autoComplete="current-password"
                              name="password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-remember"
                              className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-700 cursor-pointer mt-0">
                            تذكرني
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <a 
                      href="#forgot-password" 
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      data-testid="link-forgot-password"
                    >
                      نسيت كلمة المرور؟
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      "جاري تسجيل الدخول..."
                    ) : (
                      <>
                        <LogIn className="ml-2 h-4 w-4" />
                        تسجيل الدخول
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-500">
                        أو
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      ليس لديك حساب؟{" "}
                      <Link href="/role-selection" className="text-gray-900 font-medium hover:underline" data-testid="link-signup">
                        أنشئ حسابًا جديدًا
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              بتسجيل الدخول، أنت توافق على{" "}
              <a href="#terms" className="text-gray-700 hover:underline" data-testid="link-terms">الشروط والأحكام</a>
              {" "}و{" "}
              <a href="#privacy" className="text-gray-700 hover:underline" data-testid="link-privacy">سياسة الخصوصية</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}