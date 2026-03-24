'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vitalSignsApi } from '@/lib/api/endpoints/vitalSigns';
import { getApiErrorMessage } from '@/lib/utils';

const schema = z.object({
  nadi:         z.number({ invalid_type_error: 'Masukkan angka' }).int().positive('Harus > 0').max(300),
  pi:           z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative('Tidak boleh negatif').max(100),
  tensiSistolik:  z.number({ invalid_type_error: 'Masukkan angka' }).int().positive('Harus > 0').max(300),
  tensiDiastolik: z.number({ invalid_type_error: 'Masukkan angka' }).int().positive('Harus > 0').max(200),
  measuredAt:   z.string().optional(),
}).refine(
  (d) => d.tensiSistolik > d.tensiDiastolik,
  {
    message: 'Tensi sistolik harus lebih besar dari diastolik',
    path: ['tensiSistolik'],
  }
);

type FormValues = z.infer<typeof schema>;

interface Props {
  sessionId: string;
}

export function VitalSignForm({ sessionId }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nadi: undefined as unknown as number,
      pi: undefined as unknown as number,
      tensiSistolik: undefined as unknown as number,
      tensiDiastolik: undefined as unknown as number,
      measuredAt: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      vitalSignsApi.create(sessionId, {
        nadi:           values.nadi,
        pi:             values.pi,
        tensiSistolik:  values.tensiSistolik,
        tensiDiastolik: values.tensiDiastolik,
        measuredAt:     values.measuredAt || undefined,
      }),
    onSuccess: () => {
      toast.success('Tanda vital berhasil dicatat.');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['vital-signs', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal menyimpan tanda vital')),
  });

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Input Tanda Vital Baru</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Nadi */}
              <FormField
                control={form.control}
                name="nadi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Nadi <span className="text-xs text-muted-foreground">(bpm)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PI */}
              <FormField
                control={form.control}
                name="pi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      PI <span className="text-xs text-muted-foreground">(%)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="2.50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tensi Sistolik */}
              <FormField
                control={form.control}
                name="tensiSistolik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Sistolik <span className="text-xs text-muted-foreground">(mmHg)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tensi Diastolik */}
              <FormField
                control={form.control}
                name="tensiDiastolik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Diastolik <span className="text-xs text-muted-foreground">(mmHg)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Waktu pengukuran — opsional, default ke now di BE */}
            <FormField
              control={form.control}
              name="measuredAt"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel className="text-xs">
                    Waktu Ukur{' '}
                    <span className="text-muted-foreground font-normal">(opsional, default: sekarang)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {mutation.isPending ? 'Menyimpan...' : 'Tambah Tanda Vital'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
