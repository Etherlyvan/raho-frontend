'use client'

import { useState }          from 'react'
import { useQuery }          from '@tanstack/react-query'

import { PageHeader }            from '@/components/shared/PageHeader'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
}                                from '@/components/ui/tabs'
import { ReportFilterBar }       from '@/components/modules/reports/ReportFilterBar'
import { RevenueChart }          from '@/components/modules/reports/RevenueChart'
import { TreatmentSummaryCard }  from '@/components/modules/reports/TreatmentSummaryCard'
import { InventoryUsageTable }   from '@/components/modules/reports/InventoryUsageTable'
import { StaffKpiTable }         from '@/components/modules/reports/StaffKpiTable'
import { ExportButton }          from '@/components/modules/reports/ExportButton'
import { reportsApi }            from '@/lib/api/endpoints/reports'
import type { ReportBaseParams } from '@/types'

// ─── Tipe tab aktif ───────────────────────────────────────────────────────────

type ReportTab = 'revenue' | 'treatment' | 'inventory' | 'staff-kpi'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue')
  const [params, setParams]       = useState<ReportBaseParams>({})

  // ── Revenue ────────────────────────────────────────────────────────────────
  const revenueQuery = useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn:  async () => (await reportsApi.revenue(params)).data.data,
    staleTime: 60_000,
    enabled: activeTab === 'revenue',
  })

  // ── Treatment ──────────────────────────────────────────────────────────────
  const treatmentQuery = useQuery({
    queryKey: ['reports', 'treatment', params],
    queryFn:  async () => (await reportsApi.treatment(params)).data.data,
    staleTime: 60_000,
    enabled: activeTab === 'treatment',
  })

  // ── Inventory ──────────────────────────────────────────────────────────────
  const inventoryQuery = useQuery({
    queryKey: ['reports', 'inventory', params],
    queryFn:  async () => (await reportsApi.inventory(params)).data.data,
    staleTime: 60_000,
    enabled: activeTab === 'inventory',
  })

  // ── Staff KPI ──────────────────────────────────────────────────────────────
  const staffKpiQuery = useQuery({
    queryKey: ['reports', 'staff-kpi', params],
    queryFn:  async () => (await reportsApi.staffKpi(params)).data.data,
    staleTime: 60_000,
    enabled: activeTab === 'staff-kpi',
  })

  // Sembunyikan groupBy di tab inventory
  const isInventoryTab = activeTab === 'inventory'

  const activeIsLoading =
    activeTab === 'revenue'    ? revenueQuery.isLoading   :
    activeTab === 'treatment'  ? treatmentQuery.isLoading :
    activeTab === 'inventory'  ? inventoryQuery.isLoading :
    staffKpiQuery.isLoading

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Laporan"
          description="Analisis revenue, sesi treatment, inventori, dan KPI staf."
        />
        {/* Tombol Export — muncul untuk semua tab kecuali saat loading */}
        <ExportButton
          params={params}
          activeTab={activeTab}
        />
      </div>

      <ReportFilterBar
        onFilter={setParams}
        hideGroupBy={isInventoryTab}
        isLoading={activeIsLoading}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ReportTab)}
      >
        <TabsList className="mb-2">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="inventory">Inventori</TabsTrigger>
          <TabsTrigger value="staff-kpi">KPI Staf</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <RevenueChart
            data={revenueQuery.data}
            isLoading={revenueQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="treatment" className="mt-4">
          <TreatmentSummaryCard
            data={treatmentQuery.data}
            isLoading={treatmentQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <InventoryUsageTable
            data={inventoryQuery.data}
            isLoading={inventoryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="staff-kpi" className="mt-4">
          <StaffKpiTable
            data={staffKpiQuery.data}
            isLoading={staffKpiQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
