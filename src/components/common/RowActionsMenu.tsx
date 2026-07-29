/** Shared "..." row-actions trigger + dropdown for resource tables (Companies, Employees, Super Admins, ...). */
import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconTooltip } from "@/components/common/IconTooltip";

interface RowActionsMenuProps {
  label: string;
  children: ReactNode;
}

export function RowActionsMenu({ label, children }: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <IconTooltip label={label}>
        <DropdownMenuTrigger
          aria-label={label}
          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
      </IconTooltip>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
