'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
}                      from '@/components/ui/sheet'
import { Badge }       from '@/components/ui/badge'
import { Separator }   from '@/components/ui/separator'
import { formatDateTime, cn } from '@/lib/utils'
import type { AuditLog }      from '@/types'

// ─── Label row helper ─────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium break-all">{value ?? '-'}</span>
    </div>
  )
}

// ─── JSON syntax highlight (simple) ──────────────────────────────────────────

function JsonBlock({ data }: { data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">Tidak ada metadata tambahan.</p>
    )
  }
  return (
    <pre className="text-[11px] bg-slate-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuditLogDetailDrawerProps {
  log:     AuditLog | null
  open:    boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Drawer detail satu audit log.
 *
 * Menampilkan:
 * - Informasi aksi (action, resource, resourceId, timestamp)
 * - Identitas pengguna (nama, staffCode, email)
 * - Meta JSON dengan simple formatting
 */
export function AuditLogDetailDrawer({ log, open, onClose }: AuditLogDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base">Detail Aktivitas</SheetTitle>
        </SheetHeader>

        {!log ? null : (
          <div className="space-y-6">
            {/* Action info */}
            <div className="space-y-4">
              <Row
                label="Waktu"
                value={
                  <span className="font-mono">
                    {formatDateTime(log.createdAt)}
                  </span>
                }
              />
              <Row
                label="Action"
                value={
                  <Badge className="text-xs border-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {log.action}
                  </Badge>
                }
              />
              <Row label="Resource" value={<span className="font-mono">{log.resource}</span>} />
              <Row
                label="Resource ID"
                value={
                  log.resourceId
                    ? <span className="font-mono text-xs">{log.resourceId}</span>
                    : '-'
                }
              />
            </div>

            <Separator />

            {/* User info */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pengguna
              </p>
              <Row label="Nama" value={log.user.profile?.fullName ?? '-'} />
              <Row
                label="Staff Code"
                value={
                  log.user.staffCode
                    ? <span className="font-mono">{log.user.staffCode}</span>
                    : '-'
                }
              />
              <Row label="Email" value={log.user.email} />
              <Row
                label="User ID"
                value={<span className="font-mono text-xs">{log.user.userId}</span>}
              />
            </div>

            <Separator />

            {/* Meta JSON */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Metadata
              </p>
              <JsonBlock data={log.meta} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
