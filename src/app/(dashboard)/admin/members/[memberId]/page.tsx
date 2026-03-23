'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Power } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MemberStatusBadge } from '@/components/modules/member/MemberStatusBadge'
import { MemberDetailTabs } from '@/components/modules/member/MemberDetailTabs'
import { memberApi } from '@/lib/api/endpoints/members'
import { formatDate, getApiErrorMessage } from '@/lib/utils'

export default function MemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showToggle, setShowToggle] = useState(false)

  const { data: member, isLoading } = useQuery({
    queryKey: ['members', memberId],
    queryFn: async () => (await memberApi.detail(memberId)).data.data,
  })

  const toggleMutation = useMutation({
    mutationFn: () => memberApi.toggleActive(memberId),
    onSuccess: () => {
      toast.success('Status pasien berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['members', memberId] })
      setShowToggle(false)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal mengubah status')),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!member) return null

  const name = member.fullName
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  // isActive di-derive dari status, BUKAN member.isActive
  const isActive = member.status === 'ACTIVE'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push('/admin/members')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="text-sm font-semibold bg-emerald-100 text-emerald-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {name}
              </h1>
              <MemberStatusBadge status={member.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {member.memberNo} · {member.registrationBranch.name} ·{' '}
              {member.dateOfBirth ? formatDate(member.dateOfBirth) : '-'}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isActive ? 'destructive' : 'default'}
          onClick={() => setShowToggle(true)}
          className="gap-2 shrink-0"
        >
          <Power className="h-4 w-4" />
          {isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </Button>
      </div>

      {/* Tabs */}
      <MemberDetailTabs member={member} />

      {/* Confirm Toggle */}
      <ConfirmDialog
        open={showToggle}
        onOpenChange={(open) => !open && setShowToggle(false)}
        title={isActive ? 'Nonaktifkan Pasien' : 'Aktifkan Pasien'}
        description={`Yakin ingin ${isActive ? 'menonaktifkan' : 'mengaktifkan'} pasien ${member.fullName}?`}
        confirmLabel={isActive ? 'Nonaktifkan' : 'Aktifkan'}
        variant={isActive ? 'destructive' : 'default'}
        onConfirm={() => toggleMutation.mutate()}
        isLoading={toggleMutation.isPending}
      />
    </div>
  )
}
