"use client";

import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta:     PaginationMeta;
  onChange: (page: number) => void;
}

export function Pagination({ meta, onChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;

  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Menampilkan <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span> dari{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> data
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(1)}        disabled={page <= 1}><ChevronsLeft  className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(page - 1)} disabled={page <= 1}><ChevronLeft   className="h-3.5 w-3.5" /></Button>
        <span className="px-3 text-sm text-slate-600 dark:text-slate-400">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(page + 1)} disabled={page >= totalPages}><ChevronRight  className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(totalPages)} disabled={page >= totalPages}><ChevronsRight className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}
