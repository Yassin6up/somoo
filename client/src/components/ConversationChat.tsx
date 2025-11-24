import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Search, Users, Star, MapPin, Briefcase } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description?: string;
  category?: string;
  membersCount?: number;
  leaderName?: string;
  leaderImage?: string;
  location?: string;
  rating?: number;
}

export default function GroupDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">اكتشف الجروبات</h1>
          <p className="text-muted-foreground mb-8">
            اختر من أفضل الجروبات للتعاون مع قادتها المتخصصين
          </p>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن جروبات أو قادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جارٍ التحميل...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لم نجد جروبات مطابقة</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {group.description}
                        </CardDescription>
                      </div>
                      {group.category && (
                        <Badge variant="outline">{group.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Leader Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={group.leaderImage} />
                        <AvatarFallback>
                          {group.leaderName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{group.leaderName}</p>
                        <p className="text-xs text-muted-foreground">قائد الجروب</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 text-sm">
                      {group.membersCount && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{group.membersCount} أعضاء</span>
                        </div>
                      )}
                      {group.rating && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4" />
                          <span>{group.rating}</span>
                        </div>
                      )}
                      {group.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{group.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link href={`/chat-with-leader/${group.id}`}>
                      <Button className="w-full" variant="default">
                        <Briefcase className="h-4 w-4 ml-2" />
                        تصفح المشاريع
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
