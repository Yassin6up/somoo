import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProductOwner {
  id: string;
  email: string;
  fullName: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user: ProductOwner | null = userStr ? JSON.parse(userStr) : null;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string }) => {
      if (!user?.id) throw new Error("User ID not found");
      const response = await apiRequest(`/api/product-owners/${user.id}`,"PATCH",  data);
      return { response, submittedData: data };
    },
    onSuccess: ({ response, submittedData }) => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات حسابك بنجاح",
      });
      setIsEditing(false);
      // Read current user from localStorage (to avoid stale closure)
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      if (currentUser) {
        // Update localStorage - use response data if available, otherwise use submitted data
        const updatedData = response || submittedData;
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Updated localStorage.user:", updatedUser);
        // Trigger userLoggedIn event to update Navbar
        window.dispatchEvent(new Event("userLoggedIn"));
      }
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلوماتك",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    const newFullName = fullName.trim();
    if (!newFullName) {
      toast({
        title: "خطأ",
        description: "الاسم الكامل مطلوب",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ fullName: newFullName });
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              يرجى تسجيل الدخول أولاً
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة معلومات حسابك وتفضيلاتك</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات الحساب
          </CardTitle>
          <CardDescription>
            معلوماتك الشخصية الأساسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
                data-testid="input-email"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                type="text"
                value={isEditing ? fullName : user.fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                data-testid="input-fullname"
              />
              {!isEditing ? (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setFullName(user.fullName);
                  }}
                  variant="outline"
                  data-testid="button-edit-profile"
                >
                  تعديل
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    data-testid="button-cancel-edit"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Type Badge */}
      <Card>
        <CardHeader>
          <CardTitle>نوع الحساب</CardTitle>
          <CardDescription>
            معلومات عن نوع حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-md font-semibold" data-testid="badge-account-type">
              صاحب مشروع
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
