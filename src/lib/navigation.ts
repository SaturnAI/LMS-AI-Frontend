import type { ComponentType } from "react";
import {
  Building,
  Building2,
  Contact,
  LayoutDashboard,
  NotebookText,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Profile } from "@/lib/api";
import { ROUTES } from "./constants";
import { canViewPage, hasTenantContext, isCompanyAdmin, isSuperAdmin } from "./rbac";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const DASHBOARD: NavItem = { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard };
const NOTES: NavItem = { key: "notes", label: "Notes", href: ROUTES.notes, icon: NotebookText };
const LEADS: NavItem = { key: "leads", label: "Leads", href: ROUTES.leads, icon: Contact };
const EMPLOYEES: NavItem = { key: "employees", label: "Employees", href: ROUTES.employees, icon: Users };
const LOGS: NavItem = { key: "logs", label: "Activity Logs", href: ROUTES.logs, icon: ScrollText };

/** Sidebar items for the current user, filtered by role + permission + tenant context. */
export function buildNavigation(profile: Profile): NavItem[] {
  const items: NavItem[] = [DASHBOARD, NOTES];

  if (isSuperAdmin(profile)) {
    items.push({ key: "companies", label: "Companies", href: ROUTES.companies, icon: Building2 });
    items.push({ key: "super-admins", label: "Super Admins", href: ROUTES.superAdmins, icon: ShieldCheck });
    if (hasTenantContext(profile)) items.push(LEADS, EMPLOYEES, LOGS);
    return items;
  }

  if (canViewPage(profile, "leads")) items.push(LEADS);
  if (canViewPage(profile, "employee_master")) items.push(EMPLOYEES);
  if (canViewPage(profile, "log_manager")) items.push(LOGS);
  if (isCompanyAdmin(profile)) {
    items.push({ key: "company-profile", label: "Company Profile", href: ROUTES.companyProfile, icon: Building });
  }
  return items;
}
