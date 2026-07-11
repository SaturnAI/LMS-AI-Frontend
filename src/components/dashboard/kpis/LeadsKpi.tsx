"use client";

/** KPI card: total lead count (tenant/assignment scoped). Rendered on `/dashboard`. */
import { Contact } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { KpiCard } from "../KpiCard";

export function LeadsKpi({ label = "Leads" }: { label?: string }) {
  // batch_size 1 keeps the payload tiny; we only need `total`.
  const { data, isPending, isError } = useLeads({ batch_number: 1, batch_size: 1 });
  return <KpiCard label={label} value={data?.total ?? 0} icon={Contact} loading={isPending} error={isError} />;
}
