'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, XCircle, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import { InvoiceDetailCard } from '@/components/modules/invoice/InvoiceDetailCard'
import { ConfirmPaymentDialog } from '@/components/modules/invoice/ConfirmPaymentDialog'
import { RejectInvoiceDialog } from '@/components/modules/invoice/RejectInvoiceDialog'
import { invoiceApi } from '@/lib/api/endpoints/invoices'
import { formatRupiah, getApiErrorMessage } from '@/lib/utils'

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>()
  const router = useRouter()

  const { invoiceId } = params
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: async () => {
      const res = await invoiceApi.detail(invoiceId)
      return res.data.data
    },
  })

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-44" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <ErrorMessage
        title="Invoice Tidak Ditemukan"
        message="Data invoice tidak dapat dimuat. Mungkin sudah dihapus atau ID tidak valid."
      />
    )
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const canConfirm = invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
  const canReject = invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
  const isPaid = invoice.status === 'PAID'

  const invoiceLabel = `${invoice.member.fullName} · ${formatRupiah(invoice.amount)}`

  async function handleDownloadPdf() {
    try {
      setPdfLoading(true)
      await invoiceApi.downloadPdf(invoiceId)
      toast.success('PDF berhasil diunduh')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mengunduh PDF'))
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-0.5 shrink-0"
          onClick={() => router.push('/dashboard/admin/invoices')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <PageHeader
            title={`Invoice — ${invoice.member.fullName}`}
            description={`${invoice.session.encounter.branch.name} · ${formatRupiah(invoice.amount)}`}
            className="pb-0"
          >
            <InvoiceStatusBadge status={invoice.status} />
          </PageHeader>
        </div>
      </div>

      {/* Action Bar — hanya jika ada aksi yang tersedia */}
      {(canConfirm || canReject || isPaid) && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {canConfirm
                ? 'Invoice menunggu konfirmasi pembayaran'
                : isPaid
                ? 'Pembayaran telah dikonfirmasi'
                : 'Invoice telah ditolak'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {canConfirm
                ? `Total tagihan: ${formatRupiah(invoice.amount)}`
                : isPaid
                ? `Lunas pada: ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('id-ID') : '-'}`
                : `Alasan: ${invoice.notes ?? '-'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Unduh PDF
              </Button>
            )}

            {canConfirm && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setConfirmOpen(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Konfirmasi Lunas
              </Button>
            )}

            {canReject && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Tolak
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Detail Card */}
      <InvoiceDetailCard invoice={invoice} basePath="admin" />

      {/* Dialogs */}
      <ConfirmPaymentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        invoiceId={invoiceId}
        invoiceLabel={invoiceLabel}
      />

      <RejectInvoiceDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        invoiceId={invoiceId}
        invoiceLabel={invoiceLabel}
      />
    </div>
  )
}
