/** Top bar shown on every screen size: mobile nav trigger + brand on the left (mobile only), notifications + user menu on the right. */
import type { Profile } from "@/lib/api";
import { Brand } from "./Brand";
import { MobileSidebar } from "./MobileSidebar";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar profile={profile} />
        <Brand />
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <NotificationsMenu />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
