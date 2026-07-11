/** Top app bar: mobile menu trigger, tenant-context bar, user menu. Rendered by the `(app)` layout. */
import type { Profile } from "@/lib/api";
import { MobileSidebar } from "./MobileSidebar";
import { TenantContextBar } from "./TenantContextBar";
import { UserMenu } from "./UserMenu";

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar profile={profile} />
        <TenantContextBar profile={profile} />
      </div>
      <UserMenu profile={profile} />
    </header>
  );
}
