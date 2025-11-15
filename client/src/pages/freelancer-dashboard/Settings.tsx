import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Freelancer } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Fetch freelancer data
  const { data: freelancer, isLoading } = useQuery<Freelancer>({
    queryKey: ["/api/freelancers", user?.id],
    enabled: !!user?.id,
  });

  // Populate form when data loads
  useEffect(() => {
    if (freelancer) {
      setFullName(freelancer.fullName || "");
      setPhone(freelancer.phone || "");
      setBio(freelancer.bio || "");
      setAboutMe(freelancer.aboutMe || "");
      setJobTitle(freelancer.jobTitle || "");
    }
  }, [freelancer]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Freelancer>) => {
      return await apiRequest("PATCH", `/api/freelancers/${user?.id}`, data);
    },
    onSuccess: async (response) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ["/api/freelancers", user?.id] });
      
      // Update localStorage
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      if (currentUser) {
        const updatedUser = { ...currentUser, fullName, phone, bio, aboutMe, jobTitle };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("userLoggedIn"));
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات حسابك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلوماتك",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("PATCH", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    if (!fullName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم الكامل",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      fullName: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      aboutMe: aboutMe.trim(),
      jobTitle: jobTitle.trim(),
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">الإعدادات</h2>
        <p className="text-muted-foreground mt-1">
          إدارة حسابك وتفضيلاتك
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>المعلومات الشخصية</CardTitle>
            </div>
            <CardDescription>تحديث بياناتك الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">الاسم الكامل *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="rounded-xl mt-1"
                data-testid="input-fullname"
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={freelancer?.email || ""}
                disabled
                className="rounded-xl mt-1 bg-muted"
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground mt-1">
                لا يمكن تغيير البريد الإلكتروني
              </p>
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف"
                className="rounded-xl mt-1"
                data-testid="input-phone"
              />
            </div>
            <div>
              <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مثال: مطور واجهات أمامية"
                className="rounded-xl mt-1"
                data-testid="input-jobtitle"
              />
            </div>
            <div>
              <Label htmlFor="bio">نبذة مختصرة</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة مختصرة عنك..."
                className="rounded-xl mt-1"
                rows={3}
                data-testid="textarea-bio"
              />
            </div>
            <div>
              <Label htmlFor="aboutMe">عني</Label>
              <Textarea
                id="aboutMe"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="اكتب تفاصيل أكثر عن خبراتك ومهاراتك..."
                className="rounded-xl mt-1"
                rows={4}
                data-testid="textarea-aboutme"
              />
            </div>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
              className="rounded-xl w-full"
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>الأمان</CardTitle>
            </div>
            <CardDescription>تغيير كلمة المرور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">كلمة المرور الحالية *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                className="rounded-xl mt-1"
                data-testid="input-current-password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة مرور جديدة"
                className="rounded-xl mt-1"
                data-testid="input-new-password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                يجب أن تكون 6 أحرف على الأقل
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="rounded-xl mt-1"
                data-testid="input-confirm-password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              variant="outline"
              className="rounded-xl w-full"
              data-testid="button-change-password"
            >
              {changePasswordMutation.isPending ? (
                "جاري التحديث..."
              ) : (
                <>
                  <Lock className="ml-2 h-4 w-4" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
