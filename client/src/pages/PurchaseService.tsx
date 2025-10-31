import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import type { Group } from "@shared/schema";

const SERVICE_TYPES = [
  { value: "google_play_reviews", label: "تقييم تطبيقات Google Play", price: 1 },
  { value: "ios_reviews", label: "تقييم تطبيقات iOS", price: 1 },
  { value: "website_reviews", label: "تقييم مواقع إلكترونية", price: 1 },
  { value: "ux_testing", label: "اختبار تجربة المستخدم UX", price: 1 },
  { value: "software_testing", label: "اختبار أنظمة Software", price: 1 },
  { value: "social_media", label: "التفاعل مع السوشيال ميديا", price: 1 },
  { value: "google_maps", label: "تقييم خرائط Google Maps", price: 2 },
];

const PAYMENT_METHODS = [
  { value: "vodafone_cash", label: "فودافون كاش", icon: "📱" },
  { value: "etisalat_cash", label: "اتصالات كاش", icon: "📱" },
  { value: "orange_cash", label: "أورانج كاش", icon: "📱" },
  { value: "bank_card", label: "بطاقة بنكية", icon: "💳" },
];

export default function PurchaseService() {
  const [, params] = useRoute("/purchase/:groupId");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  const groupId = params?.groupId;

  // Check authentication and role
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    
    if (!currentUser || !token || currentUser.role !== "product_owner") {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول كصاحب منتج للوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Fetch group details
  const { data: group, isLoading } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
    enabled: !!groupId,
  });

  // Calculate total price
  const selectedService = SERVICE_TYPES.find(s => s.value === serviceType);
  const pricePerUnit = selectedService?.price || 0;
  const totalAmount = pricePerUnit * quantity;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      
      return await apiRequest("/api/orders", "POST", {
        productOwnerId: currentUser?.id,
        groupId: groupId,
        serviceType,
        quantity,
        pricePerUnit: pricePerUnit.toString(),
        totalAmount: totalAmount.toString(),
        paymentMethod,
        paymentDetails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });
      navigate("/product-owner-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!serviceType || !quantity || !paymentMethod || !paymentDetails) {
      toast({
        title: "خطأ",
        description: "يرجى إكمال جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/groups")}
            className="mb-4"
            data-testid="button-back-to-groups"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للجروبات
          </Button>

          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
            شراء خدمة من {group?.name}
          </h1>
          <p className="text-muted-foreground">
            اختر الخدمة المطلوبة وقم بإكمال عملية الدفع
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`w-20 h-1 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>اختر نوع الخدمة</CardTitle>
              <CardDescription>حدد الخدمة التي تحتاجها من الجروب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">نوع الخدمة</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger id="service-type" data-testid="select-service-type">
                    <SelectValue placeholder="اختر نوع الخدمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label} - ${service.price} لكل وحدة
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">عدد المراجعات / المهام</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                  data-testid="input-quantity"
                />
                <p className="text-sm text-muted-foreground">
                  (من 1 إلى 1000)
                </p>
              </div>

              {serviceType && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>السعر لكل وحدة:</span>
                    <span className="font-bold">${pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>الكمية:</span>
                    <span className="font-bold">{quantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">الإجمالي:</span>
                      <span className="font-bold text-primary">${totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!serviceType}
                data-testid="button-next-step-1"
              >
                التالي
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Payment Method */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>اختر طريقة الدفع</CardTitle>
              <CardDescription>حدد الطريقة التي تفضلها للدفع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem
                      value={method.value}
                      id={method.value}
                      data-testid={`radio-payment-${method.value}`}
                    />
                    <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer flex-1">
                      <span className="text-2xl">{method.icon}</span>
                      <span>{method.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  data-testid="button-back-step-2"
                >
                  السابق
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!paymentMethod}
                  className="flex-1"
                  data-testid="button-next-step-2"
                >
                  التالي
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>بيانات الدفع</CardTitle>
              <CardDescription>أدخل بيانات الدفع لإتمام العملية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-details">
                  {paymentMethod === "bank_card" ? "رقم البطاقة" : "رقم الهاتف"}
                </Label>
                <Input
                  id="payment-details"
                  type={paymentMethod === "bank_card" ? "text" : "tel"}
                  placeholder={paymentMethod === "bank_card" ? "XXXX-XXXX-XXXX-XXXX" : "01XXXXXXXXX"}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  data-testid="input-payment-details"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-bold mb-3">ملخص الطلب</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الخدمة:</span>
                    <span>{SERVICE_TYPES.find(s => s.value === serviceType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الكمية:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طريقة الدفع:</span>
                    <span>{PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">المبلغ الإجمالي:</span>
                      <span className="font-bold text-primary">${totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  data-testid="button-back-step-3"
                >
                  السابق
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!paymentDetails || createOrderMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-order"
                >
                  <ShoppingCart className="ml-2 h-4 w-4" />
                  {createOrderMutation.isPending ? "جاري الإرسال..." : "تأكيد الطلب"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
