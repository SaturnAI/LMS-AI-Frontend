/**
 * Client-only memory of which company a super_admin has "entered".
 *
 * Per the backend API doc, `GET /get_profile` never surfaces `tenant_id` for a
 * super_admin — `set_tenant_id` only rewrites the auth cookie for tenant-scoped
 * endpoints (employees/leads/logs) to read server-side. There is no way to observe
 * "am I currently in a company context" from the profile response at all, so the
 * frontend has to remember it locally (and restore it across reloads) instead.
 */
const KEY = "lms-ai:entered-tenant";

export function getStoredTenantId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(KEY) ?? undefined;
}

export function setStoredTenantId(companyCode: string | null): void {
  if (typeof window === "undefined") return;
  if (companyCode) window.localStorage.setItem(KEY, companyCode);
  else window.localStorage.removeItem(KEY);
}
