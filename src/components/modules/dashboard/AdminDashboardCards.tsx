"use client";
import { Users, Calendar, AlertTriangle, Receipt, TrendingUp, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SessionStatusBadge } from "@/components/shared/StatusBadge";
import { RevenueMiniChart } from "./RevenueMiniChart";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import type { AdminDashboard } from "@/types";

interface Props { data: AdminDashboard; }

const CARDS = (s: AdminDashboard["summary"]) => [
  { title: "Sesi Hari Ini",     value: s.todaySessions,           icon: Calendar,      color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950" },
  { title: "Pasien Aktif",      value: s.totalActiveMembers,       icon: Users,         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { title: "Invoice Pending",   value: s.pendingInvoices,          icon: Receipt,       color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950" },
  { title: "Req. Stok Pending", value: s.pendingStockRequests,     icon: ShoppingCart,  color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950" },
  { title: "Stok Kritis",       value: s.criticalStockCount,       icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950" },
  { title: "Revenue Bulan Ini", value: formatRupiah(s.monthRevenue.total), icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950" },
];

export function AdminDashboardCards({ data }: Props) {
  const { summary, todaySchedule, revenueChart } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CARDS(summary).map((c) => (
          <Card key={c.title} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className={`inline-flex rounded-lg p-2 ${c.bg} mb-3`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.title}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueMiniChart data={revenueChart} />

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Jadwal Hari Ini</p>
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Tidak ada sesi hari ini</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {todaySchedule.map((s) => (
                  <div key={s.treatmentSessionId}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="min-w-0 mr-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {s.encounter.member.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.encounter.branch.name} · ke-{s.infusKe ?? "-"} · {formatDateTime(s.treatmentDate)}
                      </p>
                    </div>
                    <SessionStatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
