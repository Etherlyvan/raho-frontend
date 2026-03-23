'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EncounterForm } from '@/components/modules/encounter/EncounterForm'

export default function NewEncounterPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/dashboard/admin/encounters')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Buat Encounter Baru"
          description="Jadwalkan konsultasi atau sesi treatment untuk pasien"
          className="pb-0"
        />
      </div>

      {/* ✅ Tidak perlu branchId prop — form baca dari store sendiri */}
      <EncounterForm
        onSuccess={() => router.push('/dashboard/admin/encounters')}
      />
    </div>
  )
}
