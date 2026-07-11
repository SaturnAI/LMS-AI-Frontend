"use client";

/** Recent activity-log feed card. Rendered on `/dashboard` (where log_manager view is allowed). */
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { useLogs } from "@/hooks/use-logs";
import { ROUTES } from "@/lib/constants";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionCard } from "./SectionCard";
import { ListSkeleton } from "./ListSkeleton";

const MAX_ITEMS = 6;

export function RecentActivityCard() {
  const { data, isPending, isError, error, refetch } = useLogs({ page_number: 1 });

  return (
    <SectionCard
      title="Recent activity"
      action={
        <Link href={ROUTES.logs} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      }
    >
      {isPending ? (
        <ListSkeleton rows={6} />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : data.activity_logs.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={ScrollText} title="No activity yet" description="Actions across the workspace will show here." />
        </div>
      ) : (
        <ul className="divide-y">
          {data.activity_logs.slice(0, MAX_ITEMS).map((log, i) => (
            <li key={`${log.created_at}-${i}`} className="px-5 py-3">
              <p className="text-sm text-foreground">{log.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{log.created_at}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
