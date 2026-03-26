'use client'

import { formatDateTime } from '@/lib/utils'
import { Skeleton }       from '@/components/ui/skeleton'
import { Badge }          from '@/components/ui/badge'
import { cn }             from '@/lib/utils'
import type { AuditLog }  from '@/types'

// ─── Warna aksi ───────────────────────────────────────────────────────────────

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  UPDATE: 'bg-sky-100    text-sky-700    dark:bg-sky-950    dark:text-sky-300',
  DELETE: 'bg-red-100    text-red-700    dark:bg-red-950    dark:text-red-300',
  LOGIN:  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  LOGOUT: 'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-400',
}

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLOR[action] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  return (
    <Badge className={cn('border-0 text-[10px] font-semibold', color)}>
      {action}
    </Badge>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuditLogTableProps {
  data:       AuditLog[]
  isLoading:  boolean
  onRowClick: (log: AuditLog) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Tabel audit log dengan 50 item per halaman.
 * Klik baris → buka `AuditLogDetailDrawer` via `onRowClick`.
 */
export function AuditLogTable({ data, isLoading, onRowClick }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              {['Waktu', 'Pengguna', 'Action', 'Resource', 'Resource ID', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                  Tidak ada log aktivitas pada filter ini.
                </td>
              </tr>
            ) : (
              data.map((log) => (
                <tr
                  key={log.auditLogId}
                  className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                  onClick={() => onRowClick(log)}
                >
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-mono">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                      {log.user.profile?.fullName ?? log.user.email}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {log.user.staffCode ?? log.user.userId.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs font-mono">
                    {log.resource}
                  </td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-[11px] font-mono max-w-[140px] truncate">
                    {log.resourceId ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[10px] text-sky-500 dark:text-sky-400 hover:underline">
                      Detail →
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
