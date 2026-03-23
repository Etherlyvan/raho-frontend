'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { invoiceApi } from '@/lib/api/endpoints/invoices'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  paidAt: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceLabel: string
}

export function ConfirmPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceLabel,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paidAt: new Date().toISOString().slice(0, 16), // default: sekarang (datetime-local format)
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        paidAt: new Date().toISOString().slice(0, 16),
        notes: '',
      })
    }
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
    invoiceApi.confirmPayment(invoiceId, {
        paidAt: values.paidAt
        ? new Date(values.paidAt).toISOString()
        : undefined,
        notes: values.notes || undefined,
    }),
    onSuccess: () => {
      toast.success('Pembayaran berhasil dikonfirmasi')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal mengkonfirmasi pembayaran')),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Konfirmasi Pembayaran
          </DialogTitle>
          <DialogDescription className="text-xs">{invoiceLabel}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Tanggal & Waktu Bayar */}
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal & Waktu Pembayaran</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Default: waktu sekarang. Ubah jika pembayaran dilakukan sebelumnya.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Catatan */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan konfirmasi pembayaran (opsional)..."
                      rows={2}
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
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Memproses...' : 'Konfirmasi Lunas'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
