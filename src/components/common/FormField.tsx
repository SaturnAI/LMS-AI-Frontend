/** Label + control + error message. Shared across all add/edit form dialogs. */
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  htmlFor?: string;
  hint?: string;
  maxLength?: number;
  currentLength?: number;
  children: ReactNode;
}

export function FormField({
  label,
  required,
  error,
  className,
  htmlFor,
  hint,
  maxLength,
  currentLength,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <>
              <span className="text-destructive" aria-hidden>
                {" "}
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </Label>
        {maxLength != null && (
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {currentLength ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
