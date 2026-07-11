/** Single KPI stat card (label, big value, icon; skeleton while loading). */
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export function KpiCard({ label, value, icon: Icon, hint, loading, error, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{error ? "—" : value}</p>
      )}
      {hint && !loading && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
