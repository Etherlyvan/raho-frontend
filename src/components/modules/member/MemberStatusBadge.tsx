import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MemberStatus } from "@/types";

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  ACTIVE: {
    label:     "Aktif",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  },
  INACTIVE: {
    label:     "Nonaktif",
    className: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
  },
  LEAD: {
    label:     "Lead",
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
  },
};

interface Props {
  status:    MemberStatus;
  className?: string;
}

export function MemberStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
