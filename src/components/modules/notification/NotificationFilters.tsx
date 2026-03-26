'use client'

import { Filter } from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { cn }      from '@/lib/utils'

// ─── Filter options ───────────────────────────────────────────────────────────

type ReadFilter = 'all' | 'unread' | 'read'

const READ_OPTIONS: { value: ReadFilter; label: string }[] = [
  { value: 'all',    label: 'Semua'     },
  { value: 'unread', label: 'Belum Dibaca' },
  { value: 'read',   label: 'Sudah Dibaca' },
]

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '',            label: 'Semua Tipe'       },
  { value: 'SESSION',     label: 'Sesi'             },
  { value: 'ENCOUNTER',   label: 'Encounter'        },
  { value: 'INVOICE',     label: 'Invoice'          },
  { value: 'STOCK_REQUEST', label: 'Permintaan Stok' },
  { value: 'CHAT',        label: 'Chat'             },
  { value: 'SYSTEM',      label: 'Sistem'           },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationFiltersProps {
  readFilter:    ReadFilter
  typeFilter:    string
  onReadChange:  (v: ReadFilter) => void
  onTypeChange:  (v: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationFilters({
  readFilter,
  typeFilter,
  onReadChange,
  onTypeChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filter: status baca */}
      <div className="flex items-center gap-1 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
        {READ_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={readFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 px-3 text-xs',
              readFilter === opt.value
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : '',
            )}
            onClick={() => onReadChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Filter: tipe notifikasi */}
      <div className="flex items-center gap-1 flex-wrap sm:ml-auto">
        {TYPE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={typeFilter === opt.value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onTypeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export type { ReadFilter }
