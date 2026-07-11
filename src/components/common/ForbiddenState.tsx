/** "You don't have access" screen. Shown by RequireAccess when role/permission checks fail. */
import { ShieldX } from "lucide-react";

export function ForbiddenState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <ShieldX className="size-10 text-muted-foreground" aria-hidden />
      <h2 className="text-lg font-semibold text-foreground">You don&apos;t have access</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your role or permissions don&apos;t allow viewing this page.
      </p>
    </div>
  );
}
