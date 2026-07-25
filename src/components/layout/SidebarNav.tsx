"use client";

/** Navigation link list with an active white "pill". Used by the desktop & mobile sidebars. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function SidebarNav({ items, onNavigate, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
