import { describe, expect, it } from "vitest";
import type { PermissionLevel, Profile, UserRole } from "@/lib/api";
import { canEditPage, canViewPage, hasTenantContext, pagePermission } from "@/lib/rbac";
import { buildNavigation } from "@/lib/navigation";

function makeProfile(role: UserRole, overrides: Partial<Profile> = {}): Profile {
  return {
    name: "Test User",
    email: "test@example.com",
    role,
    permissions: {},
    ...overrides,
  };
}

const employeePerms = (perms: Record<string, PermissionLevel>) =>
  makeProfile("employee", { tenant_id: "C1", permissions: perms });

describe("pagePermission / canView / canEdit", () => {
  it("grants admins edit on every page", () => {
    for (const role of ["super_admin", "company_admin"] as const) {
      const p = makeProfile(role);
      expect(pagePermission(p, "leads")).toBe("edit");
      expect(canEditPage(p, "employee_master")).toBe(true);
      expect(canViewPage(p, "log_manager")).toBe(true);
    }
  });

  it("respects an employee's per-page permission", () => {
    const p = employeePerms({ leads: "view", employee_master: "not_allowed", log_manager: "edit" });
    expect(canViewPage(p, "leads")).toBe(true);
    expect(canEditPage(p, "leads")).toBe(false);
    expect(canViewPage(p, "employee_master")).toBe(false);
    expect(canEditPage(p, "log_manager")).toBe(true);
  });

  it("defaults missing employee permissions to not_allowed", () => {
    const p = employeePerms({});
    expect(pagePermission(p, "leads")).toBe("not_allowed");
    expect(canViewPage(p, "leads")).toBe(false);
  });
});

describe("hasTenantContext", () => {
  it("is always true for company_admin and employee", () => {
    expect(hasTenantContext(makeProfile("company_admin", { tenant_id: "C1" }))).toBe(true);
    expect(hasTenantContext(employeePerms({}))).toBe(true);
  });

  it("is false for a super_admin without a tenant, true once entered", () => {
    expect(hasTenantContext(makeProfile("super_admin"))).toBe(false);
    expect(hasTenantContext(makeProfile("super_admin", { tenant_id: "C1" }))).toBe(true);
  });
});

describe("buildNavigation", () => {
  const keys = (p: Profile) => buildNavigation(p).map((i) => i.key);

  it("super_admin sees platform nav, tenant nav only in a company context", () => {
    expect(keys(makeProfile("super_admin"))).toEqual(["dashboard", "notes", "companies", "super-admins"]);
    expect(keys(makeProfile("super_admin", { tenant_id: "C1" }))).toEqual([
      "dashboard",
      "notes",
      "companies",
      "super-admins",
      "leads",
      "employees",
      "logs",
    ]);
  });

  it("company_admin sees all tenant modules plus company profile", () => {
    expect(keys(makeProfile("company_admin", { tenant_id: "C1" }))).toEqual([
      "dashboard",
      "notes",
      "leads",
      "employees",
      "logs",
      "company-profile",
    ]);
  });

  it("employee only sees permitted modules", () => {
    const p = employeePerms({ leads: "view", employee_master: "not_allowed", log_manager: "view" });
    expect(keys(p)).toEqual(["dashboard", "notes", "leads", "logs"]);
  });
});
