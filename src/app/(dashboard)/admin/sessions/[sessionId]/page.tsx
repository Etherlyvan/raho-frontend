'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { SessionStatusBadge } from '@/components/shared/StatusBadge'
import { SessionActionButtons } from '@/components/modules/session/SessionActionButtons'
import { SessionDetailTabs } from '@/components/modules/session/SessionDetailTabs'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { formatDate } from '@/lib/utils'

const PELAKSANAAN_LABEL: Record<string, string> = {
  KLINIK: 'Klinik',
  HOMECARE: 'Homecare',
}

export default function SessionDetailPage() {
  const params = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { sessionId } = params
  const activeTab = searchParams.get('tab') ?? 'info'

  const {
    data: session,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId)
      return res.data.data
    },
  })

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-52" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !session) {
    return (
      <ErrorMessage
        title="Sesi Tidak Ditemukan"
        message="Data sesi tidak dapat dimuat. Mungkin sudah dihapus atau ID tidak valid."
      />
    )
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const sessionLabel = [
    session.infusKe ? `Infus ke-${session.infusKe}` : null,
    session.encounter.member.fullName,
    formatDate(session.treatmentDate),
    session.pelaksanaan ? PELAKSANAAN_LABEL[session.pelaksanaan] : null,
  ]
    .filter(Boolean)
    .join(' · ')

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-0.5 shrink-0"
          onClick={() => router.push('/dashboard/admin/sessions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <PageHeader
            title={`Sesi — ${session.encounter.member.fullName}`}
            description={`${session.encounter.branch.name} · ${formatDate(session.treatmentDate)}`}
            className="pb-0"
          >
            <SessionStatusBadge status={session.status} />
          </PageHeader>
        </div>
      </div>

      {/* Action Buttons — hanya untuk status yang masih bisa diubah */}
      {(session.status === 'PLANNED' || session.status === 'IN_PROGRESS') && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Aksi Sesi
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {session.status === 'PLANNED'
                ? session.therapyPlan
                  ? 'Rencana terapi tersedia — sesi siap dimulai.'
                  : 'Menunggu dokter mengisi rencana terapi sebelum sesi dapat dimulai.'
                : 'Sesi sedang berjalan — selesaikan dan buat invoice.'}
            </p>
          </div>
          <SessionActionButtons
            sessionId={sessionId}
            status={session.status}
            sessionLabel={sessionLabel}
            hasTherapyPlan={!!session.therapyPlan}
          />
        </div>
      )}

      {/* Tabs */}
      <SessionDetailTabs
        session={session}
        activeTab={activeTab}
        basePath="admin"
      />
    </div>
  )
}
