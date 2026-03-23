'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  reason: z.string().min(3, 'Alasan penundaan wajib diisi (min. 3 karakter)'),
  newTreatmentDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionLabel: string
}

export function PostponeSessionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionLabel,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '', newTreatmentDate: '' },
  })

  useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      sessionApi.postpone(sessionId, {
        reason: values.reason,
        newTreatmentDate: values.newTreatmentDate
          ? new Date(values.newTreatmentDate).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Sesi berhasil ditunda')
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menunda sesi')),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tunda Sesi</DialogTitle>
          <DialogDescription className="text-xs">{sessionLabel}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alasan Penundaan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Sebutkan alasan penundaan sesi..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newTreatmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jadwal Ulang Ke Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
              <Button
                type="submit"
                variant="destructive"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Menunda...' : 'Tunda Sesi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
