"use client";

/**
 * Route: `/logs` — activity/audit log.
 * Guarded by `log_manager` view permission + tenant context. Read-only (logs are auto-written by the backend).
 *
 * The backend (`GET /log_manager/get_logs`) only accepts `page_number`/`search_query` —
 * there's no server-side action-type or date-range filtering, and no per-log "changes"
 * diff or success/failure status. Action type + date range below filter the currently
 * loaded (fixed 50-row) page only; "changes"/"status" columns from other audit-log UIs
 * don't apply here since the backend doesn't record that data.
 */
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ScrollText } from "lucide-react";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { BackLink } from "@/components/common/BackLink";
import { ActionTypeIcon } from "@/components/logs/ActionTypeIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useLogs } from "@/hooks/use-logs";
import { canViewPage, hasTenantContext, isSuperAdmin } from "@/lib/rbac";
import { companyHubRoute } from "@/lib/constants";
import { parseLogTimestamp } from "@/lib/log-meta";
import { avatarTintFor } from "@/lib/avatar-color";
import { cn, initials } from "@/lib/utils";
import type { ActionType, ActivityLog } from "@/lib/api";

const ACTION_TYPES: ActionType[] = ["add", "edit", "delete", "disable", "enable", "uploaded"];

export default function LogsPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "log_manager") && hasTenantContext(p)}>
      <LogsContent />
    </RequireAccess>
  );
}

function LogsContent() {
  const auth = useAuth();
  const profile = auth.status === "authed" ? auth.profile : null;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<ActionType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, isError, error, refetch } = useLogs({ page_number: page, search_query: search });

  const hasFilters = actionFilter !== "all" || !!dateFrom || !!dateTo;

  const rows = useMemo(() => {
    const all = data?.activity_logs ?? [];
    return all.filter((l) => {
      if (actionFilter !== "all" && l.action_type !== actionFilter) return false;
      if (dateFrom || dateTo) {
        const d = parseLogTimestamp(l.created_at);
        if (d) {
          if (dateFrom && d < new Date(`${dateFrom}T00:00:00Z`)) return false;
          if (dateTo && d > new Date(`${dateTo}T23:59:59Z`)) return false;
        }
      }
      return true;
    });
  }, [data, actionFilter, dateFrom, dateTo]);

  const columns: Column<ActivityLog>[] = [
    {
      key: "action",
      header: "Action type",
      cell: (l) => (
        <div className="flex items-center gap-2.5">
          <ActionTypeIcon type={l.action_type} />
          <span className="text-sm font-medium capitalize">{l.action_type}</span>
        </div>
      ),
    },
    { key: "message", header: "Description", cell: (l) => <span className="text-sm">{l.message}</span> },
    {
      key: "performer",
      header: "Performed by",
      cell: (l) => (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold",
              avatarTintFor(l.action_performer_email),
            )}
          >
            {initials(l.action_performer_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{l.action_performer_name}</p>
            <p className="truncate text-xs text-muted-foreground">{l.action_performer_email}</p>
          </div>
        </div>
      ),
    },
    { key: "created_at", header: "Timestamp", cell: (l) => <span className="whitespace-nowrap">{l.created_at}</span> },
  ];

  const rangeLabel = dateFrom || dateTo ? `${dateFrom || "…"} – ${dateTo || "…"}` : "All time";

  return (
    <div className="flex flex-col gap-6">
      {profile && isSuperAdmin(profile) && hasTenantContext(profile) && (
        <BackLink href={companyHubRoute(profile.tenant_id!)} label="Back to company" />
      )}

      <PageHeader title="Activity Logs" description="Audit trail for your company." />

      <div className="grid gap-4 rounded-2xl bg-muted/40 p-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Action type</Label>
          <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionType | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Date range</Label>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" className="w-full justify-start font-normal" />}>
              <CalendarIcon className="size-4" />
              {rangeLabel}
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <PageToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by performer, action, message…"
      />

      {hasFilters && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Action type and date range filters apply to the currently loaded page only.
        </p>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(l, i) => `${l.created_at}-${l.action_performer_email}-${i}`}
        isLoading={isPending}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        emptyIcon={ScrollText}
        emptyTitle={search || hasFilters ? "No matching activity" : "No activity yet"}
        emptyIsSearchResult={!!search || hasFilters}
        emptyDescription={
          search || hasFilters ? "Try a different search term or filter." : "Actions across the workspace will show here."
        }
      />

      {data && data.activity_logs.length > 0 && (
        <Pagination page={page} totalPages={data.total_pages} onPageChange={setPage} disabled={isPending} />
      )}
    </div>
  );
}
