import type { PermissionLevel, Profile, UserRole } from "@/lib/api";

export type PermissionPage = "employee_master" | "leads" | "log_manager";

export const isSuperAdmin = (p: Profile): boolean => p.role === "super_admin";
export const isCompanyAdmin = (p: Profile): boolean => p.role === "company_admin";
export const isEmployee = (p: Profile): boolean => p.role === "employee";
export const isAdminRole = (role: UserRole): boolean => role === "super_admin" || role === "company_admin";

/**
 * Effective permission for a page. Admins (super/company) are always `edit`;
 * employees use their per-page permission (default `not_allowed`).
 */
export function pagePermission(profile: Profile, page: PermissionPage): PermissionLevel {
  if (isAdminRole(profile.role)) return "edit";
  return profile.permissions?.[page] ?? "not_allowed";
}

export const canViewPage = (profile: Profile, page: PermissionPage): boolean =>
  pagePermission(profile, page) !== "not_allowed";

export const canEditPage = (profile: Profile, page: PermissionPage): boolean =>
  pagePermission(profile, page) === "edit";

/**
 * Tenant-scoped screens require a tenant context. company_admin/employee always
 * have one; a super_admin only after entering a company (`set_tenant_id`),
 * surfaced here as a populated `tenant_id`.
 */
export const hasTenantContext = (profile: Profile): boolean =>
  profile.role !== "super_admin" || Boolean(profile.tenant_id);
