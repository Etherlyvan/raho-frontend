"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface DataPoint {
  date:    string;
  revenue: number;
}

interface Props { data: { date: string; total: number }[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
        {formatRupiah(payload[0].value)}
      </p>
    </div>
  );
};

export function RevenueMiniChart({ data }: Props) {
  const formatted = data.map((d) => ({
    date: format(parseISO(d.date), "dd MMM", { locale: id }),
    total: d.total,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Revenue 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v: number) => [formatRupiah(v), "Revenue"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}