/** Responsive grid wrapper for KPI cards. `columns` should match the max number of cards this dashboard ever renders, so a short row doesn't leave an empty gap. */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const XL_COLS = {
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
} as const;

export function KpiGrid({ children, columns = 4 }: KpiGridProps) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", XL_COLS[columns])}>{children}</div>;
}
