import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Users, Search, UserPlus, Crown, TrendingUp, MessageCircle, ShoppingCart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group } from "@shared/schema";

export default function Groups() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const userType = localStorage.getItem("userType");
  const isProductOwner = userType === "product_owner";
  const isFreelancer = userType === "freelancer";

  // Fetch all groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/groups/${groupId}/join`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "تم الانضمام بنجاح",
        description: "تم انضمامك للجروب بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الانضمام للجروب",
        variant: "destructive",
      });
    },
  });

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest("/api/conversations", "POST", { groupId });
      return response;
    },
    onSuccess: (data: any) => {
      navigate(`/product-owner-dashboard/conversations?conversationId=${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء بدء المحادثة",
        variant: "destructive",
      });
    },
  });

  // Filter groups based on search
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
                الجروبات
              </h1>
              <p className="text-muted-foreground">
                {isFreelancer ? "انضم لجروب واعمل مع فريق محترف على المشاريع" : "اختر جروب محترف لتنفيذ مشروعك"}
              </p>
            </div>

            {isFreelancer && (
              <Button
                onClick={() => navigate("/groups/create")}
                size="lg"
                data-testid="button-create-group"
              >
                <UserPlus className="ml-2 h-5 w-5" />
                إنشاء جروب جديد
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن جروب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search-groups"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الجروبات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">جروبات نشطة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groups.filter(g => g.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groups.reduce((sum, g) => sum + (g.currentMembers || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد جروبات</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "لم يتم العثور على جروبات تطابق البحث" : "لا توجد جروبات متاحة حالياً"}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate("/groups/create")} data-testid="button-create-first-group">
                  <UserPlus className="ml-2 h-4 w-4" />
                  إنشاء أول جروب
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card
                key={group.id}
                className="hover-elevate cursor-pointer transition-all overflow-hidden"
                onClick={() => navigate(`/groups/${group.id}`)}
                data-testid={`card-group-${group.id}`}
              >
                {/* Portfolio Images Gallery */}
                {group.portfolioImages && group.portfolioImages.length > 0 && (
                  <div className="w-full bg-muted/30 p-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                      {group.portfolioImages.slice(0, 12).map((image, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted hover-elevate"
                          data-testid={`img-portfolio-${group.id}-${idx}`}
                        >
                          <img
                            src={image}
                            alt={`نموذج عمل ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/200x200/e5e7eb/6b7280?text=${idx + 1}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      نماذج من أعمال سابقة (قبل وبعد)
                    </p>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                      {group.name}
                    </CardTitle>
                    <Badge variant={group.status === "active" ? "default" : "secondary"}>
                      {group.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {group.description || "لا يوجد وصف"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-4">
                    {/* Member Count */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="ml-2 h-4 w-4" />
                        الأعضاء
                      </div>
                      <span className="font-semibold">
                        {group.currentMembers || 0} / {group.maxMembers}
                      </span>
                    </div>

                    {/* Leader Badge */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Crown className="ml-2 h-4 w-4 text-yellow-600" />
                      <span>قائد الجروب: {group.leaderId}</span>
                    </div>
                  </div>

                  {/* Action buttons - different for Product Owners vs Freelancers */}
                  {isProductOwner ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/purchase/${group.id}`);
                          }}
                          data-testid={`button-purchase-service-${group.id}`}
                        >
                          <ShoppingCart className="ml-2 h-4 w-4" />
                          شراء الخدمة
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            startConversationMutation.mutate(group.id);
                          }}
                          disabled={startConversationMutation.isPending}
                          data-testid={`button-contact-leader-${group.id}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="w-full"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/groups/${group.id}`);
                        }}
                        data-testid={`button-view-group-${group.id}`}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/groups/${group.id}`);
                        }}
                        data-testid={`button-view-group-${group.id}`}
                      >
                        عرض التفاصيل
                      </Button>

                      {isFreelancer && group.status === "active" && (group.currentMembers || 0) < group.maxMembers && (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            joinGroupMutation.mutate(group.id);
                          }}
                          disabled={joinGroupMutation.isPending}
                          data-testid={`button-join-group-${group.id}`}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {(group.currentMembers || 0) >= group.maxMembers && (
                    <p className="text-xs text-destructive text-center mt-2">
                      الجروب ممتلئ
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
