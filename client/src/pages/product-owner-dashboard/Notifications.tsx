import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, CheckCircle2, AlertCircle, DollarSign, ClipboardList, MessageCircle, FolderKanban, Package, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export default function ProductOwnerNotifications() {
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Fetch unread count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread/count"],
  });

  const unreadCount = unreadData?.count || 0;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_submitted":
      case "task_assigned":
        return <ClipboardList className="h-5 w-5 text-primary" />;
      case "payment_confirmed":
      case "payment_pending":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "new_message":
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case "project_accepted":
      case "project_completed":
        return <FolderKanban className="h-5 w-5 text-purple-600" />;
      case "order_in_progress":
      case "order_completed":
        return <Package className="h-5 w-5 text-orange-600" />;
      case "review_submitted":
        return <Users className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationBadgeVariant = (type: string): "default" | "secondary" | "destructive" => {
    if (type.includes("completed") || type.includes("confirmed") || type.includes("accepted")) return "default";
    if (type.includes("rejected") || type.includes("failed")) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-notifications">الإشعارات</h1>
          <p className="text-muted-foreground mt-2">
            جميع إشعاراتك في مكان واحد
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="default" className="h-8" data-testid="badge-unread-total">
              {unreadCount} غير مقروء
            </Badge>
          )}
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read-page"
            >
              <CheckCircle2 className="ml-2 h-4 w-4" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20 animate-pulse" />
            <p className="text-muted-foreground">جارٍ التحميل...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
              <p className="text-sm text-muted-foreground">
                ستظهر جميع الإشعارات الخاصة بك هنا
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover-elevate cursor-pointer ${
                !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
              data-testid={`notification-card-${notification.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-background">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {notification.title}
                        </CardTitle>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary" data-testid="indicator-unread-card" />
                        )}
                      </div>
                      <Badge variant={getNotificationBadgeVariant(notification.type)} className="flex-shrink-0">
                        {notification.type === "project_accepted" && "مقبول"}
                        {notification.type === "project_completed" && "مكتمل"}
                        {notification.type === "task_submitted" && "مُسلّم"}
                        {notification.type === "payment_confirmed" && "مُؤكد"}
                        {notification.type === "new_message" && "رسالة"}
                        {notification.type === "order_completed" && "طلب مكتمل"}
                        {notification.type === "review_submitted" && "تقييم"}
                        {!["project_accepted", "project_completed", "task_submitted", "payment_confirmed", "new_message", "order_completed", "review_submitted"].includes(notification.type) && "إشعار"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {notification.message}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{getTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
