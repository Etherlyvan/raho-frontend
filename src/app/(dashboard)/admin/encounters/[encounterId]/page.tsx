'use client'
import { useState } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Building2,
  Package,
  CalendarDays,
  CheckCircle2,
  FileText,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EncounterStatusBadge } from '@/components/shared/StatusBadge'
import { UnderConstruction } from '@/components/shared/UnderConstruction'
import { EncounterSummaryCard } from '@/components/modules/encounter/EncounterSummaryCard'
// Komponen berikut tersedia setelah Part 3/4 diimplementasi:
import { SessionTable } from '@/components/modules/session/SessionTable'
import { CreateSessionDialog } from '@/components/modules/session/CreateSessionDialog'
import { encounterApi } from '@/lib/api/endpoints/encounters'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { formatDate, formatDateTime } from '@/lib/utils'

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 sm:w-44">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-white font-medium">
        {value ?? '-'}
      </span>
    </div>
  )
}

const TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Konsultasi',
  TREATMENT: 'Treatment',
}

const PELAKSANAAN_LABEL: Record<string, string> = {
  KLINIK: 'Di Klinik',
  HOMECARE: 'Homecare',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EncounterDetailPage() {
  const params = useParams<{ encounterId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [createSessionOpen, setCreateSessionOpen] = useState(false)

  const activeTab = searchParams.get('tab') ?? 'info'
  const { encounterId } = params

  // ── Encounter detail ────────────────────────────────────────────────────────
  const {
    data: encounter,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['encounters', encounterId],
    queryFn: async () => {
      const res = await encounterApi.detail(encounterId)
      return res.data.data
    },
  })

  // ── Encounter summary ───────────────────────────────────────────────────────
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['encounters', encounterId, 'summary'],
    queryFn: async () => {
      const res = await encounterApi.summary(encounterId)
      return res.data.data as {
        sessions: { total: number; byStatus: { PLANNED: number; INPROGRESS: number; COMPLETED: number; POSTPONED: number } }
        diagnoses: { total: number }
        emrNotes: { total: number }
      }
    },
    enabled: !!encounterId,
  })

  // ── Session list (untuk tab Sesi) ───────────────────────────────────────────
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', 'byEncounter', encounterId],
    queryFn: async () => {
      const res = await sessionApi.list({ encounterId, limit: 50 })
      return res.data
    },
    enabled: activeTab === 'sessions',
  })

  // ── Tab navigation helper ───────────────────────────────────────────────────
  function buildTabUrl(tab: string) {
    return `/dashboard/admin/encounters/${encounterId}?tab=${tab}`
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (isError || !encounter) {
    return (
      <ErrorMessage
        title="Encounter Tidak Ditemukan"
        message="Data encounter tidak dapat dimuat. Mungkin sudah dihapus atau ID tidak valid."
      />
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push('/dashboard/admin/encounters')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <PageHeader
            title={`Encounter — ${encounter.member.fullName}`}
            description={`${TYPE_LABEL[encounter.type]} · ${encounter.branch.name}`}
            className="pb-0"
          >
            <EncounterStatusBadge status={encounter.status} />
          </PageHeader>
        </div>
      </div>

      {/* Summary card (hanya tampil jika sudah ada data) */}
      <EncounterSummaryCard data={summaryData} isLoading={summaryLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info" asChild>
            <Link href={buildTabUrl('info')}>Info</Link>
          </TabsTrigger>
          <TabsTrigger value="sessions" asChild>
            <Link href={buildTabUrl('sessions')}>
              Sesi
              {encounter._count.sessions > 0 && (
                <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-0">
                  {encounter._count.sessions}
                </Badge>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="diagnoses" asChild>
            <Link href={buildTabUrl('diagnoses')}>
              Diagnosa
              {encounter._count.diagnoses > 0 && (
                <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-0">
                  {encounter._count.diagnoses}
                </Badge>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="emr" asChild>
            <Link href={buildTabUrl('emr')}>Catatan EMR</Link>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Info ── */}
        <TabsContent value="info" className="space-y-5 mt-4">
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
                <InfoRow label="Nama" value={encounter.member.fullName} />
                <InfoRow
                  label="Kode Akun"
                  value={
                    <span className="font-mono">{encounter.member.memberNo}</span>
                  }
                />
                <InfoRow
                  label="Status"
                  value={
                    <Badge
                      className={
                        encounter.member.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0'
                          : 'bg-slate-100 text-slate-600 border-0'
                      }
                    >
                      {encounter.member.status === 'ACTIVE' ? 'Aktif' : encounter.member.status}
                    </Badge>
                  }
                />
              </CardContent>
            </Card>

            {/* Dokter & Cabang */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Dokter & Cabang
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  label="Dokter"
                  value={encounter.doctor.profile?.fullName ?? '-'}
                />
                {encounter.doctor.profile?.speciality && (
                  <InfoRow
                    label="Spesialisasi"
                    value={encounter.doctor.profile.speciality}
                  />
                )}
                <InfoRow label="Cabang" value={encounter.branch.name} />
                <InfoRow label="Kota" value={encounter.branch.city} />
              </CardContent>
            </Card>

            {/* Detail Encounter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Detail Encounter
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow label="Tipe" value={TYPE_LABEL[encounter.type]} />
                <InfoRow label="Status" value={<EncounterStatusBadge status={encounter.status} />} />
                <InfoRow
                  label="Tgl Treatment"
                  value={formatDate(encounter.treatmentDate)}
                />
                <InfoRow
                  label="Selesai Pada"
                  value={formatDateTime(encounter.completedAt)}
                />
                {encounter.consultationEncounterId && (
                  <InfoRow
                    label="Dari Konsultasi"
                    value={
                      <Link
                        href={`/dashboard/admin/encounters/${encounter.consultationEncounterId}`}
                        className="font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                      >
                        {encounter.consultationEncounterId.slice(0, 12)}...
                      </Link>
                    }
                  />
                )}
                <InfoRow
                  label="Dibuat"
                  value={formatDateTime(encounter.createdAt)}
                />
              </CardContent>
            </Card>

            {/* Paket */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  Paket
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  label="Nama Paket"
                  value={
                    encounter.memberPackage.packageName ??
                    encounter.memberPackage.packageType
                  }
                />
                <InfoRow
                  label="Tipe Paket"
                  value={encounter.memberPackage.packageType}
                />
                <InfoRow
                  label="Status Paket"
                  value={encounter.memberPackage.status}
                />
                <InfoRow
                  label="Sesi Terpakai"
                  value={
                    <span>
                      <span className="font-semibold">
                        {encounter.memberPackage.usedSessions}
                      </span>
                      <span className="text-slate-400">
                        {' / '}
                        {encounter.memberPackage.totalSessions}
                      </span>
                    </span>
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Assessment (read-only, hanya tampil jika sudah diisi dokter) */}
          {encounter.assessment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Assessment Dokter
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <InfoRow
                  label="Eligibility"
                  value={
                    <Badge
                      className={
                        encounter.assessment.eligibility === 'ELIGIBLE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0'
                          : encounter.assessment.eligibility === 'CONDITIONAL'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0'
                      }
                    >
                      {encounter.assessment.eligibility}
                    </Badge>
                  }
                />
                {encounter.assessment.targetOutcome && (
                  <InfoRow
                    label="Target Outcome"
                    value={encounter.assessment.targetOutcome}
                  />
                )}
                {encounter.assessment.notes && (
                  <InfoRow label="Catatan" value={encounter.assessment.notes} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Treatment Plan (read-only) */}
          {encounter.treatmentPlan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-500" />
                  Rencana Terapi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <InfoRow label="Protokol" value={encounter.treatmentPlan.protocol} />
                {encounter.treatmentPlan.frequency && (
                  <InfoRow label="Frekuensi" value={encounter.treatmentPlan.frequency} />
                )}
                {encounter.treatmentPlan.totalSessions && (
                  <InfoRow
                    label="Total Sesi"
                    value={`${encounter.treatmentPlan.totalSessions} sesi`}
                  />
                )}
                {encounter.treatmentPlan.duration && (
                  <InfoRow label="Durasi" value={encounter.treatmentPlan.duration} />
                )}
                {encounter.treatmentPlan.specialNotes && (
                  <InfoRow
                    label="Catatan Khusus"
                    value={encounter.treatmentPlan.specialNotes}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Belum ada assessment */}
          {!encounter.assessment && encounter.type === 'CONSULTATION' && (
            <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-5 text-center space-y-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Assessment belum diisi
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Dokter belum mengisi assessment dan rencana terapi untuk encounter ini.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Sesi ── */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Semua sesi treatment dalam encounter ini
            </p>
            {/* Hanya bisa buat sesi jika encounter ONGOING atau PLANNED dan tipe TREATMENT */}
            {(encounter.status === 'PLANNED' || encounter.status === 'ONGOING') &&
              encounter.type === 'TREATMENT' && (
                <Button size="sm" onClick={() => setCreateSessionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Jadwalkan Sesi
                </Button>
              )}
          </div>

          <SessionTable
            data={sessionsData?.data ?? []}
            isLoading={sessionsLoading}
            basePath="admin"
          />

          {/* CreateSessionDialog — tersedia setelah Part 3/4 */}
          <CreateSessionDialog
            open={createSessionOpen}
            onOpenChange={setCreateSessionOpen}
            encounterId={encounterId}
            branchId={encounter.branch.branchId}
          />
        </TabsContent>

        {/* ── Tab: Diagnosa — Sprint 6 ── */}
        <TabsContent value="diagnoses" className="mt-4">
          <UnderConstruction
            title="Diagnosa"
            sprint={6}
            description="Pengisian diagnosa dilakukan oleh Dokter di Sprint 6."
          />
        </TabsContent>

        {/* ── Tab: EMR — Sprint 6 ── */}
        <TabsContent value="emr" className="mt-4">
          <UnderConstruction
            title="Catatan EMR"
            sprint={6}
            description="Catatan EMR dapat diisi oleh Dokter dan Perawat mulai Sprint 6."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
