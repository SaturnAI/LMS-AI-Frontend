"use client";

/** Route: `/super-admins` — platform administrators management (super_admin only). */
import { useMemo, useState } from "react";
import { Plus, ShieldCheck, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { PageToolbar } from "@/components/common/PageToolbar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSetSuperAdminEnabled, useSuperAdmins } from "@/hooks/use-super-admins";
import { isSuperAdmin } from "@/lib/rbac";
import type { SuperAdmin } from "@/lib/api";
import { SuperAdminFormDialog } from "@/components/super-admins/SuperAdminFormDialog";

export default function SuperAdminsPage() {
  return (
    <RequireAccess allow={isSuperAdmin}>
      <SuperAdminsContent />
    </RequireAccess>
  );
}

function SuperAdminsContent() {
  const auth = useAuth();
  const currentEmail = auth.status === "authed" ? auth.profile.email : undefined;

  const { data, isPending, isError, error, refetch } = useSuperAdmins();
  const setEnabled = useSetSuperAdminEnabled();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SuperAdmin | null>(null);
  const [toggling, setToggling] = useState<SuperAdmin | null>(null);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [data, query]);

  async function confirmToggle() {
    if (!toggling) return;
    try {
      const result = await setEnabled.mutateAsync({ email: toggling.email, enabled: toggling.is_disabled });
      toast.success(result.message || "Updated.");
      setToggling(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const columns: Column<SuperAdmin>[] = [
    { key: "name", header: "Name", cell: (a) => <span className="font-medium text-foreground">{a.name}</span> },
    { key: "email", header: "Email", cell: (a) => a.email },
    { key: "phone", header: "Phone", cell: (a) => a.phone_number ?? "—" },
    { key: "status", header: "Status", cell: (a) => <StatusBadge disabled={a.is_disabled} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${a.name}`}
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditing(a);
                setFormOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={a.email === currentEmail}
              onClick={() => setToggling(a)}
              className={a.is_disabled ? undefined : "text-destructive"}
            >
              {a.is_disabled ? "Enable" : "Disable"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Super Admins"
        description="Manage platform administrators."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add super admin
          </Button>
        }
      />

      <PageToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search by name or email…" />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.code}
        isLoading={isPending}
        isError={isError}
        errorMessage={(error as Error)?.message}
        onRetry={() => refetch()}
        emptyIcon={ShieldCheck}
        emptyTitle={query ? "No matching admins" : "No super admins yet"}
        emptyDescription={query ? "Try a different search term." : "Add your first platform administrator."}
      />

      <SuperAdminFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toggling}
        onOpenChange={(open) => !open && setToggling(null)}
        title={toggling?.is_disabled ? `Enable ${toggling?.name}?` : `Disable ${toggling?.name}?`}
        description={
          toggling?.is_disabled
            ? "They will regain access to the platform."
            : "They will immediately lose access to the platform."
        }
        confirmLabel={toggling?.is_disabled ? "Enable" : "Disable"}
        destructive={!toggling?.is_disabled}
        loading={setEnabled.isPending}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
