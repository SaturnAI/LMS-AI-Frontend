/** KPI stat card — soft filled block with an oversized numeral. `accent` renders the featured (lime) variant. */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
  error?: boolean;
  accent?: boolean;
  className?: string;
}

export function KpiCard({ label, value, hint, loading, error, accent, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-2xl p-5", accent ? "bg-brand-lime" : "bg-secondary", className)}>
      <span className={cn("text-sm", accent ? "text-brand-navy/70" : "text-muted-foreground")}>{label}</span>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-20 bg-black/5" />
      ) : (
        <p
          className={cn(
            "mt-2 text-4xl font-extrabold tracking-tight tabular-nums",
            accent ? "text-brand-navy" : "text-foreground",
          )}
        >
          {error ? "—" : value}
        </p>
      )}
      {hint && !loading && !error && (
        <p className={cn("mt-2 text-xs", accent ? "text-brand-navy/70" : "text-muted-foreground")}>{hint}</p>
      )}
    </div>
  );
}
