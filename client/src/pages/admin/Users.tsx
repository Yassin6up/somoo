import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreVertical, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المستخدمون الإداريون</h1>
          <p className="text-muted-foreground">إدارة فريق العمل والصلاحيات</p>
        </div>
        <Button onClick={() => setLocation("/admin/users/create")} data-testid="button-create-user">
          <UserPlus className="ml-2 h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="grid gap-4">
          {users?.map((user) => (
            <Card key={user.id} className="hover-elevate" data-testid={`card-user-${user.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{user.fullName}</CardTitle>
                      {user.isActive ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          غير نشط
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-menu-${user.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocation(`/admin/users/${user.id}/edit`)}>
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">الدور:</span>
                    <p className="font-medium mt-1">{user.roleNameAr || user.roleName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">رقم الهاتف:</span>
                    <p className="font-medium mt-1">{user.phone || "غير محدد"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                    <p className="font-medium mt-1">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">آخر تسجيل دخول:</span>
                    <p className="font-medium mt-1">
                      {user.lastLogin 
                        ? format(new Date(user.lastLogin), "dd MMM yyyy", { locale: ar })
                        : "لم يسجل دخول بعد"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا يوجد مستخدمون</h3>
                <p className="text-muted-foreground text-center mb-4">
                  ابدأ بإضافة أعضاء فريق العمل
                </p>
                <Button onClick={() => setLocation("/admin/users/create")}>
                  <UserPlus className="ml-2 h-4 w-4" />
                  إضافة مستخدم جديد
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
