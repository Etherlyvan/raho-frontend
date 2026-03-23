'use client'
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  ClipboardList,
  Stethoscope,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Shape dari GET /api/encounters/:id/summary (BE: emrController.findEncounterSummary)
interface SessionSummary {
  total: number
  byStatus: {
    PLANNED: number
    INPROGRESS: number
    COMPLETED: number
    POSTPONED: number
  }
}

interface EncounterSummaryData {
  sessions: SessionSummary
  diagnoses: { total: number }
  emrNotes: { total: number }
}

interface Props {
  data: EncounterSummaryData | null | undefined
  isLoading?: boolean
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: number
  color: string
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

export function EncounterSummaryCard({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { sessions, diagnoses, emrNotes } = data

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          Ringkasan Encounter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatItem
            icon={ClipboardList}
            label="Total Sesi"
            value={sessions.total}
            color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          />
          <StatItem
            icon={PlayCircle}
            label="Sedang Berjalan"
            value={sessions.byStatus.INPROGRESS}
            color="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
          />
          <StatItem
            icon={CheckCircle2}
            label="Selesai"
            value={sessions.byStatus.COMPLETED}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          />
          <StatItem
            icon={Clock}
            label="Dijadwalkan"
            value={sessions.byStatus.PLANNED}
            color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
          />
          <StatItem
            icon={PauseCircle}
            label="Ditunda"
            value={sessions.byStatus.POSTPONED}
            color="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
          />
          <StatItem
            icon={Stethoscope}
            label="Diagnosa"
            value={diagnoses.total}
            color="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
          />
        </div>
      </CardContent>
    </Card>
  )
}
