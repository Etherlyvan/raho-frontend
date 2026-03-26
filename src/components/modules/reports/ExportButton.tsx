'use client'

import { useState }  from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast }     from 'sonner'

import { Button }       from '@/components/ui/button'
import { reportsApi }   from '@/lib/api/endpoints/reports'
import { getApiErrorMessage } from '@/lib/utils'
import type { ReportBaseParams, ReportExportType } from '@/types'

interface ExportButtonProps {
  params:    ReportBaseParams
  activeTab: ReportExportType | string
}

/**
 * Tombol export CSV.
 *
 * - Menggunakan `responseType: 'blob'` via `reportsApi.export`.
 * - Filename diambil dari `Content-Disposition` header jika tersedia,
 *   fallback ke `laporan-{type}-{tanggal}.csv`.
 * - Disabled jika tab aktif adalah tab yang tidak mendukung export
 *   (tidak ada kondisi ini saat ini, tapi disiapkan untuk extensibility).
 */
export function ExportButton({ params, activeTab }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Hanya tampilkan untuk tab yang mendukung export
  const EXPORTABLE_TABS: ReportExportType[] = ['revenue', 'treatment', 'inventory', 'staff-kpi']
  const canExport = EXPORTABLE_TABS.includes(activeTab as ReportExportType)

  if (!canExport) return null

  async function handleExport() {
    if (isExporting) return
    setIsExporting(true)
    try {
      const res = await reportsApi.export({
        ...params,
        type: activeTab as ReportExportType,
      })

      // Ambil filename dari Content-Disposition header
      const disposition = (res.headers as Record<string, string>)?.['content-disposition'] ?? ''
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      const filename = match?.[1]?.replace(/['"]/g, '')
        ?? `laporan-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`

      // Trigger download di browser
      const url  = URL.createObjectURL(res.data as Blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success(`Laporan berhasil diunduh: ${filename}`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mengunduh laporan.'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 text-xs gap-1.5 shrink-0"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Mengunduh...
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </>
      )}
    </Button>
  )
}
