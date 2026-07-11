/** Row of primary "Add …" buttons. Rendered in the dashboard page header. */
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export interface QuickAction {
  label: string;
  href: string;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}
