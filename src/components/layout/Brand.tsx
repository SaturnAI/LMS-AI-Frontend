/** Brand logo + wordmark linking to the dashboard. Rendered in the sidebar & mobile drawer. */
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function Brand() {
  return (
    <Link href={ROUTES.dashboard} className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[9px] bg-brand-navy">
        <span className="size-2.5 rotate-45 rounded-[2px] bg-brand-lime" />
      </span>
      <span className="font-bold tracking-tight text-foreground">LMS AI</span>
    </Link>
  );
}
