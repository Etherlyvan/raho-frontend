'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItemSelect } from './InventoryItemSelect';
import { materialUsagesApi } from '@/lib/api/endpoints/materialUsages';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import { getApiErrorMessage } from '@/lib/utils';
import type { InventoryItem } from '@/types';
import { useQuery } from '@tanstack/react-query';

/* ─── Schema ───────────────────────────────────────────────────────────────── */
const schema = z.object({
  inventoryItemId: z
    .string({ required_error: 'Pilih item inventori' })
    .min(1, 'Pilih item inventori'),
  quantity: z
    .number({ invalid_type_error: 'Masukkan jumlah' })
    .positive('Jumlah harus lebih dari 0'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  sessionId: string;
  branchId: string;
}

/**
 * MaterialUsageForm — Form input pemakaian bahan/alat.
 * - Dropdown searchable dari inventoryApi.list branchId
 * - Satuan auto-fill dari item terpilih (dapat diubah manual)
 * - Validasi stok: quantity ≤ item.stock
 */
export function MaterialUsageForm({ sessionId, branchId }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inventoryItemId: '',
      quantity: undefined as unknown as number,
      unit: '',
    },
  });

  const watchedItemId  = form.watch('inventoryItemId');
  const watchedQty     = form.watch('quantity');

  /* Ambil data item yang sedang dipilih untuk validasi stok real-time */
  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory', 'list', branchId],
    queryFn: async () => {
      const res = await inventoryApi.list({ branchId, isActive: true, limit: 100 });
      return res.data.data as InventoryItem[];
    },
    enabled: !!branchId,
    staleTime: 60 * 1000,
  });

  const selectedItem = inventoryItems?.find(
    (i) => i.inventoryItemId === watchedItemId
  ) ?? null;

  const exceedsStock =
    selectedItem !== null &&
    watchedQty !== undefined &&
    watchedQty > selectedItem.stock;

  /* Mutation */
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      materialUsagesApi.create(sessionId, {
        inventoryItemId: values.inventoryItemId,
        quantity:        values.quantity,
        unit:            values.unit,
      }),
    onSuccess: () => {
      toast.success('Pemakaian bahan berhasil dicatat. Stok telah berkurang otomatis.');
      form.reset({
        inventoryItemId: '',
        quantity: undefined as unknown as number,
        unit: '',
      });
      queryClient.invalidateQueries({ queryKey: ['material-usages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'list', branchId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal mencatat pemakaian bahan')),
  });

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Input Pemakaian Bahan / Alat</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Item Selector */}
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Item Inventori <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InventoryItemSelect
                      branchId={branchId}
                      value={field.value}
                      onChange={(item: InventoryItem | null) => {
                        field.onChange(item?.inventoryItemId ?? '');
                        /* Auto-fill satuan dari item */
                        if (item) form.setValue('unit', item.unit);
                        else form.setValue('unit', '');
                      }}
                    />
                  </FormControl>
                  {selectedItem && (
                    <FormDescription className="text-xs">
                      Stok tersedia:{' '}
                      <span
                        className={
                          selectedItem.stock <= selectedItem.minThreshold
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : 'text-emerald-600 dark:text-emerald-400 font-medium'
                        }
                      >
                        {selectedItem.stock} {selectedItem.unit}
                      </span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Jumlah <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0.01}
                        placeholder="1"
                        className={
                          exceedsStock
                            ? 'border-red-400 dark:border-red-600 focus-visible:ring-red-400'
                            : ''
                        }
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? undefined : e.target.valueAsNumber
                          )
                        }
                      />
                    </FormControl>
                    {exceedsStock && (
                      <p className="text-xs text-red-500 mt-1">
                        Melebihi stok ({selectedItem!.stock} {selectedItem!.unit})
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Satuan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="pcs, mL, mg..."
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || exceedsStock || !watchedItemId}
              className="bg-teal-600 hover:bg-teal-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {mutation.isPending ? 'Mencatat...' : 'Catat Pemakaian'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
