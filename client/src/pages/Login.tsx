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
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">مرحبًا بعودتك</span>
            </div>
            <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
            <p className="text-muted-foreground">
              ادخل إلى حسابك في منصة سُمُوّ
            </p>
          </div>

          {/* Login Card */}
          <Card className="rounded-2xl shadow-xl border-2">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
              <CardDescription className="text-center">
                ادخل بياناتك للوصول إلى حسابك
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="example@email.com" 
                            className="rounded-xl h-11" 
                            data-testid="input-email"
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          كلمة المرور
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="••••••••" 
                            className="rounded-xl h-11" 
                            data-testid="input-password"
                          />
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
                            />
                          </FormControl>
                          <FormLabel className="text-sm cursor-pointer mt-0">
                            تذكرني
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <a 
                      href="#forgot-password" 
                      className="text-sm text-primary hover:underline"
                      data-testid="link-forgot-password"
                    >
                      نسيت كلمة المرور؟
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full rounded-xl h-11 text-base"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      "جاري تسجيل الدخول..."
                    ) : (
                      <>
                        <LogIn className="ml-2 h-5 w-5" />
                        تسجيل الدخول
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">
                        أو
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      ليس لديك حساب؟{" "}
                      <Link href="/role-selection">
                        <a className="text-primary font-semibold hover:underline" data-testid="link-signup">
                          أنشئ حسابًا جديدًا
                        </a>
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              بتسجيل الدخول، أنت توافق على{" "}
              <a href="#terms" className="text-primary hover:underline" data-testid="link-terms">الشروط والأحكام</a>
              {" "}و{" "}
              <a href="#privacy" className="text-primary hover:underline" data-testid="link-privacy">سياسة الخصوصية</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
