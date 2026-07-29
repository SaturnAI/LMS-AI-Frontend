"use client";

/**
 * Notifications panel. UI shell only — there's no backend notifications endpoint yet
 * (confirmed against the API doc), so this always renders the empty state. Swap the
 * body out for a real feed once a notifications endpoint exists.
 */
import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconTooltip } from "@/components/common/IconTooltip";
import { EmptyState } from "@/components/common/EmptyState";

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <IconTooltip label="Notifications">
        <DropdownMenuTrigger
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
        </DropdownMenuTrigger>
      </IconTooltip>
      <DropdownMenuContent align="end" className="w-[35rem] h-[20rem] p-0">
        <div className="border-b px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
        </div>
        <div className="p-5">
          <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
