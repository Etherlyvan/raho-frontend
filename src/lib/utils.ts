import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type {
  EncounterStatus,
  InvoiceStatus,
  MemberPackageStatus,
  MemberStatus,
  RoleName,
  SessionStatus,
} from "@/types";

// ─── Tailwind class merge ──────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatters ───────────────────────────────────────────

export function formatDate(date: string | Date | null | undefined, fmt = "dd MMM yyyy"): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, fmt, { locale: id });
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

// ─── Currency formatter ────────────────────────────────────────

export function formatRupiah(amount: number | null | undefined): string {
  if (amount == null) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Status labels ─────────────────────────────────────────────

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE:   "Aktif",
  INACTIVE: "Nonaktif",
  LEAD:     "Prospek",
};

export const PACKAGE_STATUS_LABELS: Record<MemberPackageStatus, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  ACTIVE:          "Aktif",
  COMPLETED:       "Selesai",
  EXPIRED:         "Kadaluarsa",
  CANCELLED:       "Dibatalkan",
};

export const ENCOUNTER_STATUS_LABELS: Record<EncounterStatus, string> = {
  PLANNED:   "Dijadwalkan",
  ONGOING:   "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  PLANNED:     "Dijadwalkan",
  IN_PROGRESS: "Berlangsung",
  COMPLETED:   "Selesai",
  POSTPONED:   "Ditunda",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING:  "Menunggu",
  PAID:     "Lunas",
  REJECTED: "Ditolak",
};

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN:  "Super Admin",
  MASTER_ADMIN: "Master Admin",
  ADMIN:        "Admin",
  DOCTOR:       "Dokter",
  NURSE:        "Perawat",
  PATIENT:      "Pasien",
};

// ─── Cache & Cookie cleaner ────────────────────────────────────

export function clearAllClientStorage(): void {
  if (typeof window === "undefined") return;

  // Clear localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear all non-httpOnly cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
}

// ─── API Error extractor ───────────────────────────────────────

export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan"): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}
