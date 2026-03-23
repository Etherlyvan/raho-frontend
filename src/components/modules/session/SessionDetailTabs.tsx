'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UnderConstruction } from '@/components/shared/UnderConstruction'
import { SessionStatusBadge, InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import {
  Clock,
  User,
  Building2,
  Stethoscope,
  FlaskConical,
  Package,
  Receipt,
  CheckCircle2,
  XCircle,
  Activity,
  Camera,
  FileText,
  Boxes,
} from 'lucide-react'
import { formatDate, formatDateTime, formatRupiah } from '@/lib/utils'
import type { TreatmentSessionDetail } from '@/types'

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 sm:w-44">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-white font-medium flex-1">
        {value ?? <span className="text-slate-400 font-normal italic">-</span>}
      </span>
    </div>
  )
}

const PELAKSANAAN_LABEL: Record<string, string> = {
  KLINIK: 'Di Klinik',
  HOMECARE: 'Homecare',
}

const ENCOUNTER_TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Konsultasi',
  TREATMENT: 'Treatment',
}

// ─── Therapy Plan Display ─────────────────────────────────────────────────────

function TherapyPlanCard({ plan }: { plan: NonNullable<TreatmentSessionDetail['therapyPlan']> }) {
  const doseItems = [
    { label: 'HHO', value: plan.hhoMl, unit: 'mL' },
    { label: 'IFA', value: plan.ifaMg, unit: 'mg' },
    { label: 'H₂', value: plan.h2Ml, unit: 'mL' },
    { label: 'NO', value: plan.noMl, unit: 'mL' },
    { label: 'GASO', value: plan.gasoMl, unit: 'mL' },
    { label: 'O₂', value: plan.o2Ml, unit: 'mL' },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-sky-500" />
          Rencana Terapi (Therapy Plan)
        </CardTitle>
        <p className="text-xs text-slate-500">
          Oleh: {plan.planner.profile?.fullName ?? plan.planner.staffCode ?? '-'} ·{' '}
          {formatDateTime(plan.plannedAt)}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Dosis grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          {doseItems.map((d) => (
            <div
              key={d.label}
              className={`rounded-lg p-2.5 text-center ${
                d.value != null
                  ? 'bg-sky-50 dark:bg-sky-950/40'
                  : 'bg-slate-50 dark:bg-slate-800/30 opacity-40'
              }`}
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {d.label}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {d.value != null ? `${d.value}` : '—'}
              </p>
              <p className="text-xs text-slate-400">{d.unit}</p>
            </div>
          ))}
        </div>
        {plan.notes && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 mt-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Catatan Dokter
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{plan.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Props & Component ────────────────────────────────────────────────────────

interface Props {
  session: TreatmentSessionDetail
  activeTab: string
  basePath: string
}

export function SessionDetailTabs({ session, activeTab, basePath }: Props) {
  const sessionLabel = `Infus ke-${session.infusKe ?? '?'} — ${session.encounter.member.fullName}`

  function buildTabUrl(tab: string) {
    return `/${basePath}/sessions/${session.treatmentSessionId}?tab=${tab}`
  }

  return (
    <Tabs value={activeTab} className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        {[
          { value: 'info', label: 'Info', icon: FileText },
          { value: 'vital', label: 'Vital', icon: Activity },
          { value: 'infus', label: 'Infus', icon: FlaskConical },
          { value: 'material', label: 'Material', icon: Boxes },
          { value: 'foto', label: 'Foto', icon: Camera },
          { value: 'emr', label: 'EMR', icon: FileText },
        ].map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} asChild>
            <Link
              href={buildTabUrl(tab.value)}
              className="flex items-center gap-1.5 text-xs"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Tab: Info ── */}
      <TabsContent value="info" className="mt-4 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Status & Waktu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Status & Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow label="Status" value={<SessionStatusBadge status={session.status} />} />
              <InfoRow label="Infus Ke" value={session.infusKe ?? '-'} />
              <InfoRow
                label="Tipe Pelaksanaan"
                value={
                  session.pelaksanaan
                    ? PELAKSANAAN_LABEL[session.pelaksanaan]
                    : null
                }
              />
              <InfoRow
                label="Tgl Treatment"
                value={formatDate(session.treatmentDate)}
              />
              <InfoRow
                label="Dimulai"
                value={formatDateTime(session.startedAt)}
              />
              <InfoRow
                label="Selesai"
                value={formatDateTime(session.completedAt)}
              />
              {session.nextTreatmentDate && (
                <InfoRow
                  label="Jadwal Berikutnya"
                  value={formatDate(session.nextTreatmentDate)}
                />
              )}
            </CardContent>
          </Card>

          {/* Perawat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Perawat Bertugas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {session.nurse ? (
                <>
                  <InfoRow
                    label="Nama"
                    value={session.nurse.profile?.fullName ?? '-'}
                  />
                  <InfoRow
                    label="Kode Staff"
                    value={
                      session.nurse.staffCode ? (
                        <span className="font-mono">{session.nurse.staffCode}</span>
                      ) : null
                    }
                  />
                </>
              ) : (
                <p className="py-4 text-sm italic text-slate-400 text-center">
                  Perawat belum ditentukan
                </p>
              )}
            </CardContent>
          </Card>

          {/* Encounter & Pasien */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-400" />
                Encounter & Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow
                label="Encounter"
                value={
                  <Link
                    href={`/${basePath}/encounters/${session.encounterId}`}
                    className="font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                  >
                    {session.encounterId.slice(0, 12)}...
                  </Link>
                }
              />
              <InfoRow
                label="Tipe Encounter"
                value={ENCOUNTER_TYPE_LABEL[session.encounter.type]}
              />
              <InfoRow label="Pasien" value={session.encounter.member.fullName} />
              <InfoRow
                label="Kode Akun"
                value={
                  <span className="font-mono">{session.encounter.member.memberNo}</span>
                }
              />
              <InfoRow
                label="Cabang"
                value={session.encounter.branch.name}
              />
              <InfoRow
                label="Paket"
                value={
                  <>
                    {session.encounter.memberPackage.packageName ??
                      session.encounter.memberPackage.packageType}{' '}
                    <span className="text-xs text-slate-400">
                      ({session.encounter.memberPackage.usedSessions}/
                      {session.encounter.memberPackage.totalSessions} sesi)
                    </span>
                  </>
                }
              />
            </CardContent>
          </Card>

          {/* Hasil Sesi (hanya jika COMPLETED) */}
          {session.status === 'COMPLETED' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Hasil Sesi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <InfoRow
                  label="Berhasil Infus"
                  value={
                    session.berhasilInfus === true ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Berhasil
                      </span>
                    ) : session.berhasilInfus === false ? (
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        Tidak Berhasil
                      </span>
                    ) : null
                  }
                />
                {session.keluhanSebelum && (
                  <InfoRow
                    label="Keluhan Sebelum"
                    value={session.keluhanSebelum}
                  />
                )}
                {session.keluhanSesudah && (
                  <InfoRow
                    label="Keluhan Sesudah"
                    value={session.keluhanSesudah}
                  />
                )}
                {session.healingCrisis && (
                  <InfoRow
                    label="Healing Crisis"
                    value={session.healingCrisis}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Therapy Plan (read-only, jika sudah diisi dokter) */}
        {session.therapyPlan && (
          <TherapyPlanCard plan={session.therapyPlan} />
        )}

        {/* Warning: Therapy plan belum ada */}
        {!session.therapyPlan && session.status === 'PLANNED' && (
          <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-5 text-center space-y-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Rencana Terapi Belum Diisi
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Dokter belum membuat therapy plan. Sesi tidak dapat dimulai hingga rencana
              terapi tersedia.
            </p>
          </div>
        )}

        {/* Invoice stub */}
        {session.invoice && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-slate-400" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow
                label="Invoice ID"
                value={
                  <Link
                    href={`/${basePath}/invoices/${session.invoice.invoiceId}`}
                    className="font-mono text-xs text-sky-600 hover:underline dark:text-sky-400"
                  >
                    {session.invoice.invoiceId.slice(0, 12)}...
                  </Link>
                }
              />
              <InfoRow
                label="Total"
                value={
                  <span className="font-semibold">
                    {formatRupiah(session.invoice.amount)}
                  </span>
                }
              />
              <InfoRow
                label="Status"
                value={<InvoiceStatusBadge status={session.invoice.status} />}
              />
              {session.invoice.paidAt && (
                <InfoRow
                  label="Dibayar Pada"
                  value={formatDateTime(session.invoice.paidAt)}
                />
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Tab: Vital Signs — Sprint 7 ── */}
      <TabsContent value="vital" className="mt-4">
        <UnderConstruction
          title="Tanda Vital"
          sprint={7}
          description="Input tanda vital (nadi, PI, tensi) diisi oleh Perawat di Sprint 7."
        />
      </TabsContent>

      {/* ── Tab: Infus — Sprint 7 (actual execution) ── */}
      <TabsContent value="infus" className="mt-4 space-y-5">
        {/* Therapy Plan read-only sudah ada di tab Info, di sini sebagai referensi */}
        {session.therapyPlan ? (
          <TherapyPlanCard plan={session.therapyPlan} />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-5 text-center">
            <p className="text-sm text-slate-400">Rencana terapi belum dibuat oleh dokter.</p>
          </div>
        )}
        <UnderConstruction
          title="Pelaksanaan Infus Aktual"
          sprint={7}
          description="Input infus aktual dan catatan deviasi diisi oleh Perawat di Sprint 7."
        />
      </TabsContent>

      {/* ── Tab: Material — Sprint 7 ── */}
      <TabsContent value="material" className="mt-4">
        <UnderConstruction
          title="Pemakaian Material"
          sprint={7}
          description="Input pemakaian bahan dan alat diisi oleh Perawat di Sprint 7."
        />
      </TabsContent>

      {/* ── Tab: Foto — Sprint 7 ── */}
      <TabsContent value="foto" className="mt-4">
        <UnderConstruction
          title="Foto Sesi"
          sprint={7}
          description="Upload foto before/after oleh Perawat di Sprint 7. Memerlukan consent foto dari pasien."
        />
      </TabsContent>

      {/* ── Tab: EMR — Sprint 6 ── */}
      <TabsContent value="emr" className="mt-4">
        <UnderConstruction
          title="Catatan EMR"
          sprint={6}
          description="Catatan EMR per sesi diisi oleh Dokter dan Perawat di Sprint 6."
        />
      </TabsContent>
    </Tabs>
  )
}
