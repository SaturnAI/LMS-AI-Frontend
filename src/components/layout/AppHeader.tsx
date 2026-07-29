/** Top bar shown on every screen size: mobile nav trigger + brand on the left (mobile only), notifications + user menu on the right. */
import { Bell } from "lucide-react";
import type { Profile } from "@/lib/api";
import { IconTooltip } from "@/components/common/IconTooltip";
import { Brand } from "./Brand";
import { MobileSidebar } from "./MobileSidebar";
import { UserMenu } from "./UserMenu";

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar profile={profile} />
        <Brand />
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        {/* Static placeholder: no notifications backend yet. */}
        <IconTooltip label="Notifications">
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-5" />
          </button>
        </IconTooltip>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
