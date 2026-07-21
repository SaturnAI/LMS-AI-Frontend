/** Centered full-screen spinner. Shown by auth gates while the session resolves. */
import { Loader2 } from "lucide-react";

export default function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
