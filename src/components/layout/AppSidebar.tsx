/** Persistent desktop sidebar (hidden below lg). Rendered by the `(app)` layout on every authed route. */
import type { Profile } from "@/lib/api";
import { buildNavigation } from "@/lib/navigation";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";

export function AppSidebar({ profile }: { profile: Profile }) {
  const items = buildNavigation(profile);
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={items} />
      </div>
    </aside>
  );
}
