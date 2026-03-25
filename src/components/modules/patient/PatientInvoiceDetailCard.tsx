'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Download,
  Loader2,
  CalendarDays,
  MapPin,
  User,
  Syringe,
  Package,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { invoicesApi } from '@/lib/api/endpoints/invoices';
import {
  formatDate,
  formatRupiah,
  INVOICE_STATUS_LABELS,
  getApiErrorMessage,
} from '@/lib/utils';
import type { Invoice, InvoiceStatus, PelaksanaanType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { color: string; icon: React.ElementType }
> = {
  PENDING: {
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0',
    icon: Clock,
  },
  PAID: {
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0',
    icon: CheckCircle2,
  },
  OVERDUE: {
    color:
      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0',
    icon: XCircle,
  },
  REJECTED: {
    color:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0',
    icon: XCircle,
  },
};

const PELAKSANAAN_LABEL: Record<PelaksanaanType, string> = {
  KLINIK: 'Di Klinik',
  HOMECARE: 'Home Care',
};

// ---------------------------------------------------------------------------
// Helper: trigger download blob
// ---------------------------------------------------------------------------

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Sub-component: MetaRow
// ---------------------------------------------------------------------------

interface MetaRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

function MetaRow({ icon: Icon, label, value }: MetaRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5 rounded-md p-1.5 bg-slate-100 dark:bg-slate-800">
        <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  invoice: Invoice;
}

export function PatientInvoiceDetailCard({ invoice }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { color: statusColor, icon: StatusIcon } =
    INVOICE_STATUS_CONFIG[invoice.status];

  async function handleDownloadPdf(): Promise<void> {
    setIsDownloading(true);
    try {
      const res = await invoicesApi.pdf(invoice.invoiceId);
      triggerBlobDownload(
        res.data,
        `invoice-${invoice.invoiceId.slice(0, 8)}.pdf`,
      );
      toast.success('PDF invoice berhasil diunduh');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mengunduh PDF invoice'));
    } finally {
      setIsDownloading(false);
    }
  }

  // Hitung subtotal per item dan grand total untuk verifikasi
  const itemsWithSubtotal = invoice.items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.price,
  }));

  return (
    <div className="space-y-5">
      {/* ── Header: Nominal + Status + PDF ─────────────────────────────── */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            {/* Kiri: nominal + status */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                Total Tagihan
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {formatRupiah(invoice.amount)}
              </p>
              <Badge className={`gap-1.5 ${statusColor}`}>
                <StatusIcon className="h-3 w-3" />
                {INVOICE_STATUS_LABELS[invoice.status]}
              </Badge>
            </div>

            {/* Kanan: tombol unduh PDF */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
            </Button>
          </div>

          {/* Info tambahan: tanggal buat & tanggal bayar */}
          <Separator className="my-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Tanggal Invoice</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {formatDate(invoice.createdAt)}
              </p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Tanggal Lunas</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatDate(invoice.paidAt)}
                </p>
              </div>
            )}
            {invoice.verifiedByUser?.profile?.fullName && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Diverifikasi</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {invoice.verifiedByUser.profile.fullName}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Info Pasien & Sesi ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Informasi Pasien */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Informasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <MetaRow
              icon={User}
              label="Nama"
              value={invoice.member.fullName}
            />
            <MetaRow
              icon={FileText}
              label="Nomor Akun"
              value={
                <span className="font-mono">{invoice.member.memberNo}</span>
              }
            />
            {invoice.member.phone && (
              <MetaRow
                icon={User}
                label="Telepon"
                value={invoice.member.phone}
              />
            )}
          </CardContent>
        </Card>

        {/* Informasi Sesi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Informasi Sesi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <MetaRow
              icon={Syringe}
              label="Sesi"
              value={`Infus ke-${invoice.session.infusKe ?? '—'}`}
            />
            <MetaRow
              icon={CalendarDays}
              label="Tanggal Sesi"
              value={formatDate(invoice.session.treatmentDate)}
            />
            <MetaRow
                icon={MapPin}
                label="Cabang"
                value={`${invoice.session.encounter.branch.name} — ${invoice.session.encounter.branch.city}`}
            />
            <MetaRow
                icon={Package}
                label="Paket"
                value={
                    invoice.session.encounter.memberPackage.packageName ??
                    invoice.session.encounter.memberPackage.packageType
                 }
            />
            {invoice.session.pelaksanaan && (
              <MetaRow
                icon={MapPin}
                label="Jenis Pelaksanaan"
                value={PELAKSANAAN_LABEL[invoice.session.pelaksanaan]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Rincian Item Tagihan ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Rincian Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {itemsWithSubtotal.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              Tidak ada rincian item.
            </p>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                <span className="col-span-5">Nama Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Harga Satuan</span>
                <span className="col-span-3 text-right">Subtotal</span>
              </div>

              {/* Table rows */}
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {itemsWithSubtotal.map((item, idx) => (
                  <li
                    key={idx}
                    className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center"
                  >
                    <span className="col-span-5 text-slate-800 dark:text-slate-200 font-medium">
                      {item.name}
                    </span>
                    <span className="col-span-2 text-center tabular-nums text-slate-600 dark:text-slate-400">
                      {item.quantity}
                    </span>
                    <span className="col-span-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {formatRupiah(item.price)}
                    </span>
                    <span className="col-span-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Total row */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total
                </span>
                <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatRupiah(invoice.amount)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Catatan (opsional) ───────────────────────────────────────────── */}
      {invoice.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Catatan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
