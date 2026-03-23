'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { userApi } from '@/lib/api/endpoints/users'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  nurseId: z.string().optional(),
  pelaksanaan: z.enum(['KLINIK', 'HOMECARE'] as const).optional(),
  treatmentDate: z
    .string()
    .min(1, 'Tanggal treatment wajib diisi')
    .refine((v) => !isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
  nextTreatmentDate: z.string().optional(),
  keluhanSebelum: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  encounterId: string
  branchId: string
}

export function CreateSessionDialog({ open, onOpenChange, encounterId, branchId }: Props) {
  const queryClient = useQueryClient()

  const { data: nurses } = useQuery({
    queryKey: ['users', 'nurses', branchId],
    queryFn: async () => {
      const res = await userApi.list({ role: 'NURSE', branchId, isActive: true, limit: 100 })
      return res.data.data
    },
    enabled: open,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nurseId: '',
      pelaksanaan: 'KLINIK',
      treatmentDate: '',
      nextTreatmentDate: '',
      keluhanSebelum: '',
    },
  })

  // Reset form setiap kali dialog dibuka
  useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      sessionApi.create({
        encounterId,
        nurseId: values.nurseId || undefined,
        pelaksanaan: values.pelaksanaan,
        treatmentDate: new Date(values.treatmentDate).toISOString(),
        nextTreatmentDate: values.nextTreatmentDate
          ? new Date(values.nextTreatmentDate).toISOString()
          : undefined,
        keluhanSebelum: values.keluhanSebelum || undefined,
      }),
    onSuccess: () => {
      toast.success('Sesi berhasil dijadwalkan')
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['encounters', encounterId] })
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menjadwalkan sesi')),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Jadwalkan Sesi Treatment</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Encounter ID: <span className="font-mono">{encounterId.slice(0, 12)}...</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Tanggal Treatment */}
            <FormField
              control={form.control}
              name="treatmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tanggal Treatment <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipe Pelaksanaan */}
            <FormField
              control={form.control}
              name="pelaksanaan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Pelaksanaan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KLINIK">Di Klinik</SelectItem>
                      <SelectItem value="HOMECARE">Homecare</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Perawat */}
            <FormField
              control={form.control}
              name="nurseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perawat</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih perawat (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Belum ditentukan</SelectItem>
                      {nurses?.map((n) => (
                        <SelectItem key={n.userId} value={n.userId}>
                          {n.profile?.fullName ?? n.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jadwal Sesi Berikutnya */}
            <FormField
              control={form.control}
              name="nextTreatmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jadwal Sesi Berikutnya</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keluhan Sebelum */}
            <FormField
              control={form.control}
              name="keluhanSebelum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keluhan Sebelum Sesi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catat keluhan pasien sebelum sesi..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Menyimpan...' : 'Jadwalkan Sesi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
