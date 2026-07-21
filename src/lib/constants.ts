/** Canonical route paths — reference these instead of hardcoding strings. */
export const ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  leads: "/leads",
  employees: "/employees",
  companies: "/companies",
  superAdmins: "/super-admins",
  logs: "/logs",
  companyProfile: "/company-profile",
  account: "/account",
} as const;

/** Employee-permissioned pages (mirror of the backend permission matrix). */
export const PERMISSION_PAGES = ["employee_master", "leads", "log_manager"] as const;
