/** Mobile top bar (hidden on desktop, where nav + user live in the sidebar). */
import type { Profile } from "@/lib/api";
import { Brand } from "./Brand";
import { MobileSidebar } from "./MobileSidebar";
import { UserMenu } from "./UserMenu";

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <MobileSidebar profile={profile} />
        <Brand />
      </div>
      <UserMenu profile={profile} />
    </header>
  );
}
