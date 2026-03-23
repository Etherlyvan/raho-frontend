import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  EncounterStatus,
  InvoiceStatus,
  MemberPackageStatus,
  MemberStatus,
  SessionStatus,
} from "@/types";

// ─── Color maps ────────────────────────────────────────────────

const MEMBER_COLORS: Record<MemberStatus, string> = {
  ACTIVE:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  INACTIVE: "bg-slate-100   text-slate-600   dark:bg-slate-800   dark:text-slate-400",
  LEAD:     "bg-amber-100   text-amber-700   dark:bg-amber-950   dark:text-amber-300",
};

const PACKAGE_COLORS: Record<MemberPackageStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100  text-amber-700  dark:bg-amber-950  dark:text-amber-300",
  ACTIVE:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  COMPLETED:       "bg-sky-100    text-sky-700    dark:bg-sky-950    dark:text-sky-300",
  EXPIRED:         "bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-400",
  CANCELLED:       "bg-red-100    text-red-700    dark:bg-red-950    dark:text-red-300",
};

const SESSION_COLORS: Record<SessionStatus, string> = {
  PLANNED:     "bg-blue-100   text-blue-700   dark:bg-blue-950   dark:text-blue-300",
  IN_PROGRESS: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMPLETED:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  POSTPONED:   "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

const ENCOUNTER_COLORS: Record<EncounterStatus, string> = {
  PLANNED:   "bg-blue-100   text-blue-700   dark:bg-blue-950   dark:text-blue-300",
  ONGOING:   "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-red-100    text-red-700    dark:bg-red-950    dark:text-red-300",
};

const INVOICE_COLORS: Record<InvoiceStatus, string> = {
  PENDING:  "bg-amber-100  text-amber-700  dark:bg-amber-950  dark:text-amber-300",
  PAID:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100    text-red-700    dark:bg-red-950    dark:text-red-300",
};

// ─── Label maps ────────────────────────────────────────────────

const LABELS = {
  member:    { ACTIVE: "Aktif", INACTIVE: "Nonaktif", LEAD: "Prospek" },
  package:   { PENDING_PAYMENT: "Menunggu Bayar", ACTIVE: "Aktif", COMPLETED: "Selesai", EXPIRED: "Kadaluarsa", CANCELLED: "Dibatalkan" },
  session:   { PLANNED: "Dijadwalkan", IN_PROGRESS: "Berlangsung", COMPLETED: "Selesai", POSTPONED: "Ditunda" },
  encounter: { PLANNED: "Dijadwalkan", ONGOING: "Berlangsung", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" },
  invoice:   { PENDING: "Menunggu", PAID: "Lunas", REJECTED: "Ditolak" },
};

// ─── Component ─────────────────────────────────────────────────

interface Props { className?: string }

export function MemberStatusBadge({ status, className }: { status: MemberStatus } & Props) {
  return <Badge className={cn("font-medium border-0", MEMBER_COLORS[status], className)}>{LABELS.member[status]}</Badge>;
}

export function PackageStatusBadge({ status, className }: { status: MemberPackageStatus } & Props) {
  return <Badge className={cn("font-medium border-0", PACKAGE_COLORS[status], className)}>{LABELS.package[status]}</Badge>;
}

export function SessionStatusBadge({ status, className }: { status: SessionStatus } & Props) {
  return (
    <Badge className={cn("font-medium border-0", SESSION_COLORS[status], className)}>
      {status === "IN_PROGRESS" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse inline-block" />
      )}
      {LABELS.session[status]}
    </Badge>
  );
}

export function EncounterStatusBadge({ status, className }: { status: EncounterStatus } & Props) {
  return <Badge className={cn("font-medium border-0", ENCOUNTER_COLORS[status], className)}>{LABELS.encounter[status]}</Badge>;
}

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus } & Props) {
  return <Badge className={cn("font-medium border-0", INVOICE_COLORS[status], className)}>{LABELS.invoice[status]}</Badge>;
}
