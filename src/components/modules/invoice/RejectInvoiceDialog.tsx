'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { XCircle } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { invoiceApi } from '@/lib/api/endpoints/invoices'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  reason: z
    .string()
    .min(5, 'Alasan penolakan wajib diisi (min. 5 karakter)')
    .max(500, 'Alasan terlalu panjang'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceLabel: string
}

export function RejectInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceLabel,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      invoiceApi.reject(invoiceId, { reason: values.reason }),
    onSuccess: () => {
      toast.success('Invoice berhasil ditolak')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menolak invoice')),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Tolak Invoice
          </DialogTitle>
          <DialogDescription className="text-xs">{invoiceLabel}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Peringatan */}
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
              <p className="text-xs text-red-700 dark:text-red-400">
                Invoice yang ditolak tidak dapat dikembalikan ke status PENDING. Pastikan
                alasan penolakan sudah benar sebelum melanjutkan.
              </p>
            </div>

            {/* Alasan */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan alasan penolakan invoice ini..."
                      rows={4}
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
                variant="destructive"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Menolak...' : 'Ya, Tolak Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
