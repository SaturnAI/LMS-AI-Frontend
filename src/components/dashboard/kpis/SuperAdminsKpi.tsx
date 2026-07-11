"use client";

/** KPI card: super-admin count. Rendered on super_admin `/dashboard`. */
import { ShieldCheck } from "lucide-react";
import { useSuperAdmins } from "@/hooks/use-super-admins";
import { KpiCard } from "../KpiCard";

export function SuperAdminsKpi() {
  const { data, isPending, isError } = useSuperAdmins();
  const total = data?.length ?? 0;
  const disabled = data?.filter((a) => a.is_disabled).length ?? 0;

  return (
    <KpiCard
      label="Super admins"
      value={total}
      icon={ShieldCheck}
      hint={disabled > 0 ? `${disabled} disabled` : undefined}
      loading={isPending}
      error={isError}
    />
  );
}
