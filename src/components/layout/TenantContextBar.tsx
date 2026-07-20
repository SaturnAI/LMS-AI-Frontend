"use client";

/** Shows the company a super_admin has entered, with an exit action. Rendered in the sidebar/header. */
import { useRouter } from "next/navigation";
import { Building2, X } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/api";
import { useExitCompany } from "@/hooks/use-companies";
import { hasTenantContext, isSuperAdmin } from "@/lib/rbac";
import { ROUTES } from "@/lib/constants";

/** Shown when a super_admin has entered a company context (`set_tenant_id`). */
export function TenantContextBar({ profile }: { profile: Profile }) {
  const router = useRouter();
  const exitCompany = useExitCompany();

  if (!isSuperAdmin(profile) || !hasTenantContext(profile)) return null;

  async function handleExit() {
    try {
      await exitCompany.mutateAsync();
      toast.success("Exited company context.");
      router.push(ROUTES.companies);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not exit company.");
    }
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-brand-lime/20 py-1 pr-1 pl-3 text-xs text-foreground">
      <Building2 className="size-3.5" aria-hidden />
      <span>
        Viewing: <strong>{profile.tenant_id}</strong>
      </span>
      <button
        type="button"
        onClick={handleExit}
        disabled={exitCompany.isPending}
        aria-label="Exit company context"
        className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
