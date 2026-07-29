"use client";

/** Mobile navigation drawer (Sheet), shown below lg. Triggered from the header. */
import { useState } from "react";
import { Menu } from "lucide-react";
import type { Profile } from "@/lib/api";
import { buildNavigation } from "@/lib/navigation";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IconTooltip } from "@/components/common/IconTooltip";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";

export function MobileSidebar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const items = buildNavigation(profile);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <IconTooltip label="Open menu">
        <SheetTrigger
          aria-label="Open navigation menu"
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="size-5" />
        </SheetTrigger>
      </IconTooltip>
      <SheetContent side="left" className="w-72 bg-muted p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-16 items-center px-6">
          <Brand />
        </div>
        <SidebarNav items={items} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
