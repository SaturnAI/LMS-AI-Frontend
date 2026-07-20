"use client";

/** Route: `/companies` — tenant companies management (super_admin only). */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanies, useEnterCompany, useSetCompanyEnabled } from "@/hooks/use-companies";
import { isSuperAdmin } from "@/lib/rbac";
import { ROUTES } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import type { BillingPlan, Company } from "@/lib/api";
import { CompanyFormDialog } from "@/components/companies/CompanyFormDialog";

const PLAN_STYLES: Record<BillingPlan, string> = {
  free: "bg-slate-100 text-slate-600",
  pro: "bg-sky-100 text-sky-700",
  enterprise: "bg-violet-100 text-violet-700",
};

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
  const setEnabled = useSetCompanyEnabled();
  const enterCompany = useEnterCompany();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [toggling, setToggling] = useState<Company | null>(null);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.legal_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [data, query]);

  async function confirmToggle() {
    if (!toggling) return;
    try {
      const result = await setEnabled.mutateAsync({
        companyCode: toggling.company_code,
        enabled: toggling.is_disabled,
      });
      toast.success(result.message || "Updated.");
      setToggling(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleEnter(company: Company) {
    try {
      await enterCompany.mutateAsync(company.company_code);
      toast.success(`Now viewing ${company.legal_name}.`);
      router.push(ROUTES.employees);
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
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy",
            )}
          >
            {initials(c.legal_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{c.legal_name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      ),
    },
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
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${c.legal_name}`}
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEnter(c)} disabled={c.is_disabled}>
              <LogIn className="size-4" />
              Enter company
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditing(c);
                setFormOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setToggling(c)}
              className={c.is_disabled ? undefined : "text-destructive"}
            >
              {c.is_disabled ? "Enable" : "Disable"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Companies"
        description="Manage tenant companies."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add company
          </Button>
        }
      />

      <PageToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search by name or email…" />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.company_code}
        isLoading={isPending}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        emptyIcon={Building2}
        emptyTitle={query ? "No matching companies" : "No companies yet"}
        emptyDescription={query ? "Try a different search term." : "Add your first company to get started."}
      />

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toggling}
        onOpenChange={(open) => !open && setToggling(null)}
        title={toggling?.is_disabled ? `Enable ${toggling?.legal_name}?` : `Disable ${toggling?.legal_name}?`}
        description={
          toggling?.is_disabled
            ? "The company admin will regain access."
            : "The company admin and all its employees will immediately lose access."
        }
        confirmLabel={toggling?.is_disabled ? "Enable" : "Disable"}
        destructive={!toggling?.is_disabled}
        loading={setEnabled.isPending}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
