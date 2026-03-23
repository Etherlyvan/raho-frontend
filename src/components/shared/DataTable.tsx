import {
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton }    from "@/components/ui/skeleton";
import { EmptyState }  from "@/components/shared/EmptyState";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData> {
  table:      TanstackTable<TData>;   // ✅ generic TData
  isLoading?: boolean;
  skeletonRows?: number;
}

export function DataTable<TData>({
  table,
  isLoading    = false,
  skeletonRows = 8,
}: DataTableProps<TData>) {
  const columns     = table.getAllColumns();
  const columnCount = columns.length;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted  = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap",
                      canSort && "cursor-pointer select-none",
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                      {canSort && (
                        <span className="text-slate-400">
                          {sorted === "asc"  ? <ArrowUp   className="h-3.5 w-3.5" /> :
                           sorted === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> :
                                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton rows
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {Array.from({ length: columnCount }).map((_, colIdx) => (
                  <TableCell key={`skeleton-${rowIdx}-${colIdx}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-48 text-center p-0">
                <EmptyState
                  title="Tidak ada data"
                  description="Belum ada data yang tersedia"
                />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
