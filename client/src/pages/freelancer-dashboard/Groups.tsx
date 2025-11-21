import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Plus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FreelancerGroups() {
    const { data: groups = [], isLoading } = useQuery({
        queryKey: ["/api/groups"],
        queryFn: async () => {
            const res = await fetch("/api/groups");
            if (!res.ok) throw new Error("Failed to fetch groups");
            return res.json();
        }
    });

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const myGroups = groups.filter((g: any) => g.leaderId === currentUser.id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">مجموعاتي</h1>
                    <p className="text-gray-500 mt-1">إدارة المجموعات التي تقودها</p>
                </div>
                <Link href="/groups">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        إنشاء مجموعة جديدة
                    </Button>
                </Link>
            </div>

            {myGroups.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Shield className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مجموعات بعد</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        لم تقم بإنشاء أي مجموعة حتى الآن. قم بإنشاء مجموعتك الخاصة وابدأ في بناء مجتمعك.
                    </p>
                    <Link href="/groups">
                        <Button variant="outline" className="gap-2">
                            <Users className="w-4 h-4" />
                            تصفح المجموعات
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.map((group: any) => (
                        <Card key={group.id} className="hover:shadow-lg transition-all duration-300 group border-gray-200">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge
                                        variant={group.privacy === 'private' ? "secondary" : "default"}
                                        className={group.privacy === 'private' ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
                                    >
                                        {group.privacy === 'private' ? 'مجموعة خاصة' : 'مجموعة عامة'}
                                    </Badge>
                                    {group.status === 'active' && (
                                        <span className="flex h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-100"></span>
                                    )}
                                </div>
                                <CardTitle className="text-xl font-bold line-clamp-1">{group.name}</CardTitle>
                                <CardDescription className="line-clamp-2 h-10">
                                    {group.description || "لا يوجد وصف للمجموعة"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">{group.currentMembers}</span>
                                        <span>عضو</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                        <span>قائد</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/groups/${group.id}/dashboard`} className="w-full">
                                    <Button className="w-full gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-primary hover:border-primary/20 shadow-sm">
                                        <Settings className="w-4 h-4" />
                                        إدارة المجموعة
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
