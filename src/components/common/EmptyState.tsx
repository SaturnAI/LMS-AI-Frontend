/** Dashed "no data" placeholder (icon, title, optional CTA). Reused by dashboard cards & pages. */
import type { ReactNode } from "react";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  /** True when this is a "no results for your search" state, not "no data at all" — swaps in a search icon/tone. */
  isSearchResult?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, isSearchResult }: EmptyStateProps) {
  const ResolvedIcon = isSearchResult ? Search : Icon;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
        isSearchResult && "border-muted-foreground/25 bg-muted/20",
      )}
    >
      {ResolvedIcon && <ResolvedIcon className="size-8 text-muted-foreground" aria-hidden />}
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
