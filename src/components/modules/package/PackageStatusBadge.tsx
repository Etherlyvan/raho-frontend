import { Badge }  from "@/components/ui/badge";
import { cn }     from "@/lib/utils";
import type { MemberPackageStatus } from "@/types";

const STATUS_CONFIG: Record<MemberPackageStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label:     "Menunggu Bayar",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  ACTIVE: {
    label:     "Aktif",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  },
  COMPLETED: {
    label:     "Selesai",
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
  },
  EXPIRED: {
    label:     "Kedaluwarsa",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  },
  CANCELLED: {
    label:     "Dibatalkan",
    className: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
  },
};

interface Props {
  status:    MemberPackageStatus;
  className?: string;
}

export function PackageStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
