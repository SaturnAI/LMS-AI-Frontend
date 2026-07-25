/** KPI stat card — soft filled block with an oversized numeral. `accent` highlights the featured card (border + shadow, not a color fill — lime is reserved for tenant-context). */
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
    <div
      className={cn(
        "rounded-xl border bg-secondary p-6",
        accent && "border-brand-navy/20 shadow-sm",
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-20 bg-black/5" />
      ) : (
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
          {error ? "—" : value}
        </p>
      )}
      {hint && !loading && !error && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
