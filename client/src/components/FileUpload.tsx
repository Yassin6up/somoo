import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  type: "profile" | "verification";
  currentFile?: string;
  onFileUploaded: (url: string) => void;
  accept?: string;
}

export function FileUpload({ type, currentFile, onFileUploaded, accept = "image/*" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFile || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("فشل رفع الملف");
      }

      const data = await response.json();
      onFileUploaded(data.url);
      
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم حفظ الملف على الخادم",
      });
    } catch (error) {
      toast({
        title: "خطأ في رفع الملف",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onFileUploaded("");
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative">
          {type === "profile" ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="p-4 rounded-xl border bg-muted/30">
              <p className="text-sm">✓ تم رفع الملف</p>
            </div>
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
            data-testid="button-remove-file"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="block">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
            data-testid={`input-file-${type}`}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault();
              e.currentTarget.previousElementSibling?.dispatchEvent(new MouseEvent('click'));
            }}
            data-testid={`button-upload-${type}`}
          >
            {uploading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="ml-2 h-4 w-4" />
                {type === "profile" ? "اختر صورة" : "رفع الملف"}
              </>
            )}
          </Button>
        </label>
      )}
    </div>
  );
}
