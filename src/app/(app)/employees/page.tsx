"use client";

/**
 * Route: `/employees` — company employees.
 * Guarded by `employee_master` view permission + tenant context. Mutations require `edit`.
 */
import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useDisabledEmployees, useEnabledEmployees, useSetEmployeeEnabled } from "@/hooks/use-employees";
import { useAutoOpenCreate } from "@/hooks/use-auto-open-create";
import { canEditPage, canViewPage, hasTenantContext } from "@/lib/rbac";
import type { Employee } from "@/lib/api";
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";

export default function EmployeesPage() {
  return (
    <RequireAccess allow={(p) => canViewPage(p, "employee_master") && hasTenantContext(p)}>
      <EmployeesContent />
    </RequireAccess>
  );
}

function EmployeesContent() {
  const auth = useAuth();
  const profile = auth.status === "authed" ? auth.profile : null;
  const canEdit = profile ? canEditPage(profile, "employee_master") : false;

  const [tab, setTab] = useState<"enabled" | "disabled">("enabled");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [toggling, setToggling] = useState<Employee | null>(null);

  useAutoOpenCreate(() => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  });

  const enabledQuery = useEnabledEmployees();
  const disabledQuery = useDisabledEmployees();
  const active = tab === "enabled" ? enabledQuery : disabledQuery;
  const setEnabled = useSetEmployeeEnabled();

  const rows = useMemo(() => {
    if (!active.data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return active.data;
    return active.data.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [active.data, query]);

  async function confirmToggle() {
    if (!toggling) return;
    try {
      const result = await setEnabled.mutateAsync({ email: toggling.email, enabled: tab === "disabled" });
      toast.success(result.message || "Updated.");
      setToggling(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const columns: Column<Employee>[] = [
    { key: "name", header: "Name", cell: (e) => <span className="font-medium text-foreground">{e.name}</span> },
    { key: "email", header: "Email", cell: (e) => e.email },
    { key: "phone", header: "Phone", cell: (e) => e.phone_number ?? "—" },
    { key: "permissions", header: "Permissions", cell: (e) => <PermissionBadges employee={e} /> },
    { key: "status", header: "Status", cell: () => <StatusBadge disabled={tab === "disabled"} /> },
    ...(canEdit
      ? [
          {
            key: "actions",
            header: "Actions",
            headerHidden: true,
            className: "text-right",
            cell: (e: Employee) => (
              <RowActionsMenu label={`Actions for ${e.name}`}>
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(e);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setToggling(e)}
                  className={tab === "disabled" ? undefined : "text-destructive"}
                >
                  {tab === "disabled" ? "Enable" : "Disable"}
                </DropdownMenuItem>
              </RowActionsMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employees"
        description="Manage your company's team members."
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
              Add employee
            </Button>
          ) : undefined
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
            rowKey={(e) => e.code}
            isLoading={active.isPending}
            isError={active.isError}
            errorMessage={(active.error as Error)?.message}
            onRetry={() => active.refetch()}
            emptyIcon={Users}
            emptyTitle={query ? "No matching employees" : `No ${tab === "disabled" ? "disabled" : "active"} employees`}
            emptyIsSearchResult={!!query}
            emptyDescription={query ? "Try a different search term." : undefined}
          />
        </TabsContent>
      </Tabs>

      {canEdit && (
        <>
          <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
          <ConfirmDialog
            open={!!toggling}
            onOpenChange={(open) => !open && setToggling(null)}
            title={tab === "disabled" ? `Enable ${toggling?.name}?` : `Disable ${toggling?.name}?`}
            description={
              tab === "disabled"
                ? "They will regain access to the workspace."
                : "They will immediately lose access to the workspace."
            }
            confirmLabel={tab === "disabled" ? "Enable" : "Disable"}
            destructive={tab !== "disabled"}
            loading={setEnabled.isPending}
            onConfirm={confirmToggle}
          />
        </>
      )}
    </div>
  );
}

function PermissionBadges({ employee }: { employee: Employee }) {
  const perms = employee.permissions;
  if (!perms) return <span className="text-muted-foreground">—</span>;
  const granted = Object.entries(perms).filter(([, level]) => level !== "not_allowed");
  if (granted.length === 0) return <span className="text-muted-foreground">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {granted.map(([page, level]) => (
        <Badge key={page} variant="secondary" className="text-xs capitalize">
          {page.replace("_", " ")}: {level}
        </Badge>
      ))}
    </div>
  );
}
