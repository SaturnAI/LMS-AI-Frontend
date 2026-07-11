"use client";

/** Route: `/account` — the signed-in user's profile details. */
import { useAuth } from "@/hooks/use-auth";
import { roleLabel } from "@/lib/utils";
import FullPageLoader from "@/components/FullPageLoader";
import { PageHeader } from "@/components/common/PageHeader";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function AccountPage() {
  const auth = useAuth();
  if (auth.status !== "authed") return <FullPageLoader />;

  const { profile } = auth;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Account" description="Your profile details." />
      <div className="rounded-xl border bg-card p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" value={profile.name} />
          <Field label="Email" value={profile.email} />
          <Field label="Role" value={roleLabel(profile.role)} />
          {profile.designation && <Field label="Designation" value={profile.designation} />}
          {profile.phone_number && <Field label="Phone" value={profile.phone_number} />}
          {profile.created_at && <Field label="Member since" value={profile.created_at} />}
        </dl>
      </div>
    </div>
  );
}
