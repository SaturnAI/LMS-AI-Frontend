/** Prev/Next pager. `totalPages` may be unknown (logs API doesn't return a total item count). */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  const hasNext = totalPages === undefined ? true : page < totalPages;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">
        Page {page}
        {totalPages !== undefined ? ` of ${totalPages}` : ""}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={disabled || !hasNext} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
