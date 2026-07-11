"use client";

/** Recent companies list card. Rendered on super_admin `/dashboard`. */
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/use-companies";
import { ROUTES } from "@/lib/constants";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SectionCard } from "./SectionCard";
import { ListSkeleton } from "./ListSkeleton";

const MAX_ITEMS = 6;

export function RecentCompaniesCard() {
  const { data, isPending, isError, error, refetch } = useCompanies();

  return (
    <SectionCard
      title="Companies"
      action={
        <Link href={ROUTES.companies} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      }
    >
      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={Building2} title="No companies yet" description="Add your first company to get started." />
        </div>
      ) : (
        <ul className="divide-y">
          {data.slice(0, MAX_ITEMS).map((company) => (
            <li key={company.company_code} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{company.legal_name}</p>
                <p className="truncate text-xs text-muted-foreground">{company.email}</p>
              </div>
              <Badge variant={company.is_disabled ? "outline" : "secondary"}>
                {company.is_disabled ? "Disabled" : "Active"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
