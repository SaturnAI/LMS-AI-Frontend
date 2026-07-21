"use client";

/** Search box + trailing actions row. Used at the top of every resource list page. */
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PageToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export function PageToolbar({ searchValue, onSearchChange, searchPlaceholder = "Search…", children }: PageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className="w-48 pl-8 sm:w-64"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
