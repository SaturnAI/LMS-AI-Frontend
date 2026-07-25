"use client";

/**
 * Route: `/logs` — activity/audit log.
 * Guarded by `log_manager` view permission + tenant context. Read-only (logs are auto-written by the backend).
 */
import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { useLogs } from "@/hooks/use-logs";
import { canViewPage, hasTenantContext } from "@/lib/rbac";
import type { ActionType, ActivityLog } from "@/lib/api";
import { PROGRESSION_STYLES, toneClass } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

const ACTION_STYLES: Record<ActionType, string> = {
  add: toneClass("success"),
  edit: toneClass("info"),
  delete: toneClass("danger"),
  disable: toneClass("danger"),
  enable: toneClass("success"),
  uploaded: PROGRESSION_STYLES[2],
};

export default function LogsPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "log_manager") && hasTenantContext(p)}>
      <LogsContent />
    </RequireAccess>
  );
}

function LogsContent() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, isError, error, refetch } = useLogs({ page_number: page, search_query: search });

  const columns: Column<ActivityLog>[] = [
    {
      key: "action",
      header: "Action",
      cell: (l) => (
        <Badge variant="secondary" className={cn("capitalize", ACTION_STYLES[l.action_type])}>
          {l.action_type}
        </Badge>
      ),
    },
    {
      key: "performer",
      header: "Performed by",
      cell: (l) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{l.action_performer_name}</p>
          <p className="truncate text-xs text-muted-foreground">{l.action_performer_email}</p>
        </div>
      ),
    },
    { key: "message", header: "Details", cell: (l) => <span className="text-sm">{l.message}</span> },
    { key: "created_at", header: "When", cell: (l) => <span className="whitespace-nowrap">{l.created_at}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity Logs" description="Audit trail for your company." />

      <PageToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by performer, action, message…"
      />

      <DataTable
        columns={columns}
        rows={data?.activity_logs ?? []}
        rowKey={(l, i) => `${l.created_at}-${l.action_performer_email}-${i}`}
        isLoading={isPending}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        emptyIcon={ScrollText}
        emptyTitle={search ? "No matching activity" : "No activity yet"}
        emptyIsSearchResult={!!search}
        emptyDescription={search ? "Try a different search term." : "Actions across the workspace will show here."}
      />

      {data && data.activity_logs.length > 0 && (
        <Pagination page={page} totalPages={data.total_pages} onPageChange={setPage} disabled={isPending} />
      )}
    </div>
  );
}
