'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberLookupInput } from '@/components/modules/member/MemberLookupInput'
import { encounterApi } from '@/lib/api/endpoints/encounters'
import { memberPackageApi } from '@/lib/api/endpoints/memberPackages'
import { userApi } from '@/lib/api/endpoints/users'
import { getApiErrorMessage } from '@/lib/utils'
import type { MemberLookupResult, EncounterType } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    memberId: z.string().min(1, 'Pilih pasien terlebih dahulu'),
    doctorId: z.string().min(1, 'Pilih dokter'),
    branchId: z.string().min(1, 'Branch ID wajib ada'),
    memberPackageId: z.string().min(1, 'Pilih paket pasien'),
    type: z.enum(['CONSULTATION', 'TREATMENT'] as const, {
      errorMap: () => ({ message: 'Tipe harus CONSULTATION atau TREATMENT' }),
    }),
    consultationEncounterId: z.string().optional(),
    treatmentDate: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
  })
  .refine(
    (d) => {
      if (d.type === 'TREATMENT') return !!d.consultationEncounterId
      return true
    },
    {
      message: 'Encounter CONSULTATION wajib dipilih untuk tipe TREATMENT',
      path: ['consultationEncounterId'],
    },
  )

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** branchId dari user yang sedang login (dipakai sebagai default) */
  defaultBranchId: string
  basePath: string  // e.g. 'admin'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EncounterForm({ defaultBranchId, basePath }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberId: '',
      doctorId: '',
      branchId: defaultBranchId,
      memberPackageId: '',
      type: 'CONSULTATION',
      consultationEncounterId: '',
      treatmentDate: '',
    },
  })

  const watchedMemberId = form.watch('memberId')
  const watchedType = form.watch('type')

  // ── Daftar dokter (role=DOCTOR, aktif, cabang sama) ──────────────────────
  const { data: doctors } = useQuery({
    queryKey: ['users', 'doctors', defaultBranchId],
    queryFn: async () => {
      const res = await userApi.list({
        role: 'DOCTOR',
        branchId: defaultBranchId,
        isActive: true,
        limit: 100,
      })
      return res.data.data
    },
  })

  // ── Paket aktif pasien ────────────────────────────────────────────────────
  const { data: packages } = useQuery({
    queryKey: ['packages', watchedMemberId, 'active'],
    queryFn: async () => {
      const res = await memberPackageApi.listActive(watchedMemberId)
      return res.data.data
    },
    enabled: !!watchedMemberId,
  })

  // ── Encounter CONSULTATION pasien (untuk tipe TREATMENT) ─────────────────
  const { data: consultations } = useQuery({
    queryKey: ['encounters', watchedMemberId, 'consultations'],
    queryFn: async () => {
      const res = await encounterApi.list({
        memberId: watchedMemberId,
        type: 'CONSULTATION',
        status: 'ONGOING',   // hanya yang sudah ada assessment
      })
      return res.data.data
    },
    enabled: !!watchedMemberId && watchedType === 'TREATMENT',
  })

  // Reset dependent fields saat memberId berubah
  useEffect(() => {
    form.setValue('memberPackageId', '')
    form.setValue('consultationEncounterId', '')
  }, [watchedMemberId, form])

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      encounterApi.create({
        memberId: values.memberId,
        doctorId: values.doctorId,
        branchId: values.branchId,
        memberPackageId: values.memberPackageId,
        type: values.type as EncounterType,
        consultationEncounterId: values.consultationEncounterId || undefined,
        treatmentDate: values.treatmentDate
          ? new Date(values.treatmentDate).toISOString()
          : undefined,
      }),
    onSuccess: (res) => {
      toast.success('Encounter berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['encounters'] })
      router.push(
        `/dashboard/${basePath}/encounters/${res.data.data.encounterId}`,
      )
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal membuat encounter')),
  })

  function onSubmit(values: FormValues) {
    mutation.mutate(values)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Data Pasien & Dokter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Lookup Pasien */}
            <FormField
              control={form.control}
              name="memberId"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Pasien <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <MemberLookupInput
                      onSelect={(member: MemberLookupResult) => {
                        form.setValue('memberId', member.memberId, {
                          shouldValidate: true,
                        })
                      }}
                      placeholder="Cari kode akun atau nama pasien..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dokter */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dokter <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dokter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors?.map((d) => (
                        <SelectItem key={d.userId} value={d.userId}>
                          {d.profile?.fullName ?? d.email}
                          {d.profile?.speciality && (
                            <span className="ml-1 text-xs text-slate-400">
                              ({d.profile.speciality})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Detail Encounter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tipe Encounter */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipe Encounter <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONSULTATION">Konsultasi</SelectItem>
                      <SelectItem value="TREATMENT">Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {watchedType === 'CONSULTATION'
                      ? 'Encounter perdana — dokter mengisi assessment dan rencana terapi.'
                      : 'Encounter lanjutan — wajib merujuk ke encounter CONSULTATION yang sudah ada.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paket Pasien */}
            <FormField
              control={form.control}
              name="memberPackageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Paket Pasien <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchedMemberId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            watchedMemberId
                              ? 'Pilih paket aktif pasien'
                              : 'Pilih pasien terlebih dahulu'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.memberPackageId} value={pkg.memberPackageId}>
                          {/* pkg.type dari MemberPackage existing types — sprint 3 */}
                          {pkg.packageName ?? pkg.type}{' '}
                          <span className="text-xs text-slate-400">
                            ({pkg.usedSessions}/{pkg.totalSessions} sesi)
                          </span>
                        </SelectItem>
                      ))}
                      {watchedMemberId && !packages?.length && (
                        <SelectItem value="__none__" disabled>
                          Tidak ada paket aktif
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Consultation Encounter (hanya untuk TREATMENT) */}
            {watchedType === 'TREATMENT' && (
              <FormField
                control={form.control}
                name="consultationEncounterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Encounter Konsultasi <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedMemberId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih encounter CONSULTATION" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {consultations?.map((enc) => (
                          <SelectItem key={enc.encounterId} value={enc.encounterId}>
                            {enc.encounterId.slice(0, 8)}... —{' '}
                            {enc.doctor.profile?.fullName ?? '-'}{' '}
                            <span className="text-xs text-slate-400">
                              ({enc.branch.name})
                            </span>
                          </SelectItem>
                        ))}
                        {watchedMemberId && !consultations?.length && (
                          <SelectItem value="__none__" disabled>
                            Belum ada encounter CONSULTATION ONGOING
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Hanya encounter CONSULTATION yang sudah terisi assessment yang ditampilkan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Tanggal Treatment (opsional) */}
            <FormField
              control={form.control}
              name="treatmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Treatment</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Opsional — bisa diisi kemudian.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Membuat...' : 'Buat Encounter'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  )
}
