import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Send } from "lucide-react";

const servicesList = [
  { id: "google_play_review", name: "تقييم تطبيقك على Google Play", pricePerReview: 1 },
  { id: "ios_review", name: "تقييم تطبيقك على iOS", pricePerReview: 1 },
  { id: "website_review", name: "تقييم موقعك الإلكتروني", pricePerReview: 1 },
  { id: "ux_testing", name: "اختبار تجربة المستخدم لتطبيقك أو موقعك", pricePerReview: 1 },
  { id: "software_testing", name: "اختبار أنظمة السوفت وير", pricePerReview: 1 },
  { id: "social_media_engagement", name: "التفاعل مع منشورات السوشيال ميديا", pricePerReview: 1 },
  { id: "google_maps_review", name: "تقييمات خرائط جوجل ماب (Google Maps Reviews)", pricePerReview: 2 },
];

interface ServiceDetailsModalProps {
  open: boolean;
  onSubmit: (details: {
    serviceType: string;
    serviceName: string;
    description: string;
    budget: string;
    timeline: string;
    requirements: string;
  }) => void;
  onSkip: () => void;
}

export function ServiceDetailsModal({ open, onSubmit, onSkip }: ServiceDetailsModalProps) {
  const [serviceType, setServiceType] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [requirements, setRequirements] = useState("");

  const handleSubmit = () => {
    if (!serviceType || !serviceName.trim() || !description.trim()) {
      return;
    }

    onSubmit({
      serviceType,
      serviceName,
      description,
      budget,
      timeline,
      requirements,
    });

    // Reset form
    setServiceType("");
    setServiceName("");
    setDescription("");
    setBudget("");
    setTimeline("");
    setRequirements("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl">تفاصيل الخدمة المطلوبة</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            من فضلك قدم تفاصيل واضحة عن الخدمة التي تحتاجها. هذا سيساعد القائد على فهم متطلباتك بشكل أفضل وتقديم عرض مناسب.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Instructions Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              نصائح لطلب ناجح:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• اشرح الخدمة المطلوبة بوضوح ودقة</li>
              <li>• حدد الميزانية المتوقعة والوقت المطلوب</li>
              <li>• اذكر أي متطلبات خاصة أو تفضيلات</li>
              <li>• كن محددًا في توقعاتك لتحصل على أفضل عرض</li>
            </ul>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-base font-semibold">
              نوع الخدمة <span className="text-red-500">*</span>
            </Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="text-base">
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

          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="serviceName" className="text-base font-semibold">
              اسم الخدمة <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serviceName"
              placeholder="مثال: تصميم تطبيق جوال، كتابة محتوى، تسويق..."
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              وصف تفصيلي للخدمة <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="اشرح ما تحتاجه بالتفصيل... الأهداف، المميزات، النتائج المتوقعة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="text-base resize-none"
            />
            <p className="text-sm text-gray-500">
              {description.length} / 500 حرف
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-semibold">
              الميزانية المتوقعة
            </Label>
            <Input
              id="budget"
              placeholder="مثال: 5000 ريال، أو من 3000 إلى 5000 ريال"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-base font-semibold">
              المدة الزمنية المطلوبة
            </Label>
            <Input
              id="timeline"
              placeholder="مثال: أسبوعين، شهر، 3 أشهر..."
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-base font-semibold">
              متطلبات إضافية
            </Label>
            <Textarea
              id="requirements"
              placeholder="أي تفاصيل أخرى مهمة، متطلبات تقنية، أمثلة مرجعية..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!serviceType || !serviceName.trim() || !description.trim()}
            className="flex-1 h-11 text-base gap-2"
          >
            <Send className="h-4 w-4" />
            إرسال التفاصيل وبدء المحادثة
          </Button>
          <Button
            variant="outline"
            onClick={onSkip}
            className="px-6 h-11"
          >
            تخطي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
