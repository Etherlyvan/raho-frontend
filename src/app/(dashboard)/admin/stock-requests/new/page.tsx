'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StockRequestForm } from '@/components/modules/inventory/StockRequestForm'

export default function NewStockRequestPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/admin/stock-requests')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Buat Permintaan Stok"
          description="Ajukan permintaan penambahan stok ke pusat"
          className="pb-0"
        />
      </div>

      <StockRequestForm redirectPath="/admin/stock-requests" />
    </div>
  )
}
