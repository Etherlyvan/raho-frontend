import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title:        string;
  description?: string;
  children?:    React.ReactNode;   // ✅ tambah children untuk slot action button
  className?:   string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
