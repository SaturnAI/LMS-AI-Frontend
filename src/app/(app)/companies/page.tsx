"use client";

/** Route: `/companies` — tenant companies management (super_admin only). */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TruncatedText } from "@/components/common/TruncatedText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies, useEnterCompany } from "@/hooks/use-companies";
import { useAutoOpenCreate } from "@/hooks/use-auto-open-create";
import { isSuperAdmin } from "@/lib/rbac";
import { ROUTES, companyHubRoute } from "@/lib/constants";
import { avatarTintFor } from "@/lib/avatar-color";
import { PLAN_STYLES } from "@/lib/status-colors";
import { cn, initials } from "@/lib/utils";
import { companyLogoUrlForSuperAdmin, type Company } from "@/lib/api";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";

export default function CompaniesPage() {
  return (
    <RequireAccess allow={isSuperAdmin}>
      <CompaniesContent />
    </RequireAccess>
  );
}

function CompaniesContent() {
  const router = useRouter();
  const { data, isPending, isError, error, refetch } = useCompanies();
  const enterCompany = useEnterCompany();

  const [tab, setTab] = useState<"enabled" | "disabled">("enabled");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useAutoOpenCreate(() => setFormOpen(true));

  const rows = useMemo(() => {
    if (!data) return [];
    const byTab = data.filter((c) => c.is_disabled === (tab === "disabled"));
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((c) => c.legal_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [data, query, tab]);

  async function handleEnter(company: Company) {
    if (company.is_disabled) {
      toast.error("This company is disabled — enable it first.");
      return;
    }
    try {
      await enterCompany.mutateAsync(company.company_code);
      toast.success(`Now viewing ${company.legal_name}.`);
      router.push(companyHubRoute(company.company_code));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enter company.");
    }
  }

  const columns: Column<Company>[] = [
    {
      key: "company",
      header: "Company",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <CompanyLogo company={c} />
          <div className="min-w-0">
            <TruncatedText text={c.legal_name} className="font-medium text-foreground" />
            <TruncatedText text={c.email} className="text-xs text-muted-foreground" />
          </div>
        </div>
      ),
    },
    { key: "industry", header: "Industry", cell: (c) => c.industry || "—" },
    { key: "contact", header: "Contact", cell: (c) => c.phone_number || "—" },
    {
      key: "plan",
      header: "Plan",
      cell: (c) =>
        c.billing_plan ? (
          <Badge variant="secondary" className={cn("capitalize", PLAN_STYLES[c.billing_plan])}>
            {c.billing_plan}
          </Badge>
        ) : (
          "—"
        ),
    },
    { key: "seats", header: "Seats", cell: (c) => c.employee_limit ?? "—" },
    { key: "status", header: "Status", cell: (c) => <StatusBadge disabled={c.is_disabled} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Companies"
        description="Manage tenant companies."
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add company
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "enabled" | "disabled")}>
        <TabsList>
          <TabsTrigger value="enabled">Active</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 flex flex-col gap-4">
          <PageToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search by name or email…" />
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(c) => c.company_code}
            onRowClick={handleEnter}
            isLoading={isPending}
            isError={isError}
            errorMessage={(error as Error)?.message}
            onRetry={() => refetch()}
            emptyIcon={Building2}
            emptyTitle={query ? "No matching companies" : `No ${tab === "disabled" ? "disabled" : "active"} companies`}
            emptyIsSearchResult={!!query}
            emptyDescription={query ? "Try a different search term." : "Add your first company to get started."}
          />
        </TabsContent>
      </Tabs>

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} editing={null} />
    </div>
  );
}

function CompanyLogo({ company }: { company: Company }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
          avatarTintFor(company.company_code),
        )}
      >
        {initials(company.legal_name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- credentialed, dynamic backend image; not a static asset
    <img
      src={companyLogoUrlForSuperAdmin(company.company_code)}
      alt=""
      className="size-8 shrink-0 rounded-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}
