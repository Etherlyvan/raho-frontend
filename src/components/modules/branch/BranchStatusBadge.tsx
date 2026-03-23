import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  isActive: boolean;
  className?: string;
}

export function BranchStatusBadge({ isActive, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
        className,
      )}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}
