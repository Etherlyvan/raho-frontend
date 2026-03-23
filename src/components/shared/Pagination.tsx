import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";

export interface PaginationProps {
  meta:         PaginationMeta;
  page:         number;            // ✅ tambah prop page (controlled)
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, page, onPageChange }: PaginationProps) {
  const { totalPages, total, limit } = meta;

  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Menampilkan <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span>{" "}
        dari <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> data
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers — tampilkan max 5 halaman */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) =>
            p === 1 ||
            p === totalPages ||
            Math.abs(p - page) <= 1,
          )
          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm select-none">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            ),
          )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
