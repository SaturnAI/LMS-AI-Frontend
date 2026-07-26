"use client";

/**
 * Route: `/leads` — CRM leads list.
 * Guarded by `leads` view permission + tenant context. Mutations gated to `edit`
 * for consistent UX (the backend currently allows any tenant user — see
 * DASHBOARD_REQUIREMENTS.md §11.6 for the flagged RBAC gap).
 */
import { useEffect, useMemo, useState } from "react";
import { Contact, Plus } from "lucide-react";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { BackLink } from "@/components/common/BackLink";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LeadPriorityBadge, LeadStatusBadge } from "@/components/dashboard/LeadStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
import { useAutoOpenCreate } from "@/hooks/use-auto-open-create";
import { canEditPage, canViewPage, hasTenantContext, isSuperAdmin } from "@/lib/rbac";
import { companyHubRoute } from "@/lib/constants";
import type { LeadListItem } from "@/lib/api";
import { LeadFormDialog } from "@/components/leads/LeadFormDialog";
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";

const PAGE_SIZE = 10;

export default function LeadsPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "leads") && hasTenantContext(p)}>
      <LeadsContent />
    </RequireAccess>
  );
}

function LeadsContent() {
  const auth = useAuth();
  const profile = auth.status === "authed" ? auth.profile : null;
  const canEdit = profile ? canEditPage(profile, "leads") : false;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeadListItem | null>(null);
  const [viewing, setViewing] = useState<LeadListItem | null>(null);

  useAutoOpenCreate(() => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  });

  // Debounce search input before it drives the server-side query.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, isError, error, refetch } = useLeads({
    batch_number: page,
    batch_size: PAGE_SIZE,
    search_query: search,
  });

  const columns: Column<LeadListItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Lead",
        cell: (l) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{l.name}</p>
            <p className="truncate text-xs text-muted-foreground">{l.company_name}</p>
          </div>
        ),
      },
      { key: "status", header: "Status", cell: (l) => <LeadStatusBadge status={l.status} /> },
      { key: "priority", header: "Priority", cell: (l) => <LeadPriorityBadge priority={l.priority} /> },
      { key: "source", header: "Source", cell: (l) => <span className="capitalize">{l.source.replace("_", " ")}</span> },
      {
        key: "reps",
        header: "Reps",
        cell: (l) => l.sales_representatives?.map((r) => r.name).join(", ") || "—",
      },
      { key: "comments", header: "Comments", cell: (l) => l.comments?.length ?? 0 },
      { key: "created_at", header: "Created", cell: (l) => l.created_at ?? "—" },
      ...(canEdit
        ? [
            {
              key: "actions",
              header: "Actions",
              headerHidden: true,
              className: "text-right",
              cell: (l: LeadListItem) => (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- stop the row's onRowClick from also firing
                <div onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu label={`Actions for ${l.name}`}>
                    <DropdownMenuItem onClick={() => setViewing(l)}>View details</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(l);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                  </RowActionsMenu>
                </div>
              ),
            },
          ]
        : []),
    ],
    [canEdit],
  );

  return (
    <div className="flex flex-col gap-6">
      {profile && isSuperAdmin(profile) && hasTenantContext(profile) && (
        <BackLink href={companyHubRoute(profile.tenant_id!)} label="Back to company" />
      )}

      <PageHeader
        title="Leads"
        description="Manage your CRM pipeline."
        actions={
          canEdit ? (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add lead
            </Button>
          ) : undefined
        }
      />

      <PageToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search leads by name, company, email…"
      />

      <DataTable
        columns={columns}
        rows={data?.leads ?? []}
        rowKey={(l) => l.lead_code}
        isLoading={isPending}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        onRowClick={(l) => setViewing(l)}
        emptyIcon={Contact}
        emptyTitle={search ? "No matching leads" : "No leads yet"}
        emptyIsSearchResult={!!search}
        emptyDescription={search ? "Try a different search term." : "Add your first lead to get started."}
      />

      {data && data.total > 0 && (
        <Pagination page={page} totalPages={data.total_pages} onPageChange={setPage} disabled={isPending} />
      )}

      {canEdit && <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />}

      <LeadDetailDialog
        lead={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={(lead) => {
          setViewing(null);
          setEditing(lead);
          setFormOpen(true);
        }}
        canEdit={canEdit}
      />
    </div>
  );
}
