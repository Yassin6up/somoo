import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProductOwner {
  id: string;
  email: string;
  fullName: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user: ProductOwner | null = userStr ? JSON.parse(userStr) : null;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string }) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات حسابك بنجاح",
      });
      setIsEditing(false);
      // Update localStorage
      if (user) {
        const updatedUser = { ...user, fullName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلوماتك",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("PATCH", "/api/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    if (!fullName.trim()) {
      toast({
        title: "خطأ",
        description: "الاسم الكامل مطلوب",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ fullName });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "خطأ",
        description: "جميع الحقول مطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
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

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>
            قم بتحديث كلمة المرور الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="input-current-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              data-testid="input-new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              data-testid="input-confirm-password"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending}
            className="w-full"
            data-testid="button-change-password"
          >
            <Lock className="ml-2 h-4 w-4" />
            {changePasswordMutation.isPending ? "جاري التحديث..." : "تغيير كلمة المرور"}
          </Button>
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
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-md font-semibold">
              صاحب مشروع
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
