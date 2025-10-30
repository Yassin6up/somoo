import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: "", color: "" };

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { level: 1, text: "ضعيفة", color: "bg-destructive" };
    if (score <= 4) return { level: 2, text: "متوسطة", color: "bg-yellow-500" };
    return { level: 3, text: "قوية", color: "bg-primary" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2" data-testid="password-strength">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              level <= strength.level ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        قوة كلمة المرور: <span className="font-medium">{strength.text}</span>
      </p>
    </div>
  );
}
