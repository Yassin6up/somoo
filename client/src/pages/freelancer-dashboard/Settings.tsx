import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">الإعدادات</h2>
        <p className="text-muted-foreground mt-1">
          إدارة حسابك وتفضيلاتك
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>تحديث بياناتك الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
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
                placeholder="your@email.com"
                className="rounded-xl mt-1"
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="bio">السيرة الذاتية</Label>
              <Textarea
                id="bio"
                placeholder="اكتب نبذة عنك..."
                className="rounded-xl mt-1"
                rows={4}
                data-testid="textarea-bio"
              />
            </div>
            <Button className="rounded-xl w-full" data-testid="button-save-profile">
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>تغيير كلمة المرور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                className="rounded-xl mt-1"
                data-testid="input-current-password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                className="rounded-xl mt-1"
                data-testid="input-new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="rounded-xl mt-1"
                data-testid="input-confirm-password"
              />
            </div>
            <Button className="rounded-xl w-full" data-testid="button-change-password">
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>إعدادات التنبيهات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <SettingsIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p>إعدادات الإشعارات ستكون متاحة قريباً</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>الخصوصية</CardTitle>
            <CardDescription>إدارة خصوصية حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <SettingsIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p>إعدادات الخصوصية ستكون متاحة قريباً</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
