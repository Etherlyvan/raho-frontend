'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PackagePlus } from 'lucide-react'
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
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { getApiErrorMessage } from '@/lib/utils'
import type { InventoryItem } from '@/types'

const schema = z.object({
  amount: z.coerce
    .number()
    .positive('Jumlah penambahan harus lebih dari 0'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
}

export function AddStockDialog({ open, onOpenChange, item }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 1, notes: '' },
  })

  useEffect(() => {
    if (open) form.reset({ amount: 1, notes: '' })
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      inventoryApi.addStock(item!.inventoryItemId, {
        amount: values.amount,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success(`Stok "${item?.name}" berhasil ditambahkan`)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] })
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menambahkan stok')),
  })

  if (!item) return null

  const isLow = item.stock <= item.minThreshold

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-emerald-500" />
            Tambah Stok
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item.name} ·{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Stok saat ini: {item.stock} {item.unit}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Warning jika stok kritis */}
        {isLow && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
            <p className="text-xs text-red-700 dark:text-red-400">
              ⚠ Stok di bawah minimum threshold ({item.minThreshold} {item.unit}).
              Segera tambah stok.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Jumlah Penambahan */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jumlah Penambahan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        step="any"
                        {...field}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        {item.unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Stok setelah penambahan:{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {(item.stock + (form.watch('amount') || 0)).toFixed(
                        Number.isInteger(item.stock) ? 0 : 2,
                      )}{' '}
                      {item.unit}
                    </span>
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
                      placeholder="Catatan penerimaan barang (opsional)..."
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
                {mutation.isPending ? 'Menyimpan...' : 'Tambah Stok'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
