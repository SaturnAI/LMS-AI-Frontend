"use client";

/** Searchable + sortable companies grid for the super_admin dashboard. Client-side over the fetched list. */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CompanyCard } from "./CompanyCard";

type SortKey = "name" | "seats";

export function CompaniesBoard() {
  const { data, isPending, isError, error, refetch } = useCompanies();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  const companies = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((c) => c.legal_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      : data;
    return [...filtered].sort((a, b) =>
      sort === "seats"
        ? (b.employee_limit ?? 0) - (a.employee_limit ?? 0)
        : a.legal_name.localeCompare(b.legal_name),
    );
  }, [data, query, sort]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Companies</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              aria-label="Search companies"
              className="w-40 pl-8 sm:w-52"
            />
          </div>
          <div className="flex rounded-lg bg-muted p-0.5">
            {(["name", "seats"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
                  sort === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key}
              </button>
            ))}
          </div>
          <Link href={ROUTES.companies} className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={query ? "No matching companies" : "No companies yet"}
          description={query ? "Try a different search term." : "Add your first company to get started."}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((company) => (
            <CompanyCard key={company.company_code} company={company} />
          ))}
        </div>
      )}
    </section>
  );
}
