import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Trash2, Edit, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Campaign = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  service_type: string;
  budget: number;
  package_type: string;
  target_testers: number;
  duration_days: number | null;
  requirements: string[] | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

const campaignFormSchema = z.object({
  title: z.string().min(3, "يجب أن يكون العنوان 3 أحرف على الأقل"),
  description: z.string().optional(),
  service_type: z.string().min(1, "نوع الخدمة مطلوب"),
  budget: z.number().min(1, "الميزانية مطلوبة"),
  package_type: z.string().min(1, "نوع الباقة مطلوب"),
  target_testers: z.number().min(1, "عدد المختبرين مطلوب"),
  duration_days: z.number().optional(),
  requirements: z.array(z.string()).optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-muted dark:bg-muted", text: "text-muted-foreground dark:text-muted-foreground", label: "مسودة" },
  active: { bg: "bg-primary/10 dark:bg-primary/20", text: "text-primary dark:text-primary", label: "نشط" },
  paused: { bg: "bg-secondary dark:bg-secondary", text: "text-secondary-foreground dark:text-secondary-foreground", label: "متوقف" },
  completed: { bg: "bg-accent dark:bg-accent", text: "text-accent-foreground dark:text-accent-foreground", label: "مكتمل" },
  cancelled: { bg: "bg-muted dark:bg-muted", text: "text-muted-foreground dark:text-muted-foreground", label: "ملغي" },
};

const packageTypes = [
  { value: "basic", label: "أساسي - 499 ر.س", price: 499 },
  { value: "pro", label: "احترافي - 1299 ر.س", price: 1299 },
  { value: "growth", label: "نمو - 2999 ر.س", price: 2999 },
];

const serviceTypes = [
  "اختبار تطبيقات",
  "تقييم خرائط Google Maps",
  "تقييم تطبيقات Android",
  "تقييم تطبيقات iOS",
  "تقييم مواقع إلكترونية",
  "اختبار أنظمة Software",
  "مراجعات تجربة المستخدم UX/UI",
  "التفاعل مع منشورات السوشيال ميديا",
];

export default function Campaigns() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      service_type: "",
      budget: 0,
      package_type: "",
      target_testers: 10,
      duration_days: 7,
      requirements: [],
    },
  });

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          owner_id: user.id,
          status: "draft",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ أثناء إنشاء الحملة");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "تم إنشاء الحملة بنجاح",
        description: "يمكنك الآن إدارة حملتك الجديدة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الحملة",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ أثناء حذف الحملة");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "تم حذف الحملة",
        description: "تم حذف الحملة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الحملة",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const handlePackageChange = (packageType: string) => {
    const pkg = packageTypes.find(p => p.value === packageType);
    if (pkg) {
      form.setValue("budget", pkg.price);
      form.setValue("package_type", packageType);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus === "all") return true;
    return campaign.status === filterStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">حملاتي</h1>
              <p className="text-muted-foreground">إدارة وإنشاء الحملات التسويقية والاختبارية</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" data-testid="button-create-campaign">
                  <Plus className="w-5 h-5 ml-2" />
                  إنشاء حملة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إنشاء حملة جديدة</DialogTitle>
                  <DialogDescription>
                    أنشئ حملة تسويقية أو اختبارية جديدة واختر الباقة المناسبة
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الحملة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: اختبار تطبيق التوصيل الجديد" data-testid="input-campaign-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الحملة (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="وصف تفصيلي للحملة والأهداف المرجوة..." rows={3} data-testid="input-campaign-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الخدمة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-service-type">
                                <SelectValue placeholder="اختر نوع الخدمة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="package_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الباقة</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            handlePackageChange(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-package-type">
                                <SelectValue placeholder="اختر الباقة المناسبة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {packageTypes.map((pkg) => (
                                <SelectItem key={pkg.value} value={pkg.value}>
                                  {pkg.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="target_testers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عدد المختبرين المطلوب</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-target-testers"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المدة (أيام)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-duration-days"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الميزانية (ر.س)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              disabled
                              data-testid="input-budget"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                        إلغاء
                      </Button>
                      <Button type="submit" disabled={createCampaignMutation.isPending} data-testid="button-submit-campaign">
                        {createCampaignMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحملات</SelectItem>
                <SelectItem value="draft">مسودات</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="paused">متوقفة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">لا توجد حملات بعد</h3>
                    <p className="text-muted-foreground mb-4">
                      {filterStatus === "all" ? "ابدأ بإنشاء حملتك الأولى" : "لا توجد حملات بهذه الحالة"}
                    </p>
                    {filterStatus === "all" && (
                      <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-campaign">
                        <Plus className="w-5 h-5 ml-2" />
                        إنشاء حملة جديدة
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover-elevate transition-all" data-testid={`card-campaign-${campaign.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{campaign.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {campaign.description || "لا يوجد وصف"}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${statusColors[campaign.status]?.bg} ${statusColors[campaign.status]?.text}`}
                        data-testid={`badge-status-${campaign.id}`}
                      >
                        {statusColors[campaign.status]?.label || campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">نوع الخدمة</p>
                        <p className="font-medium">{campaign.service_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">الميزانية</p>
                        <p className="font-medium">{campaign.budget} ر.س</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">المختبرين</p>
                        <p className="font-medium">{campaign.target_testers}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">المدة</p>
                        <p className="font-medium">{campaign.duration_days || "غير محدد"} يوم</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        data-testid={`button-view-${campaign.id}`}
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                        data-testid={`button-edit-${campaign.id}`}
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
                            deleteCampaignMutation.mutate(campaign.id);
                          }
                        }}
                        data-testid={`button-delete-${campaign.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
