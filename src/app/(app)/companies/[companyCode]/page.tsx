"use client";

/**
 * Route: `/companies/[companyCode]` — super_admin's per-company hub.
 * Entering a company (`set_tenant_id`) lands here instead of straight on `/employees`,
 * so the KPIs/recent-activity/quick-links give an overview before drilling into a module.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Ban, Building2, CheckCircle, ChevronRight, Contact, Loader2, Pencil, ScrollText, Users } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { BackLink } from "@/components/common/BackLink";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TruncatedText } from "@/components/common/TruncatedText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { LeadsKpi } from "@/components/dashboard/kpis/LeadsKpi";
import { EmployeesKpi } from "@/components/dashboard/kpis/EmployeesKpi";
import { RecentLeadsCard } from "@/components/dashboard/RecentLeadsCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";
import { useAuth } from "@/hooks/use-auth";
import { useCompanies, useEnterCompany, useSetCompanyEnabled } from "@/hooks/use-companies";
import { isSuperAdmin } from "@/lib/rbac";
import { ROUTES } from "@/lib/constants";
import { avatarTintFor } from "@/lib/avatar-color";
import { PLAN_STYLES } from "@/lib/status-colors";
import { cn, initials } from "@/lib/utils";
import { companyLogoUrlForSuperAdmin } from "@/lib/api";

export default function CompanyHubPage() {
  return (
    <RequireAccess allow={isSuperAdmin}>
      <CompanyHubContent />
    </RequireAccess>
  );
}

function CompanyHubContent() {
  const params = useParams<{ companyCode: string }>();
  const companyCode = params.companyCode;
  const router = useRouter();
  const auth = useAuth();
  const enterCompany = useEnterCompany();
  const setEnabled = useSetCompanyEnabled();
  const { data: companies, isPending } = useCompanies();
  const [formOpen, setFormOpen] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);
  const [confirmingToggle, setConfirmingToggle] = useState(false);

  const company = companies?.find((c) => c.company_code === companyCode);
  const tenantId = auth.status === "authed" ? auth.profile.tenant_id : undefined;
  // Best case: the caller (companies list) already entered this tenant and the cached
  // profile reflects it. Fall back to entering here for direct/bookmarked navigation —
  // gated on the mutation's own success, not on the profile cache catching up, since
  // that's an async refetch we can't rely on for render timing.
  const alreadyEntered = tenantId === companyCode;
  // Guard against a stale `isSuccess` from a PREVIOUS company's mutation: only trust
  // it once its own `variables` (the company it actually entered) matches this one —
  // otherwise navigating directly between two hubs could flash the old company's
  // content for a render tick before the new enter call resolves.
  const ready = alreadyEntered || (enterCompany.isSuccess && enterCompany.variables === companyCode);

  useEffect(() => {
    if (alreadyEntered) return;
    enterCompany.mutate(companyCode, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not enter company.");
        router.push(ROUTES.companies);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the target company changes
  }, [companyCode]);

  if (!ready || isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24" role="status" aria-live="polite">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <span className="text-sm text-muted-foreground">Entering company…</span>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink href={ROUTES.companies} label="Back to companies" />
        <PageHeader title="Company not found" description="This company may have been removed." />
      </div>
    );
  }

  async function confirmToggle() {
    try {
      const result = await setEnabled.mutateAsync({ companyCode, enabled: company!.is_disabled });
      toast.success(result.message || "Updated.");
      setConfirmingToggle(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={ROUTES.companies} label="Back to companies" />

      <PageHeader
        title={company.legal_name}
        description="Company overview — jump into any module below."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
              <Pencil className="size-4" />
              Edit profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={company.is_disabled ? undefined : "text-destructive"}
              onClick={() => setConfirmingToggle(true)}
            >
              {company.is_disabled ? <CheckCircle className="size-4" /> : <Ban className="size-4" />}
              {company.is_disabled ? "Enable company" : "Disable company"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
        {logoBroken ? (
          <span
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-full text-sm font-semibold",
              avatarTintFor(company.company_code),
            )}
          >
            {initials(company.legal_name)}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- credentialed, dynamic backend image; not a static asset
          <img
            src={companyLogoUrlForSuperAdmin(company.company_code)}
            alt={`${company.legal_name} logo`}
            className="size-14 shrink-0 rounded-full object-cover"
            onError={() => setLogoBroken(true)}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <TruncatedText text={company.email} className="text-sm text-muted-foreground" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge disabled={company.is_disabled} />
            {company.billing_plan && (
              <Badge variant="secondary" className={cn("capitalize", PLAN_STYLES[company.billing_plan])}>
                {company.billing_plan}
              </Badge>
            )}
            {company.employee_limit != null && (
              <Badge variant="secondary">{company.employee_limit} seats</Badge>
            )}
          </div>
        </div>
      </div>

      <KpiGrid columns={2}>
        <LeadsKpi />
        <EmployeesKpi />
      </KpiGrid>

      <div className="grid gap-3 sm:grid-cols-3">
        <HubLink href={ROUTES.employees} icon={Users} label="Employees" />
        <HubLink href={ROUTES.leads} icon={Contact} label="Leads" />
        <HubLink href={ROUTES.logs} icon={ScrollText} label="Activity logs" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentLeadsCard />
        <RecentActivityCard />
      </div>

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} editing={company} />

      <ConfirmDialog
        open={confirmingToggle}
        onOpenChange={setConfirmingToggle}
        title={company.is_disabled ? `Enable ${company.legal_name}?` : `Disable ${company.legal_name}?`}
        description={
          company.is_disabled
            ? "The company admin will regain access."
            : "The company admin and all its employees will immediately lose access."
        }
        confirmLabel={company.is_disabled ? "Enable" : "Disable"}
        destructive={!company.is_disabled}
        loading={setEnabled.isPending}
        onConfirm={confirmToggle}
      />
    </div>
  );
}

function HubLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Building2;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-secondary"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
