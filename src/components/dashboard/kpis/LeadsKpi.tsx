"use client";

/** KPI card: total lead count (tenant/assignment scoped). Rendered on `/dashboard`. */
import { useLeads } from "@/hooks/use-leads";
import { KpiCard } from "../KpiCard";

export function LeadsKpi({ label = "Leads", accent }: { label?: string; accent?: boolean }) {
  // batch_size 1 keeps the payload tiny; we only need `total`.
  const { data, isPending, isError } = useLeads({ batch_number: 1, batch_size: 1 });
  return <KpiCard label={label} value={data?.total ?? 0} accent={accent} loading={isPending} error={isError} />;
}
