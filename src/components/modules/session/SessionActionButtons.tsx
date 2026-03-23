'use client'
import { useState } from 'react'
import { Play, CheckCircle2, PauseCircle, AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CompleteSessionDialog } from '@/components/modules/session/CompleteSessionDialog'
import { PostponeSessionDialog } from '@/components/modules/session/PostponeSessionDialog'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { getApiErrorMessage } from '@/lib/utils'
import type { SessionStatus } from '@/types'

interface Props {
  sessionId: string
  status: SessionStatus
  sessionLabel: string
  /** Dari TreatmentSessionDetail.therapyPlan — null berarti dokter belum mengisi */
  hasTherapyPlan: boolean
}

export function SessionActionButtons({
  sessionId,
  status,
  sessionLabel,
  hasTherapyPlan,
}: Props) {
  const queryClient = useQueryClient()
  const [startConfirmOpen, setStartConfirmOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)

  const startMutation = useMutation({
    mutationFn: () => sessionApi.start(sessionId),
    onSuccess: () => {
      toast.success('Sesi berhasil dimulai')
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setStartConfirmOpen(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memulai sesi')),
  })

  // Sesi sudah final — tidak ada aksi
  if (status === 'COMPLETED' || status === 'POSTPONED') return null

  return (
    <>
      <div className="flex items-center gap-2">
        {/* ── PLANNED: Mulai + Tunda ── */}
        {status === 'PLANNED' && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Wrapper div agar Tooltip bisa attach ke disabled button */}
                  <div>
                    <Button
                      size="sm"
                      disabled={!hasTherapyPlan}
                      onClick={() => setStartConfirmOpen(true)}
                      className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Mulai Sesi
                    </Button>
                  </div>
                </TooltipTrigger>
                {!hasTherapyPlan && (
                  <TooltipContent side="bottom" className="max-w-52 text-xs">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Dokter belum membuat rencana terapi. Sesi tidak dapat dimulai
                        sebelum therapy plan diisi.
                      </span>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPostponeOpen(true)}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Tunda
            </Button>
          </>
        )}

        {/* ── INPROGRESS: Selesaikan ── */}
        {status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            onClick={() => setCompleteOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Selesaikan Sesi
          </Button>
        )}
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={startConfirmOpen}
        onOpenChange={setStartConfirmOpen}
        title="Mulai Sesi?"
        description={`Konfirmasi bahwa sesi "${sessionLabel}" siap dimulai sekarang. Status akan berubah menjadi IN PROGRESS.`}
        confirmLabel="Ya, Mulai Sekarang"
        onConfirm={() => startMutation.mutate()}
        isLoading={startMutation.isPending}
      />

      <CompleteSessionDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        sessionId={sessionId}
        sessionLabel={sessionLabel}
      />

      <PostponeSessionDialog
        open={postponeOpen}
        onOpenChange={setPostponeOpen}
        sessionId={sessionId}
        sessionLabel={sessionLabel}
      />
    </>
  )
}
