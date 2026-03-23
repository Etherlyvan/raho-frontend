'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, PackageCheck, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { stockRequestApi } from '@/lib/api/endpoints/stockRequests'
import { getApiErrorMessage } from '@/lib/utils'
import type { StockRequest } from '@/types'

// ── Reject Schema ─────────────────────────────────────────────────────────────

const rejectSchema = z.object({
  reason: z.string().min(5, 'Alasan penolakan wajib diisi (min. 5 karakter)'),
})

// ── Fulfill Schema ────────────────────────────────────────────────────────────

const fulfillSchema = z.object({
  actualQuantity: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type RejectFormValues = z.infer<typeof rejectSchema>
type FulfillFormValues = z.infer<typeof fulfillSchema>

// ── Props & Component ─────────────────────────────────────────────────────────

interface Props {
  request: StockRequest
}

export function StockRequestActions({ request }: Props) {
  const queryClient = useQueryClient()
  const { stockRequestId, status } = request

  const [rejectOpen, setRejectOpen] = useState(false)
  const [fulfillOpen, setFulfillOpen] = useState(false)

  // ── Approve ─────────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: () => stockRequestApi.approve(stockRequestId),
    onSuccess: () => {
      toast.success('Permintaan stok disetujui')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menyetujui permintaan')),
  })

  // ── Reject ──────────────────────────────────────────────────────────────────

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  })

  const rejectMutation = useMutation({
    mutationFn: (values: RejectFormValues) =>
      stockRequestApi.reject(stockRequestId, { reason: values.reason }),
    onSuccess: () => {
      toast.success('Permintaan stok ditolak')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      setRejectOpen(false)
      rejectForm.reset()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menolak permintaan')),
  })

  // ── Fulfill ─────────────────────────────────────────────────────────────────

  const fulfillForm = useForm<FulfillFormValues>({
    resolver: zodResolver(fulfillSchema),
    defaultValues: { actualQuantity: '', notes: '' },
  })

  const fulfillMutation = useMutation({
    mutationFn: (values: FulfillFormValues) =>
      stockRequestApi.fulfill(stockRequestId, {
        actualQuantity:
          values.actualQuantity !== '' && values.actualQuantity !== undefined
            ? Number(values.actualQuantity)
            : undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Permintaan stok ditandai terpenuhi & stok bertambah')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] })
      setFulfillOpen(false)
      fulfillForm.reset()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memenuhi permintaan')),
  })

  // ── Status Guard ─────────────────────────────────────────────────────────────

  const canApprove = status === 'PENDING'
  const canReject = status === 'PENDING'
  const canFulfill = status === 'APPROVED'
  const hasAction = canApprove || canReject || canFulfill

  if (!hasAction) {
    return (
      <span className="text-xs text-slate-400 italic px-2">
        {status === 'REJECTED' ? 'Ditolak' : 'Selesai'}
      </span>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canApprove && (
            <DropdownMenuItem
              className="text-sky-600 focus:text-sky-600 dark:text-sky-400"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {approveMutation.isPending ? 'Memproses...' : 'Setujui'}
            </DropdownMenuItem>
          )}

          {canFulfill && (
            <DropdownMenuItem
              className="text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
              onClick={() => {
                fulfillForm.reset({ actualQuantity: '', notes: '' })
                setFulfillOpen(true)
              }}
            >
              <PackageCheck className="mr-2 h-4 w-4" />
              Tandai Terpenuhi
            </DropdownMenuItem>
          )}

          {(canApprove || canFulfill) && canReject && (
            <DropdownMenuSeparator />
          )}

          {canReject && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400"
              onClick={() => {
                rejectForm.reset()
                setRejectOpen(true)
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Reject Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Tolak Permintaan Stok
            </DialogTitle>
            <DialogDescription className="text-xs">
              {request.item.name} · {request.quantity} {request.item.unit}
            </DialogDescription>
          </DialogHeader>

          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit((v) => rejectMutation.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={rejectForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alasan Penolakan <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan alasan penolakan..."
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
                  onClick={() => setRejectOpen(false)}
                  disabled={rejectMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Menolak...' : 'Ya, Tolak'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Fulfill Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={fulfillOpen} onOpenChange={setFulfillOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-500" />
              Tandai Terpenuhi
            </DialogTitle>
            <DialogDescription className="text-xs">
              {request.item.name} · Permintaan:{' '}
              <span className="font-medium">
                {request.quantity} {request.item.unit}
              </span>
            </DialogDescription>
          </DialogHeader>

          <Form {...fulfillForm}>
            <form
              onSubmit={fulfillForm.handleSubmit((v) => fulfillMutation.mutate(v))}
              className="space-y-4"
            >
              {/* Info: stok akan bertambah otomatis */}
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Stok item akan bertambah otomatis sesuai jumlah yang dipenuhi.
                  Kosongkan jumlah aktual untuk menggunakan jumlah permintaan asli (
                  {request.quantity} {request.item.unit}).
                </p>
              </div>

              {/* Jumlah Aktual */}
              <FormField
                control={fulfillForm.control}
                name="actualQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Aktual (opsional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0.01}
                          step="any"
                          placeholder={`Default: ${request.quantity}`}
                          {...field}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {request.item.unit}
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Isi jika jumlah yang dikirim berbeda dari permintaan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Catatan */}
              <FormField
                control={fulfillForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan pemenuhan (opsional)..."
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
                  onClick={() => setFulfillOpen(false)}
                  disabled={fulfillMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={fulfillMutation.isPending}
                >
                  {fulfillMutation.isPending ? 'Memproses...' : 'Konfirmasi Terpenuhi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
