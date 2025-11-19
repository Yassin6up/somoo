import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Send, 
  Star,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Group, Freelancer, Conversation, ConversationMessage } from "@shared/schema";

export default function ChatWithLeader() {
  const params = useParams();
  const groupId = params.id as string;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Verify user authentication from backend
  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const isProductOwner = currentUser?.userType === "product_owner";

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: ["/api/groups", groupId],
    enabled: !!currentUser,
  });

  // Fetch leader details
  const { data: leader } = useQuery<Freelancer>({
    queryKey: ["/api/freelancers", group?.leaderId],
    enabled: !!group?.leaderId,
  });

  // Get or create conversation
  const getConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/conversations","POST", { groupId });
      return await res.json();
    },
    onSuccess: (data: Conversation) => {
      setConversationId(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المحادثة",
        variant: "destructive",
      });
    },
  });

  // Fetch messages
  const { data: messages = [] } = useQuery<ConversationMessage[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("لا توجد محادثة");
      const res = await apiRequest(`/api/conversations/${conversationId}/messages`, "POST", { content });
      return await res.json();
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (group && isProductOwner && !conversationId && !getConversationMutation.isPending) {
      getConversationMutation.mutate();
    }
  }, [group, isProductOwner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (userLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardContent className="py-12">
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentUser || !isProductOwner || !group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {!currentUser ? "يجب تسجيل الدخول" : "غير متاح"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {!currentUser 
                  ? "الرجاء تسجيل الدخول للوصول لهذه الصفحة" 
                  : "هذه الصفحة متاحة لأصحاب المنتجات فقط"}
              </p>
              <Button 
                onClick={() => navigate("/groups")}
                data-testid="button-back-to-groups"
              >
                العودة للجروبات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/groups/${groupId}`)}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة لتفاصيل الجروب
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leader Profile Card - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 z-50">
              <CardContent className="pt-6">
                {/* Leader Avatar and Name */}
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={leader?.profileImage || undefined} />
                    <AvatarFallback className="text-2xl">
                      {leader?.fullName?.charAt(0) || "ق"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {leader?.fullName || "قائد الجروب"}
                  </h2>
                  <Badge variant="default" className="mb-2">
                    متصل
                  </Badge>
                </div>

                <Separator className="my-4" />

                {/* Service Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">الخدمة المطلوبة</p>
                    <Badge variant="outline" className="w-full justify-center py-2">
                      {group.name}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">التقييم</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold mr-2">4.8</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="ml-2 h-4 w-4" />
                      <span className="text-sm">الموقع</span>
                    </div>
                    <span className="text-sm font-semibold">
                      القاهرة
                    </span>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <Clock className="ml-2 h-4 w-4" />
                      <span className="text-sm">وقت الاستجابة</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      خلال دقائق
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Safety Guidelines */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      إرشادات الأمان
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>لا تشارك معلومات شخصية حساسة</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p>تأكد من متطلبات المشروع قبل البدء</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p>استخدم وسائل الدفع الآمنة عبر المنصة</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "قريباً",
                        description: "هذه الميزة ستكون متاحة قريباً",
                      });
                    }}
                    data-testid="button-voice-call"
                  >
                    <Phone className="ml-2 h-4 w-4" />
                    طلب محادثة شفهية
                  </Button>
                  
                  <Button
                    className="w-full"
                    disabled
                    data-testid="button-chat-active"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" />
                    المحادثة النصية نشطة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area - Left Side */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-xl" style={{ fontFamily: "Tajawal, sans-serif" }}>
                  محادثة مع {leader?.fullName || "قائد الجروب"}
                </CardTitle>
                <CardDescription>
                  {group.name}
                </CardDescription>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {!conversationId ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>جاري تحميل المحادثة...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>ابدأ المحادثة بإرسال رسالة</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.senderType === "product_owner";
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${message.id}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1 text-muted-foreground">
                                {leader?.fullName || "قائد الجروب"}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(message.createdAt).toLocaleTimeString("ar", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب رسالتك هنا..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!conversationId || sendMessageMutation.isPending}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || !conversationId || sendMessageMutation.isPending}
                    size="icon"
                    data-testid="button-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
