import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Star, FolderCheck, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Group {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  maxMembers: number;
  country: string;
  projectsCompleted: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGroups() {
  const { toast } = useToast();

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/admin/groups"],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/admin/groups/${id}/toggle-status`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/groups"] });
      toast({
        title: "تم التحديث بنجاح",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeGroups = groups.filter(g => g.isActive).length;
  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);
  const averageRating = groups.length > 0
    ? groups.reduce((sum, g) => sum + g.rating, 0) / groups.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الجروبات</h1>
        <p className="text-muted-foreground mt-1">إدارة ومراقبة الجروبات في المنصة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-groups">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجروبات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{groups.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-groups">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-count">{activeGroups}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-members">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-members-count">{totalMembers}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-average-rating">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rating">
              {averageRating.toFixed(1)} ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الجروبات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد جروبات</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>القائد</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead>الأعضاء</TableHead>
                    <TableHead>المشاريع المكتملة</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id} data-testid={`row-group-${group.id}`}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.leaderName}</TableCell>
                      <TableCell>{group.country}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{group.memberCount} / {group.maxMembers}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FolderCheck className="h-4 w-4 text-green-600" />
                          <span>{group.projectsCompleted}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{group.rating.toFixed(1)}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 ml-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(group.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={group.isActive ? "destructive" : "default"}
                          onClick={() => toggleStatusMutation.mutate(group.id)}
                          disabled={toggleStatusMutation.isPending}
                          data-testid={`button-toggle-${group.id}`}
                        >
                          {group.isActive ? "إيقاف" : "تفعيل"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
