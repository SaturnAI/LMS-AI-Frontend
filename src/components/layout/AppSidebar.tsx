"use client";

/** Persistent desktop sidebar (hidden below lg): brand + nav. Collapsible to an icon rail. Profile lives in the header. */
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Profile } from "@/lib/api";
import { buildNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { IconTooltip } from "@/components/common/IconTooltip";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";

const STORAGE_KEY = "lms-ai:sidebar-collapsed";

export function AppSidebar({ profile }: { profile: Profile }) {
  const items = buildNavigation(profile);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col bg-muted transition-[width] duration-150 lg:flex",
        collapsed ? "w-[76px]" : "w-60",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center", collapsed ? "justify-center px-2" : "justify-between px-6")}>
        <Brand collapsed={collapsed} />
        {!collapsed && (
          <IconTooltip label="Collapse sidebar">
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-card/60 hover:text-foreground"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </IconTooltip>
        )}
      </div>

      {collapsed && (
        <IconTooltip label="Expand sidebar">
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="mx-auto mb-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-card/60 hover:text-foreground"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        </IconTooltip>
      )}

      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={items} collapsed={collapsed} />
      </div>
    </aside>
  );
}
