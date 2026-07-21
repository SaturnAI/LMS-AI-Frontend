"use client";

/** Recent leads list card (loading/empty/error states). Rendered on `/dashboard`. */
import Link from "next/link";
import { Contact } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { ROUTES } from "@/lib/constants";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionCard } from "./SectionCard";
import { ListSkeleton } from "./ListSkeleton";
import { LeadStatusBadge } from "./LeadStatusBadge";

export function RecentLeadsCard({ title = "Recent leads" }: { title?: string }) {
  const { data, isPending, isError, error, refetch } = useLeads({ batch_number: 1, batch_size: 5 });

  return (
    <SectionCard
      title={title}
      action={
        <Link href={ROUTES.leads} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      }
    >
      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : data.leads.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={Contact} title="No leads yet" description="New leads will appear here." />
        </div>
      ) : (
        <ul className="divide-y">
          {data.leads.map((lead) => (
            <li key={lead.lead_code} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                <p className="truncate text-xs text-muted-foreground">{lead.company_name}</p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
