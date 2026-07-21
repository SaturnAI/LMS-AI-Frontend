/** Titled card with a header action + body. Frames dashboard list widgets. */
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
