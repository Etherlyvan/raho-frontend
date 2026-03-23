'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { getApiErrorMessage } from '@/lib/utils'
import type { InventoryItem, InventoryCategory } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  category: z.enum(['MEDICINE', 'DEVICE', 'CONSUMABLE'] as const, {
    errorMap: () => ({ message: 'Pilih kategori item' }),
  }),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  minThreshold: z.coerce
    .number()
    .nonnegative('Threshold tidak boleh negatif')
    .default(0),
  location: z.string().optional(),
})

const createSchema = baseSchema.extend({
  stock: z.coerce.number().nonnegative('Stok awal tidak boleh negatif').default(0),
})

const updateSchema = baseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimal satu field harus diisi' },
)

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>

// ── Category Options ──────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: InventoryCategory; label: string }[] = [
  { value: 'MEDICINE', label: 'Obat / Farmasi' },
  { value: 'DEVICE', label: 'Alat Medis' },
  { value: 'CONSUMABLE', label: 'Barang Habis Pakai' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  mode: 'create' | 'edit'
  existing?: InventoryItem
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InventoryForm({ mode, existing }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const isEdit = mode === 'edit'

  // Form hanya untuk create karena update pakai schema partial
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(
    isEdit
        ? (updateSchema as unknown as z.ZodType<CreateFormValues>)
        : createSchema,
    ),
    defaultValues: {
      name: existing?.name ?? '',
      category: (existing?.category as InventoryCategory) ?? undefined,
      unit: existing?.unit ?? '',
      stock: 0,
      minThreshold: existing?.minThreshold ?? 0,
      location: existing?.location ?? '',
    },
  })

  useEffect(() => {
    if (existing) {
      form.reset({
        name: existing.name,
        category: existing.category,
        unit: existing.unit,
        minThreshold: existing.minThreshold,
        location: existing.location ?? '',
      })
    }
  }, [existing, form])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      inventoryApi.create({
        name: values.name,
        category: values.category,
        unit: values.unit,
        stock: values.stock,
        minThreshold: values.minThreshold,
        location: values.location || undefined,
      }),
    onSuccess: () => {
      toast.success('Item inventori berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      router.push('/admin/inventory')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menambahkan item')),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      inventoryApi.update(existing!.inventoryItemId, {
        name: values.name || undefined,
        category: values.category || undefined,
        unit: values.unit || undefined,
        minThreshold: values.minThreshold,
        location: values.location || undefined,
      }),
    onSuccess: () => {
      toast.success('Item inventori berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({
        queryKey: ['inventory', existing?.inventoryItemId],
      })
      router.push('/admin/inventory')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memperbarui item')),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: CreateFormValues) {
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Nama Item */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Item <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Infus NaCl 500ml" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kategori <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Satuan */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Satuan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: botol, buah, lembar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stok Awal — hanya saat create */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Awal</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Jumlah stok awal saat item pertama kali ditambahkan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Minimum Threshold */}
            <FormField
              control={form.control}
              name="minThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Notifikasi kritis akan muncul jika stok ≤ nilai ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lokasi */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Penyimpanan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Gudang A, Rak 3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/inventory')}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? 'Menyimpan...'
                    : 'Menambahkan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Item'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
