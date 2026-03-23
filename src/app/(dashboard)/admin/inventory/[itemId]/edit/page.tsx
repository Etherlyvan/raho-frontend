'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryForm } from '@/components/modules/inventory/InventoryForm'
import { inventoryApi } from '@/lib/api/endpoints/inventory'

export default function EditInventoryPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const router = useRouter()

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory', itemId],
    queryFn: async () => {
      const res = await inventoryApi.detail(itemId)
      return res.data.data
    },
    enabled: !!itemId,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() =>
            router.push(`/admin/inventory/${itemId}`)
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Edit Item Inventori"
          description={item ? `Mengedit: ${item.name}` : 'Memuat data...'}
          className="pb-0"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-lg rounded-xl" />
      ) : item ? (
        <InventoryForm mode="edit" existing={item} />
      ) : (
        <p className="text-sm text-slate-500">Item tidak ditemukan.</p>
      )}
    </div>
  )
}
