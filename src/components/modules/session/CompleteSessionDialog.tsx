'use client'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Separator } from '@/components/ui/separator'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { formatRupiah, getApiErrorMessage } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  quantity: z.coerce.number().positive('Qty harus > 0'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
})

const schema = z.object({
  keluhanSesudah: z.string().optional(),
  berhasilInfus: z.enum(['true', 'false', ''] as const).optional(),
  healingCrisis: z.string().optional(),
  invoiceNotes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Minimal 1 item invoice wajib diisi'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionLabel: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompleteSessionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionLabel,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      keluhanSesudah: '',
      berhasilInfus: 'true',
      healingCrisis: '',
      invoiceNotes: '',
      items: [{ name: '', quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = form.watch('items')
  const total = watchedItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0,
  )

  useEffect(() => {
    if (open) {
      form.reset({
        keluhanSesudah: '',
        berhasilInfus: 'true',
        healingCrisis: '',
        invoiceNotes: '',
        items: [{ name: '', quantity: 1, price: 0 }],
      })
    }
  }, [open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      sessionApi.complete(sessionId, {
        keluhanSesudah: values.keluhanSesudah || undefined,
        berhasilInfus:
          values.berhasilInfus === 'true'
            ? true
            : values.berhasilInfus === 'false'
            ? false
            : undefined,
        healingCrisis: values.healingCrisis || undefined,
        invoiceAmount: total,
        invoiceItems: values.items,
        invoiceNotes: values.invoiceNotes || undefined,
      }),
    onSuccess: () => {
      toast.success('Sesi selesai — invoice otomatis dibuat')
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      onOpenChange(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menyelesaikan sesi')),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Selesaikan Sesi</DialogTitle>
          <DialogDescription className="text-xs">{sessionLabel}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh] pr-3">
          <Form {...form}>
            <form
              id="complete-session-form"
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              className="space-y-5 py-1"
            >
              {/* Keluhan Sesudah */}
              <FormField
                control={form.control}
                name="keluhanSesudah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keluhan Sesudah Sesi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kondisi dan keluhan pasien setelah sesi..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Berhasil Infus — toggle button */}
              <FormField
                control={form.control}
                name="berhasilInfus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Infus</FormLabel>
                    <div className="flex gap-3">
                      {(
                        [
                          { value: 'true', label: '✓ Berhasil', success: true },
                          { value: 'false', label: '✗ Tidak Berhasil', success: false },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                            field.value === opt.value
                              ? opt.success
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Healing Crisis */}
              <FormField
                control={form.control}
                name="healingCrisis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Healing Crisis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catat healing crisis jika ada..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Invoice Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Item Invoice{' '}
                    <span className="text-red-500">*</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => append({ name: '', quantity: 1, price: 0 })}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Tambah Item
                  </Button>
                </div>

                {/* Header kolom */}
                <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="col-span-5">Nama Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4">Harga (Rp)</span>
                  <span className="col-span-1" />
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="col-span-5 space-y-0">
                          <FormControl>
                            <Input
                              placeholder="Nama item"
                              {...field}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-2 space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              placeholder="1"
                              {...field}
                              className="h-8 text-sm text-center"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="col-span-4 space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              placeholder="0"
                              {...field}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                      className="col-span-1 h-8 w-8 text-slate-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Invoice
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {/* Invoice Notes */}
              <FormField
                control={form.control}
                name="invoiceNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Invoice</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan untuk invoice..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

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
            form="complete-session-form"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Memproses...' : 'Selesaikan & Buat Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
