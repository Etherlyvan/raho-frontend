'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { stockRequestApi } from '@/lib/api/endpoints/stockRequests'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/lib/utils'
import type { InventoryCategory } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  inventoryItemId: z.string().min(1, 'Pilih item inventori'),
  quantity: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE: 'Obat',
  DEVICE: 'Alat',
  CONSUMABLE: 'Habis Pakai',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  // Jika digunakan dari halaman Admin (Admin bisa membuat request juga)
  redirectPath?: string
}

export function StockRequestForm({ redirectPath = '/admin/stock-requests' }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const [selectedItemId, setSelectedItemId] = useState<string>('')

  // Ambil daftar inventory untuk dropdown — scoped ke branchId user
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', 'all', user?.branchId],
    queryFn: async () => {
      const res = await inventoryApi.list({
        branchId: user?.branchId ?? undefined,
        isActive: true,
        limit: 100,
      })
      return res.data.data
    },
    enabled: !!user,
  })

  const selectedItem = inventoryData?.find(
    (i) => i.inventoryItemId === selectedItemId,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inventoryItemId: '', quantity: 1, reason: '' },
  })

  // Watch inventoryItemId untuk preview stok
  const watchedItemId = form.watch('inventoryItemId')
  useEffect(() => {
    setSelectedItemId(watchedItemId)
  }, [watchedItemId])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      stockRequestApi.create({
        inventoryItemId: values.inventoryItemId,
        quantity: values.quantity,
        reason: values.reason || undefined,
      }),
    onSuccess: () => {
      toast.success('Permintaan stok berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      router.push(redirectPath)
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal membuat permintaan stok')),
  })

  const isCritical =
    selectedItem && selectedItem.stock <= selectedItem.minThreshold

  return (
    <Card className="max-w-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-5"
          >
            {/* Pilih Item */}
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Item Inventori <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={inventoryLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            inventoryLoading
                              ? 'Memuat data...'
                              : 'Pilih item inventori'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryData?.map((item) => (
                        <SelectItem
                          key={item.inventoryItemId}
                          value={item.inventoryItemId}
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-xs text-slate-400">
                              ({CATEGORY_LABEL[item.category]} · stok:{' '}
                              {item.stock} {item.unit})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview stok item yang dipilih */}
            {selectedItem && (
              <div
                className={`rounded-lg border p-3 text-sm space-y-1 ${
                  isCritical
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Stok saat ini:
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isCritical
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {selectedItem.stock} {selectedItem.unit}
                  </span>
                  {isCritical && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0 text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Kritis
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Minimum threshold:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {selectedItem.minThreshold} {selectedItem.unit}
                  </span>
                </div>
                {selectedItem.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Lokasi:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedItem.location}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Jumlah */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jumlah Diminta <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        step="any"
                        {...field}
                      />
                      {selectedItem && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {selectedItem.unit}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alasan */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Permintaan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan keperluan permintaan stok (opsional)..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Alasan yang jelas mempercepat proses persetujuan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(redirectPath)}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Mengirim...' : 'Kirim Permintaan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
