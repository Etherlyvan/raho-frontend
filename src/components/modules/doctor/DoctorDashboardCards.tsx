"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, ClipboardList, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api/endpoints/dashboard";
import { formatDate } from "@/lib/utils";
import type { DoctorScheduleItem } from "@/types";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {value}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleItem({ item }: { item: DoctorScheduleItem }) {
  const statusColor: Record<string, string> = {
    PLANNED: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    INPROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    POSTPONED: "bg-slate-100 text-slate-500",
  };
  const statusLabel: Record<string, string> = {
    PLANNED: "Dijadwalkan",
    INPROGRESS: "Berlangsung",
    COMPLETED: "Selesai",
    POSTPONED: "Ditunda",
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {item.member.fullName}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="font-mono">{item.member.memberNo}</span>
          {item.infusKe != null && (
            <span className="ml-2 text-slate-400">Infus ke-{item.infusKe}</span>
          )}
          <span className="ml-2">{item.branch.name}</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
        <Badge className={`text-xs border-0 ${statusColor[item.status] ?? ""}`}>
          {statusLabel[item.status] ?? item.status}
        </Badge>
        <span className="text-xs text-slate-400">
          {formatDate(item.treatmentDate, "dd MMM, HH:mm")}
        </span>
      </div>
    </div>
  );
}

export function DoctorDashboardCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "doctor"],
    queryFn: async () => (await dashboardApi.doctor()).data.data,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jadwal Hari Ini"
          value={s?.todaySessions ?? 0}
          icon={Calendar}
          accent="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
        />
        <StatCard
          label="Encounter Aktif"
          value={s?.activeEncounters ?? 0}
          icon={Users}
          accent="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />
        <StatCard
          label="Perlu Assessment"
          value={s?.pendingAssessments ?? 0}
          icon={ClipboardList}
          accent="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
        <StatCard
          label="Evaluation Rate"
          value={`${s?.evaluationRate ?? 0}%`}
          icon={TrendingUp}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
      </div>

      {/* Jadwal Hari Ini */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Jadwal Hari Ini ({data?.todaySchedule?.length ?? 0})
          </p>
          {!data?.todaySchedule?.length ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Tidak ada jadwal hari ini
            </p>
          ) : (
            data.todaySchedule.map((item) => (
              <ScheduleItem key={item.treatmentSessionId} item={item} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
