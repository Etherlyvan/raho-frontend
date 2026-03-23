import { Badge } from "@/components/ui/badge";
import { cn, ROLE_LABELS } from "@/lib/utils";
import type { RoleName } from "@/types";

const ROLE_COLOR: Record<RoleName, string> = {
  SUPER_ADMIN:  "border-violet-200 bg-violet-50  text-violet-700  dark:border-violet-800 dark:bg-violet-950  dark:text-violet-400",
  MASTER_ADMIN: "border-blue-200   bg-blue-50    text-blue-700    dark:border-blue-800   dark:bg-blue-950    dark:text-blue-400",
  ADMIN:        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  DOCTOR:       "border-sky-200    bg-sky-50     text-sky-700     dark:border-sky-800    dark:bg-sky-950     dark:text-sky-400",
  NURSE:        "border-teal-200   bg-teal-50    text-teal-700    dark:border-teal-800   dark:bg-teal-950    dark:text-teal-400",
  PATIENT:      "border-rose-200   bg-rose-50    text-rose-700    dark:border-rose-800   dark:bg-rose-950    dark:text-rose-400",
};

interface Props {
  role:      RoleName;
  className?: string;
}

export function RoleBadge({ role, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", ROLE_COLOR[role], className)}
    >
      {ROLE_LABELS[role]}
    </Badge>
  );
}
