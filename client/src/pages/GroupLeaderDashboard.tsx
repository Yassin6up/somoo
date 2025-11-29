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
    CheckCircle2,
    FileText
} from "lucide-react";
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

// Helper function to translate status to Arabic
function getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
        "pending": "قيد الانتظار",
        "accepted": "مقبولة",
        "in_progress": "قيد التنفيذ",
        "completed": "مكتملة",
        "cancelled": "ملغي"
    };
    return statusLabels[status] || status;
}

export default function GroupLeaderDashboard() {
    const { id: groupId } = useParams<{ id: string }>();
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("overview");
    const [projectStatusFilter, setProjectStatusFilter] = useState<"active" | "completed">("active");

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

    // Fetch accepted projects
    const { data: acceptedProjects = [], isLoading: projectsLoading } = useQuery({
        queryKey: [`/api/groups/${groupId}/accepted-projects`],
        enabled: !!groupId,
        queryFn: async () => {
            const res = await fetch(`/api/groups/${groupId}/accepted-projects`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Filter projects based on status
    const filteredProjects = acceptedProjects.filter((p: any) => {
        if (projectStatusFilter === "active") {
            return p.status === "in_progress";
        }
        return p.status === "completed";
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
        onMutate: async ({ requestId }) => {
            await queryClient.cancelQueries({ queryKey: [`/api/groups/${groupId}/requests`] });
            
            const previousRequests = queryClient.getQueryData([`/api/groups/${groupId}/requests`]);
            
            queryClient.setQueryData([`/api/groups/${groupId}/requests`], (old: any[]) => {
                return old ? old.filter((req: any) => req.id !== requestId) : [];
            });
            
            return { previousRequests };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/requests`] });
            queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
            queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
            toast({
                title: variables.status === 'approved' ? "تم القبول" : "تم الرفض",
                description: variables.status === 'approved' ? "تم قبول العضو بنجاح" : "تم رفض طلب الانضمام",
            });
        },
        onError: (error: any, _, context: any) => {
            if (context?.previousRequests) {
                queryClient.setQueryData([`/api/groups/${groupId}/requests`], context.previousRequests);
            }
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
            queryClient.invalidateQueries({ queryKey: [`/groups/${groupId}`] });
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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!group) {
        return <div className="flex items-center justify-center min-h-screen bg-white">المجموعة غير موجودة</div>;
    }

    // Check if current user is leader
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (group.leaderId !== currentUser.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
                <Shield className="w-16 h-16 text-gray-400 mb-4" />
                <h1 className="text-xl font-semibold text-gray-900">غير مصرح</h1>
                <p className="text-gray-600 mb-4">فقط قائد المجموعة يمكنه الوصول لهذه الصفحة</p>
                <Button 
                    onClick={() => navigate(`/groups/${groupId}`)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                    العودة للمجموعة
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigate(`/groups/${groupId}`)}
                                className="text-gray-600 hover:bg-gray-100"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <h1 className="text-lg font-semibold text-gray-900">لوحة تحكم القائد</h1>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {group.name}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <Card className="border border-gray-200 rounded-lg">
                            <CardContent className="p-4 space-y-1">
                                <Button
                                    variant={activeTab === "overview" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "overview" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                                    onClick={() => setActiveTab("overview")}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    نظرة عامة
                                </Button>
                                <Button
                                    variant={activeTab === "projects" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "projects" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                                    onClick={() => setActiveTab("projects")}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    المشاريع والمهام
                                </Button>
                                <Button
                                    variant={activeTab === "settings" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "settings" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                                    onClick={() => setActiveTab("settings")}
                                >
                                    <Settings className="w-4 h-4" />
                                    الإعدادات
                                </Button>
                                <Button
                                    variant={activeTab === "members" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "members" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                                    onClick={() => setActiveTab("members")}
                                >
                                    <Users className="w-4 h-4" />
                                    الأعضاء
                                    <Badge variant="secondary" className="mr-auto bg-gray-100 text-gray-700">
                                        {group.currentMembers}
                                    </Badge>
                                </Button>
                                <Button
                                    variant={activeTab === "requests" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "requests" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                                    onClick={() => setActiveTab("requests")}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    طلبات الانضمام
                                    {requests.length > 0 && (
                                        <Badge variant="secondary" className="mr-auto bg-red-100 text-red-700">
                                            {requests.length}
                                        </Badge>
                                    )}
                                </Button>
                                <Button
                                    variant={activeTab === "conversations" ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${activeTab === "conversations" ? "bg-gray-900 hover:bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-50"}`}
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
                        <div className="space-y-6">
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="border border-gray-200 rounded-lg">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700">
                                                        {Math.round((group.currentMembers / group.maxMembers) * 100)}% ممتلئ
                                                    </Badge>
                                                </div>
                                                <h3 className="text-2xl font-semibold text-gray-900 mb-1">{group.currentMembers}</h3>
                                                <p className="text-sm text-gray-600">عضو نشط</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border border-gray-200 rounded-lg">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <UserPlus className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    {requests.length > 0 && (
                                                        <Badge className="bg-red-100 text-red-700">
                                                            جديد
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-semibold text-gray-900 mb-1">{requests.length}</h3>
                                                <p className="text-sm text-gray-600">طلب انضمام معلق</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border border-gray-200 rounded-lg">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        نشط
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{group.privacy === 'private' ? 'خاص' : 'عام'}</h3>
                                                <p className="text-sm text-gray-600">حالة المجموعة</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border border-gray-200 rounded-lg">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">مشاركة المجموعة</CardTitle>
                                            <CardDescription>شارك رابط مجموعتك لدعوة أعضاء جدد</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={`${window.location.origin}/groups/${groupId}`}
                                                    readOnly
                                                    className="bg-gray-50 border-gray-300"
                                                />
                                                <Button 
                                                    onClick={copyGroupLink} 
                                                    className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    نسخ
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === "projects" && (
                                <div className="space-y-6">
                                    <Card className="border border-gray-200 rounded-lg">
                                        <CardContent className="p-4">
                                            {/* Project Status Tabs */}
                                            <div className="flex gap-2 mb-4 border-b border-gray-200">
                                                <Button
                                                    variant="ghost"
                                                    className={`rounded-none border-b-2 ${projectStatusFilter === "active"
                                                        ? "border-blue-600 text-blue-600"
                                                        : "border-transparent text-gray-500"
                                                        }`}
                                                    onClick={() => setProjectStatusFilter("active")}
                                                >
                                                    <Clock className="w-4 h-4 ml-2" />
                                                    قيد التنفيذ ({acceptedProjects.filter((p: any) => p.status === "in_progress").length})
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className={`rounded-none border-b-2 ${projectStatusFilter === "completed"
                                                        ? "border-green-600 text-green-600"
                                                        : "border-transparent text-gray-500"
                                                        }`}
                                                    onClick={() => setProjectStatusFilter("completed")}
                                                >
                                                    <Check className="w-4 h-4 ml-2" />
                                                    المكتملة ({acceptedProjects.filter((p: any) => p.status === "completed").length})
                                                </Button>
                                            </div>

                                            {projectsLoading ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                </div>
                                            ) : filteredProjects.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Briefcase className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500">
                                                        {projectStatusFilter === "active"
                                                            ? "لا توجد مشاريع قيد التنفيذ حالياً"
                                                            : "لا توجد مشاريع مكتملة"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {filteredProjects.map((project: any) => (
                                                        <ProjectCard
                                                            key={project.id}
                                                            project={project}
                                                            members={members.filter(m => m.freelancerId !== localStorage.getItem("userId"))}
                                                            groupId={groupId!}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === "settings" && (
                                <Card className="border border-gray-200 rounded-lg">
                                    <CardHeader>
                                        <CardTitle>إعدادات المجموعة</CardTitle>
                                        <CardDescription>تعديل المعلومات الأساسية وخصوصية المجموعة</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>اسم المجموعة</Label>
                                            <Input
                                                defaultValue={group.name}
                                                onChange={(e) => updateGroupMutation.mutate({ name: e.target.value })}
                                                className="border-gray-300 focus:border-gray-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>الوصف</Label>
                                            <Textarea
                                                defaultValue={group.description || ""}
                                                onChange={(e) => updateGroupMutation.mutate({ description: e.target.value })}
                                                rows={4}
                                                className="border-gray-300 focus:border-gray-400"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="space-y-0.5">
                                                <Label className="text-base flex items-center gap-2">
                                                    {group.privacy === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                                    خصوصية المجموعة
                                                </Label>
                                                <p className="text-sm text-gray-600">
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
                                                className="data-[state=checked]:bg-gray-900"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "members" && (
                                <Card className="border border-gray-200 rounded-lg">
                                    <CardHeader>
                                        <CardTitle>إدارة الأعضاء</CardTitle>
                                        <CardDescription>قائمة بجميع أعضاء المجموعة ({members.length})</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input placeholder="بحث عن عضو..." className="pr-10 border-gray-300" />
                                            </div>

                                            <div className="space-y-3">
                                                {members.map((member: any) => (
                                                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-10 h-10 border border-gray-200">
                                                                <AvatarImage src={member.freelancer?.profileImage} />
                                                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                                                    {member.freelancer?.fullName?.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
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
                                <Card className="border border-gray-200 rounded-lg">
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
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <UserPlus className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500">لا توجد طلبات جديدة</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {requests.map((request: any) => (
                                                    <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-10 h-10 border border-gray-200">
                                                                <AvatarImage src={request.freelancer?.profileImage} />
                                                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                                                    {request.freelancer?.fullName?.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{request.freelancer?.fullName}</h4>
                                                                <p className="text-sm text-gray-500 mb-1">{request.freelancer?.jobTitle}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    منذ {formatDistanceToNow(new Date(request.createdAt), { locale: ar })}
                                                                </p>
                                                                {request.message && (
                                                                    <p className="text-sm bg-gray-50 p-2 rounded mt-1 text-gray-600">
                                                                        "{request.message}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
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

                            {activeTab === "conversations" && (
                                <Card className="border border-gray-200 rounded-lg">
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
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <MessageCircle className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500">لا توجد محادثات حالياً</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {conversations.map((conversation: any) => (
                                                    <div 
                                                        key={conversation.id} 
                                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                        onClick={() => navigate(`/freelancer-dashboard/conversations`)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-10 h-10 border border-gray-200">
                                                                <AvatarImage src={conversation.productOwner?.profileImage} />
                                                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                                                    {conversation.productOwner?.fullName?.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">
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
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/freelancer-dashboard/conversations`);
                                                                }}
                                                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                            >
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Project Card Component with Task Creation
function ProjectCard({ project, members, groupId }: { project: any; members: GroupMember[]; groupId: string }) {
    const { toast } = useToast();
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        serviceType: project.serviceType || "social_media"
    });

    // Auto-calculate reward per member
    const projectBudget = parseFloat(project.budget) || 0;
    const memberCount = members.length + 1; // +1 for leader
    const platformFee = projectBudget * 0.10;
    const leaderCommission = projectBudget * 0.03;
    const totalForMembers = projectBudget - platformFee - leaderCommission;
    const rewardPerMember = totalForMembers / memberCount;

    const createTaskMutation = useMutation({
        mutationFn: async (taskData: any) => {
            const res = await fetch(`/api/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    ...taskData,
                    projectId: project.id,
                    groupId: groupId,
                    reward: rewardPerMember.toFixed(2)
                })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "تم إنشاء المهام",
                description: `تم تعيين المهمة لجميع الأعضاء بنجاح. المكافأة لكل عضو: $${rewardPerMember.toFixed(2)}`,
            });
            setShowTaskForm(false);
            setTaskForm({ title: "", description: "", serviceType: project.serviceType || "social_media" });
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/tasks`] });
        },
        onError: (error: Error) => {
            toast({
                title: "خطأ",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleCreateTask = () => {
        if (!taskForm.title || !taskForm.description) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول",
                variant: "destructive"
            });
            return;
        }
        createTaskMutation.mutate(taskForm);
    };

    const completeProjectMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status: "completed" })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "تم إكمال المشروع",
                description: "تم تحديث حالة المشروع إلى مكتمل",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/projects/group/${groupId}`] });
        },
        onError: (error: Error) => {
            toast({
                title: "خطأ",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <Card className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{getStatusLabel(project.status)}</Badge>
                </div>
                <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{project.budget} ريال</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {project.deadline ? formatDistanceToNow(new Date(project.deadline), { addSuffix: true, locale: ar }) : 'غير محدد'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-3">
                    {project.status !== "completed" && (
                        <Button
                            onClick={() => {
                                if (confirm("هل أنت متأكد من إكمال هذا المشروع؟")) {
                                    completeProjectMutation.mutate();
                                }
                            }}
                            variant="outline"
                            className="flex-1 gap-2 border-green-500 text-green-700 hover:bg-green-50"
                            disabled={completeProjectMutation.isPending}
                        >
                            <Check className="w-4 h-4" />
                            {completeProjectMutation.isPending ? "جاري التحديث..." : "تم إنهاء المشروع"}
                        </Button>
                    )}
                </div>
                {!showTaskForm ? (
                    <Button
                        onClick={() => setShowTaskForm(true)}
                        className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        <UserPlus className="w-4 h-4" />
                        إنشاء مهمة جديدة
                    </Button>
                ) : (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800 mb-2"><strong>معلومات المشروع:</strong></p>
                            <div className="space-y-1 text-xs">
                                <p className="flex justify-between">
                                    <span>ميزانية المشروع:</span>
                                    <span className="font-medium">${projectBudget.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>عدد الأعضاء (مع القائد):</span>
                                    <span className="font-medium">{memberCount}</span>
                                </p>
                                <p className="flex justify-between text-yellow-700">
                                    <span>رسوم المنصة (10%):</span>
                                    <span className="font-medium">-${platformFee.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between text-yellow-700">
                                    <span>عمولة القائد (3%):</span>
                                    <span className="font-medium">+${leaderCommission.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between pt-2 border-t border-blue-300 text-green-700 font-bold">
                                    <span>المكافأة لكل عضو:</span>
                                    <span>${rewardPerMember.toFixed(2)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>عنوان المهمة</Label>
                            <Input
                                value={taskForm.title}
                                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                placeholder="مثال: تصميم منشور على انستغرام"
                                className="border-gray-300 focus:border-gray-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>الوصف</Label>
                            <Textarea
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                placeholder="وصف تفصيلي للمهمة..."
                                rows={3}
                                className="border-gray-300 focus:border-gray-400"
                            />
                        </div>

                        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                            <p className="text-xs text-green-800 font-medium mb-1">
                                ✓ سيتم تعيين هذه المهمة لجميع الأعضاء ({memberCount} عضو)
                            </p>
                            <p className="text-xs text-green-700">
                                سيتم نشر المهمة تلقائياً في مجتمع المجموعة
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreateTask}
                                disabled={createTaskMutation.isPending}
                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                {createTaskMutation.isPending ? "جاري الإنشاء..." : "إنشاء ونشر المهمة"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowTaskForm(false)}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}