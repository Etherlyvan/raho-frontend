'use client'
import Link from 'next/link'
import {
  User,
  Building2,
  Stethoscope,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatDateTime, formatRupiah } from '@/lib/utils'
import type { Invoice } from '@/types'

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 sm:w-44">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-white font-medium flex-1">
        {value ?? <span className="italic text-slate-400 font-normal">-</span>}
      </span>
    </div>
  )
}

const PELAKSANAAN_LABEL: Record<string, string> = {
  KLINIK: 'Di Klinik',
  HOMECARE: 'Homecare',
}

// ─── Items Table ──────────────────────────────────────────────────────────────

function InvoiceItemsTable({ invoice }: { invoice: Invoice }) {
  const items = invoice.items

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          Rincian Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <span className="col-span-5">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Harga</span>
          <span className="col-span-3 text-right">Subtotal</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 py-2.5 text-sm items-center"
            >
              <span className="col-span-5 text-slate-900 dark:text-white font-medium">
                {item.name}
              </span>
              <span className="col-span-2 text-center tabular-nums text-slate-600 dark:text-slate-400">
                {item.quantity}
              </span>
              <span className="col-span-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                {formatRupiah(item.price)}
              </span>
              <span className="col-span-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                {formatRupiah(item.quantity * item.price)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Total */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Tagihan
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {formatRupiah(invoice.amount)}
          </span>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-3 rounded-md bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Catatan</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Props & Component ────────────────────────────────────────────────────────

interface Props {
  invoice: Invoice
  basePath: string
}

export function InvoiceDetailCard({ invoice, basePath }: Props) {
  return (
    <div className="space-y-5">
      {/* Header Invoice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                Invoice #{invoice.invoiceId.slice(-8).toUpperCase()}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {invoice.invoiceId}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="Dibuat Pada" value={formatDateTime(invoice.createdAt)} />
          <InfoRow label="Diperbarui" value={formatDateTime(invoice.updatedAt)} />
          {invoice.status === 'PAID' && (
            <>
              <InfoRow
                label="Dibayar Pada"
                value={
                  invoice.paidAt ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {formatDateTime(invoice.paidAt)}
                    </span>
                  ) : null
                }
              />
              {invoice.verifier && (
                <InfoRow
                  label="Dikonfirmasi Oleh"
                  value={invoice.verifier.profile?.fullName ?? invoice.verifier.staffCode ?? '-'}
                />
              )}
            </>
          )}
          {invoice.status === 'REJECTED' && (
            <InfoRow
              label="Alasan Penolakan"
              value={
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {invoice.notes ?? '-'}
                </span>
              }
            />
          )}
          {invoice.status === 'OVERDUE' && (
            <InfoRow
              label="Keterangan"
              value={
                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4 shrink-0" />
                  Invoice melewati batas waktu pembayaran
                </span>
              }
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pasien */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Data Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label="Nama" value={invoice.member.fullName} />
            <InfoRow
              label="Kode Akun"
              value={<span className="font-mono">{invoice.member.memberNo}</span>}
            />
            <InfoRow label="No. HP" value={invoice.member.phone} />
          </CardContent>
        </Card>

        {/* Detail Sesi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-slate-400" />
              Detail Sesi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              label="Sesi ID"
              value={
                <Link
                  href={`/dashboard/${basePath}/sessions/${invoice.session.treatmentSessionId}`}
                  className="font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                >
                  {invoice.session.treatmentSessionId.slice(0, 12)}...
                </Link>
              }
            />
            <InfoRow
              label="Infus Ke"
              value={
                invoice.session.infusKe != null ? (
                  <span className="font-mono font-semibold">
                    {invoice.session.infusKe}
                  </span>
                ) : null
              }
            />
            <InfoRow
              label="Tanggal Sesi"
              value={formatDate(invoice.session.treatmentDate)}
            />
            <InfoRow
              label="Selesai"
              value={formatDateTime(invoice.session.completedAt)}
            />
            {invoice.session.pelaksanaan && (
              <InfoRow
                label="Tipe Pelaksanaan"
                value={PELAKSANAAN_LABEL[invoice.session.pelaksanaan]}
              />
            )}
          </CardContent>
        </Card>

        {/* Encounter & Paket */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              Encounter & Cabang
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow
                  label="Encounter"
                  value={
                    <Link
                      href={`/dashboard/${basePath}/encounters/${invoice.session.encounter.encounterId}`}
                      className="font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                    >
                      {invoice.session.encounter.encounterId.slice(0, 12)}...
                    </Link>
                  }
                />
                <InfoRow
                  label="Tipe"
                  value={
                    invoice.session.encounter.type === 'CONSULTATION'
                      ? 'Konsultasi'
                      : 'Treatment'
                  }
                />
              </div>
              <div>
                <InfoRow
                  label="Cabang"
                  value={invoice.session.encounter.branch.name}
                />
                <InfoRow
                  label="Paket"
                  value={
                    invoice.session.encounter.memberPackage.packageName ??
                    invoice.session.encounter.memberPackage.packageType
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rincian Invoice */}
      <InvoiceItemsTable invoice={invoice} />
    </div>
  )
}
