import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, DollarSign, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const servicesList = [
  { id: "google_play_review", name: "تقييم تطبيقك على Google Play", pricePerReview: 1 },
  { id: "ios_review", name: "تقييم تطبيقك على iOS", pricePerReview: 1 },
  { id: "website_review", name: "تقييم موقعك الإلكتروني", pricePerReview: 1 },
  { id: "ux_testing", name: "اختبار تجربة المستخدم لتطبيقك أو موقعك", pricePerReview: 1 },
  { id: "software_testing", name: "اختبار أنظمة السوفت وير", pricePerReview: 1 },
  { id: "social_media_engagement", name: "التفاعل مع منشورات السوشيال ميديا", pricePerReview: 1 },
  { id: "google_maps_review", name: "تقييمات خرائط جوجل ماب (Google Maps Reviews)", pricePerReview: 2 },
];

interface ProjectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverType: string;
  receiverName: string;
  onSendMessage: (content: string) => void;
}

export function ProjectProposalModal({
  isOpen,
  onClose,
  receiverId,
  receiverType,
  receiverName,
  onSendMessage,
}: ProjectProposalModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    serviceType: "",
    projectTitle: "",
    description: "",
    deliveryTime: "",
    reviewsCount: 50,
    skills: "",
  });

  // Calculate pricing dynamically
  const selectedService = useMemo(() => 
    servicesList.find(s => s.id === formData.serviceType),
    [formData.serviceType]
  );

  const totalCost = useMemo(() => {
    if (!selectedService) return 0;
    return formData.reviewsCount * selectedService.pricePerReview;
  }, [selectedService, formData.reviewsCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.projectTitle || !formData.description || !formData.deliveryTime || !formData.reviewsCount) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Format proposal as a special structured message
    const proposalData = {
      type: "project_proposal",
      serviceType: formData.serviceType,
      serviceName: selectedService?.name || "",
      title: formData.projectTitle,
      description: formData.description,
      deliveryTime: formData.deliveryTime,
      reviewsCount: formData.reviewsCount,
      pricePerReview: selectedService?.pricePerReview || 0,
      budget: totalCost,
      skills: formData.skills,
      status: "pending", // pending, approved, rejected
      createdAt: new Date().toISOString(),
    };

    // Send as JSON string that will be parsed on display
    const proposalMessage = `[PROPOSAL]${JSON.stringify(proposalData)}[/PROPOSAL]`;

    // Send the proposal as a message
    onSendMessage(proposalMessage);

    // Reset form and close modal
    setFormData({
      serviceType: "",
      projectTitle: "",
      description: "",
      deliveryTime: "",
      reviewsCount: 50,
      skills: "",
    });
    onClose();

    toast({
      title: "تم الإرسال",
      description: "تم إرسال عرض المشروع بنجاح",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إرسال عرض مشروع إلى {receiverName}
          </DialogTitle>
          <DialogDescription>
            املأ تفاصيل العرض وسيتم إرساله كرسالة تحتاج إلى موافقة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">
              نوع الخدمة <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData({ ...formData, serviceType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الخدمة من القائمة" />
              </SelectTrigger>
              <SelectContent>
                {servicesList.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectTitle">
              عنوان المشروع <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectTitle"
              placeholder="مثال: تطوير موقع إلكتروني"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData({ ...formData, projectTitle: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              وصف المشروع <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="اشرح تفاصيل المشروع والخدمات التي ستقدمها..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewsCount">
                عدد التقييمات <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reviewsCount"
                type="number"
                min="1"
                max="1000"
                placeholder="مثال: 50"
                value={formData.reviewsCount}
                onChange={(e) =>
                  setFormData({ ...formData, reviewsCount: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">
                مدة التسليم <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deliveryTime"
                placeholder="مثال: 15 يوم"
                value={formData.deliveryTime}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Dynamic Pricing Summary */}
          {selectedService && formData.reviewsCount > 0 && (
            <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">ملخص التكلفة</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">نوع الخدمة:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">عدد التقييمات:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {formData.reviewsCount} تقييم
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">سعر التقييم الواحد:</span>
                  <span className="font-medium">${selectedService.pricePerReview}</span>
                </div>
                
                <div className="h-px bg-border my-3"></div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">التكلفة الإجمالية:</span>
                  <span className="font-bold text-2xl text-primary">
                    ${totalCost}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="skills">المهارات المطلوبة (اختياري)</Label>
            <Textarea
              id="skills"
              placeholder="مثال: React, Node.js, PostgreSQL..."
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">
              <FileText className="ml-2 h-4 w-4" />
              إرسال العرض
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
