'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { InventoryForm } from '@/components/modules/inventory/InventoryForm'

export default function NewInventoryPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/admin/inventory')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Tambah Item Inventori"
          description="Daftarkan item baru ke inventori cabang"
          className="pb-0"
        />
      </div>

      <InventoryForm mode="create" />
    </div>
  )
}
