import {
  Users, Package, Calendar, CheckCircle2,
  Wallet, AlertTriangle, Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import type { BranchStats } from "@/types";

interface StatItem {
  label:   string;
  value:   string | number;
  icon:    React.ElementType;
  accent:  string;
  sub?:    string;
}

interface Props {
  data: BranchStats;
}

export function BranchStatsCard({ data }: Props) {
  const { stats } = data;

  const items: StatItem[] = [
    {
      label:  "Pasien Aktif",
      value:  stats.totalActiveMembers,
      icon:   Users,
      accent: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      label:  "Paket Aktif",
      value:  stats.activePackages,
      icon:   Package,
      accent: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400",
    },
    {
      label:  "Sesi Hari Ini",
      value:  stats.todaySessions,
      icon:   Calendar,
      accent: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
      sub:    "Dijadwalkan & Berlangsung",
    },
    {
      label:  "Sesi Bulan Ini",
      value:  stats.monthCompletedSessions,
      icon:   CheckCircle2,
      accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
      sub:    "Selesai",
    },
    {
      label:  "Revenue Bulan Ini",
      value:  formatRupiah(stats.monthRevenue),
      icon:   Wallet,
      accent: "text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400",
    },
    {
      label:  "Stok Kritis",
      value:  stats.criticalStockCount,
      icon:   AlertTriangle,
      accent: stats.criticalStockCount > 0
        ? "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"
        : "text-slate-500 bg-slate-50 dark:bg-slate-800",
    },
    {
      label:  "Staff Aktif",
      value:  stats.activeStaff,
      icon:   Stethoscope,
      accent: "text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white truncate">
                  {item.value}
                </p>
                {item.sub && (
                  <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                )}
              </div>
              <div className={`rounded-lg p-2 shrink-0 ${item.accent}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
