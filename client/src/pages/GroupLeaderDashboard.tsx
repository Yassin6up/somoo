import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    Settings,
    UserPlus,
    Shield,
    Trash2,
    Check,
    X,
    ArrowRight,
    Globe,
    Lock,
    Copy,
    LayoutDashboard,
    Activity,
    Search,
    Briefcase,
    MessageCircle,
    DollarSign,
    Clock,
    FileText
} from "lucide-react";
import CampaignsTab from "./group-leader-dashboard/Campaigns";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface GroupMember {
    id: string;
    groupId: string;
    freelancerId: string;
    role: string;
    freelancer: {
        id: string;
        fullName: string;
        username: string;
        profileImage: string;
        jobTitle: string;
    };
}

interface GroupJoinRequest {
    id: string;
    freelancerId: string;
    createdAt: string;
    message?: string;
    freelancer: {
        id: string;
        fullName: string;
        username: string;
        profileImage: string;
        jobTitle: string;
    };
}

export default function GroupLeaderDashboard() {
    const { id: groupId } = useParams<{ id: string }>();
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch group data
    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: [`/groups/${groupId}`],
        queryFn: async () => {
            const res = await fetch(`/api/groups/${groupId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error("Failed to fetch group");
            return res.json();
        }
    });

    // Fetch members
    const { data: members = [], isLoading: membersLoading } = useQuery<GroupMember[]>({
        queryKey: [`/api/groups/${groupId}/members`],
        enabled: !!groupId,
    });

    // Fetch requests
    const { data: requests = [], isLoading: requestsLoading } = useQuery<GroupJoinRequest[]>({
        queryKey: [`/api/groups/${groupId}/requests`],
        enabled: !!groupId,
        queryFn: async () => {
            const res = await fetch(`/api/groups/${groupId}/requests`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Fetch orders for the group leader
    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: [`/api/orders`],
        queryFn: async () => {
            const res = await fetch(`/api/orders`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Fetch conversations
    const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
        queryKey: [`/api/conversations`],
        queryFn: async () => {
            const res = await fetch(`/api/conversations`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Update group mutation
    const updateGroupMutation = useMutation({
        mutationFn: async (data: any) => {
            return await apiRequest(`/api/groups/${groupId}`, "PATCH", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
            toast({
                title: "تم التحديث",
                description: "تم تحديث إعدادات المجموعة بنجاح",
            });
        },
        onError: (error: any) => {
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء التحديث",
                variant: "destructive",
            });
        }
    });

    // Handle request mutation
    const handleRequestMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) => {
            return await apiRequest(`/api/groups/${groupId}/requests/${requestId}`, "PATCH", { status });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/requests`] });
            queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
            queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] }); // Update member count
            toast({
                title: variables.status === 'approved' ? "تم القبول" : "تم الرفض",
                description: variables.status === 'approved' ? "تم قبول العضو بنجاح" : "تم رفض طلب الانضمام",
            });
        },
        onError: (error: any) => {
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء معالجة الطلب",
                variant: "destructive",
            });
        }
    });

    // Remove member mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (freelancerId: string) => {
            return await apiRequest(`/api/groups/${groupId}/members/${freelancerId}`, "DELETE");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
            queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] }); // Update member count
            toast({
                title: "تم الحذف",
                description: "تم إزالة العضو من المجموعة",
            });
        },
        onError: (error: any) => {
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء حذف العضو",
                variant: "destructive",
            });
        }
    });

    const copyGroupLink = () => {
        const url = `${window.location.origin}/groups/${groupId}`;
        navigator.clipboard.writeText(url);
        toast({
            title: "تم النسخ",
            description: "تم نسخ رابط المجموعة للحافظة",
        });
    };

    if (groupLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!group) {
        return <div>Group not found</div>;
    }

    // Check if current user is leader
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (group.leaderId !== currentUser.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
                <p className="text-gray-600 mb-4">فقط قائد المجموعة يمكنه الوصول لهذه الصفحة</p>
                <Button onClick={() => navigate(`/groups/${groupId}`)}>
                    العودة للمجموعة
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${groupId}`)}>
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم القائد</h1>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {group.name}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-24">
                            <CardContent className="p-4 space-y-2">
                                <Button
                                    variant={activeTab === "overview" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "overview" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("overview")}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    نظرة عامة
                                </Button>
                                <Button
                                    variant={activeTab === "campaigns" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "campaigns" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("campaigns")}
                                >
                                    <FileText className="w-4 h-4" />
                                    الحملات
                                </Button>
                                <Button
                                    variant={activeTab === "settings" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "settings" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("settings")}
                                >
                                    <Settings className="w-4 h-4" />
                                    الإعدادات
                                </Button>
                                <Button
                                    variant={activeTab === "members" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "members" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("members")}
                                >
                                    <Users className="w-4 h-4" />
                                    الأعضاء
                                    <Badge variant="secondary" className="mr-auto bg-blue-100 text-blue-700">
                                        {group.currentMembers}
                                    </Badge>
                                </Button>
                                <Button
                                    variant={activeTab === "requests" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "requests" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("requests")}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    طلبات الانضمام
                                    {requests.length > 0 && (
                                        <Badge variant="secondary" className="mr-auto bg-red-100 text-red-700 animate-pulse">
                                            {requests.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Button
                                    variant={activeTab === "orders" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "orders" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("orders")}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    الطلبات
                                    {orders.length > 0 && (
                                        <Badge variant="secondary" className="mr-auto bg-orange-100 text-orange-700">
                                            {orders.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Button
                                    variant={activeTab === "conversations" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "conversations" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                                    onClick={() => setActiveTab("conversations")}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    المحادثات
                                    {conversations.length > 0 && (
                                        <Badge variant="secondary" className="mr-auto bg-green-100 text-green-700">
                                            {conversations.length}
                                        </Badge>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "overview" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                            <Users className="w-6 h-6 text-white" />
                                                        </div>
                                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                                                            {Math.round((group.currentMembers / group.maxMembers) * 100)}% ممتلئ
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-3xl font-bold mb-1">{group.currentMembers}</h3>
                                                    <p className="text-blue-100 text-sm">عضو نشط حالياً</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                            <UserPlus className="w-6 h-6 text-white" />
                                                        </div>
                                                        {requests.length > 0 && (
                                                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 animate-pulse">
                                                                جديد
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-3xl font-bold mb-1">{requests.length}</h3>
                                                    <p className="text-purple-100 text-sm">طلب انضمام معلق</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                            <Activity className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-3xl font-bold mb-1">{group.status === 'active' ? 'نشط' : 'غير نشط'}</h3>
                                                    <p className="text-emerald-100 text-sm">حالة المجموعة</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>مشاركة المجموعة</CardTitle>
                                                <CardDescription>شارك رابط مجموعتك لدعوة أعضاء جدد</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={`${window.location.origin}/groups/${groupId}`}
                                                        readOnly
                                                        className="bg-gray-50"
                                                    />
                                                    <Button onClick={copyGroupLink} className="gap-2">
                                                        <Copy className="w-4 h-4" />
                                                        نسخ
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === "campaigns" && (
                                    <CampaignsTab groupId={groupId!} />
                                )}

                                {activeTab === "settings" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>إعدادات المجموعة</CardTitle>
                                            <CardDescription>تعديل المعلومات الأساسية وخصوصية المجموعة</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>اسم المجموعة</Label>
                                                <Input
                                                    defaultValue={group.name}
                                                    onChange={(e) => updateGroupMutation.mutate({ name: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>الوصف</Label>
                                                <Textarea
                                                    defaultValue={group.description || ""}
                                                    onChange={(e) => updateGroupMutation.mutate({ description: e.target.value })}
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base flex items-center gap-2">
                                                        {group.privacy === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                                        خصوصية المجموعة
                                                    </Label>
                                                    <p className="text-sm text-gray-500">
                                                        {group.privacy === 'private'
                                                            ? "المجموعة خاصة، لا يمكن للأعضاء الانضمام إلا بموافقة"
                                                            : "المجموعة عامة، يمكن لأي شخص الانضمام مباشرة"}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={group.privacy === 'private'}
                                                    onCheckedChange={(checked) =>
                                                        updateGroupMutation.mutate({ privacy: checked ? 'private' : 'public' })
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === "members" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>إدارة الأعضاء</CardTitle>
                                            <CardDescription>قائمة بجميع أعضاء المجموعة ({members.length})</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input placeholder="بحث عن عضو..." className="pr-10" />
                                                </div>

                                                <div className="space-y-4">
                                                    {members.map((member: any) => (
                                                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar>
                                                                    <AvatarImage src={member.freelancer?.profileImage} />
                                                                    <AvatarFallback>{member.freelancer?.fullName?.substring(0, 2)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                                        {member.freelancer?.fullName}
                                                                        {member.role === 'leader' && (
                                                                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                                                                قائد
                                                                            </Badge>
                                                                        )}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500">{member.freelancer?.jobTitle || "عضو"}</p>
                                                                </div>
                                                            </div>

                                                            {member.role !== 'leader' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        if (confirm("هل أنت متأكد من إزالة هذا العضو؟")) {
                                                                            removeMemberMutation.mutate(member.freelancerId);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === "requests" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>طلبات الانضمام</CardTitle>
                                            <CardDescription>
                                                {requests.length === 0
                                                    ? "لا توجد طلبات انضمام معلقة حالياً"
                                                    : `لديك ${requests.length} طلب انضمام معلق`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {requests.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <UserPlus className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500">لا توجد طلبات جديدة</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {requests.map((request: any) => (
                                                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar className="w-12 h-12">
                                                                    <AvatarImage src={request.freelancer?.profileImage} />
                                                                    <AvatarFallback>{request.freelancer?.fullName?.substring(0, 2)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">{request.freelancer?.fullName}</h4>
                                                                    <p className="text-sm text-gray-500 mb-1">{request.freelancer?.jobTitle}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        منذ {formatDistanceToNow(new Date(request.createdAt), { locale: ar })}
                                                                    </p>
                                                                    {request.message && (
                                                                        <p className="text-sm bg-gray-50 p-2 rounded mt-2 text-gray-600">
                                                                            "{request.message}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                                                    onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'approved' })}
                                                                    disabled={handleRequestMutation.isPending}
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                    قبول
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                                                                    onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                                                    disabled={handleRequestMutation.isPending}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    رفض
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === "orders" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>الطلبات المستقبلة</CardTitle>
                                            <CardDescription>
                                                {orders.length === 0
                                                    ? "لا توجد طلبات من أصحاب المشاريع حالياً"
                                                    : `لديك ${orders.length} طلب من أصحاب المشاريع`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {orders.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Briefcase className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500">لا توجد طلبات جديدة حالياً</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {orders.map((order: any) => (
                                                        <div key={order.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        طلب خدمة: {order.serviceType}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        من {order.productOwner?.fullName || "صاحب مشروع"}
                                                                    </p>
                                                                </div>
                                                                <Badge className={`
                                                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                                    ${order.status === 'payment_confirmed' ? 'bg-green-100 text-green-800' : ''}
                                                                    ${order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                                                                    ${order.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                                                                `}>
                                                                    {order.status === 'pending' && 'في انتظار الدفع'}
                                                                    {order.status === 'payment_confirmed' && 'تم تأكيد الدفع'}
                                                                    {order.status === 'in_progress' && 'قيد التنفيذ'}
                                                                    {order.status === 'completed' && 'مكتمل'}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-gray-600">الكمية المطلوبة</p>
                                                                    <p className="font-semibold text-lg text-blue-600">{order.quantity}</p>
                                                                </div>
                                                                <div className="bg-green-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-gray-600">إجمالي المبلغ</p>
                                                                    <p className="font-semibold text-lg text-green-600">${parseFloat(order.totalAmount).toFixed(2)}</p>
                                                                </div>
                                                                <div className="bg-purple-50 p-3 rounded-lg">
                                                                    <p className="text-xs text-gray-600">عمولتك</p>
                                                                    <p className="font-semibold text-lg text-purple-600">${parseFloat(order.leaderCommission).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline" className="flex-1">
                                                                    عرض التفاصيل
                                                                </Button>
                                                                {order.status === 'payment_confirmed' && (
                                                                    <Button size="sm" className="flex-1 gap-2">
                                                                        <Check className="w-4 h-4" />
                                                                        تم الاستقبال
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === "conversations" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>المحادثات</CardTitle>
                                            <CardDescription>
                                                {conversations.length === 0
                                                    ? "لا توجد محادثات حالياً"
                                                    : `لديك ${conversations.length} محادثة نشطة`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {conversations.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <MessageCircle className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500">لا توجد محادثات حالياً</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {conversations.map((conversation: any) => (
                                                        <div key={conversation.id} className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar>
                                                                    <AvatarImage src={conversation.productOwner?.profileImage} />
                                                                    <AvatarFallback>
                                                                        {conversation.productOwner?.fullName?.substring(0, 2)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {conversation.productOwner?.fullName}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500">
                                                                        {conversation.group?.name}
                                                                    </p>
                                                                    {conversation.lastMessageAt && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            آخر رسالة منذ{' '}
                                                                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { locale: ar })}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <Button size="sm" variant="outline">
                                                                    فتح المحادثة
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
