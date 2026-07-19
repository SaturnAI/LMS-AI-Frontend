/** Persistent desktop sidebar (hidden below lg): brand, nav, and the user menu footer. */
import type { Profile } from "@/lib/api";
import { buildNavigation } from "@/lib/navigation";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";
import { UserMenu } from "./UserMenu";

export function AppSidebar({ profile }: { profile: Profile }) {
  const items = buildNavigation(profile);
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-muted lg:flex">
      <div className="flex h-16 items-center px-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={items} />
      </div>
      <div className="p-3">
        <UserMenu profile={profile} expanded />
      </div>
    </aside>
  );
}
