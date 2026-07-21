"use client";

/** Route: `/dashboard` — role-aware overview (super_admin / company_admin / employee). */
import { useAuth } from "@/hooks/use-auth";
import FullPageLoader from "@/components/FullPageLoader";
import { SuperAdminOverview } from "@/components/dashboard/overviews/SuperAdminOverview";
import { CompanyAdminOverview } from "@/components/dashboard/overviews/CompanyAdminOverview";
import { EmployeeOverview } from "@/components/dashboard/overviews/EmployeeOverview";

export default function DashboardPage() {
  const auth = useAuth();
  if (auth.status !== "authed") return <FullPageLoader />;

  const { profile } = auth;
  if (profile.role === "super_admin") return <SuperAdminOverview profile={profile} />;
  if (profile.role === "company_admin") return <CompanyAdminOverview profile={profile} />;
  return <EmployeeOverview profile={profile} />;
}
