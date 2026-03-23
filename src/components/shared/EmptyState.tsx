import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?:       string;
  description?: string;
  action?:      React.ReactNode;
  icon?:        React.ElementType;
  className?:   string;
}

export function EmptyState({
  title       = "Data tidak ditemukan",
  description = "Belum ada data yang tersedia saat ini.",
  action,
  icon: Icon  = FileSearch,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
