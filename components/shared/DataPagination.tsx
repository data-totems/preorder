"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Numeric pager that drops into any client-side list.
 * Renders nothing for single-page collections so list pages stay clean
 * when there's not enough data to scroll yet.
 */
const DataPagination: React.FC<DataPaginationProps> = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const go = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Build a compact page list: 1 … current-1, current, current+1 … last
  const pages: (number | "ellipsis")[] = [];
  const push = (n: number | "ellipsis") => pages.push(n);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (currentPage > 3) push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) push(i);
    if (currentPage < totalPages - 2) push("ellipsis");
    push(totalPages);
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => go(e, currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === currentPage}
                onClick={(e) => go(e, p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => go(e, currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DataPagination;

/**
 * Slices `items` to the current page. When the list shrinks below the current
 * page (filter change, refetch), clamps the *derived* page so the render is
 * immediate — the stored state catches up on the next tick. Avoids a one-paint
 * empty grid when navigating between search/category filters.
 */
export function usePaginated<T>(items: T[], pageSize: number) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, page: safePage, setPage, totalPages, totalItems: items.length };
}
