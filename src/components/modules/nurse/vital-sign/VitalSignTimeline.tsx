'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Activity } from 'lucide-react';
import type { VitalSign } from '@/types';

interface ChartDataPoint {
  label: string;
  nadi: number | null;
  sistolik: number | null;
  diastolik: number | null;
  pi: number | null;
}

function toChartData(vitalSigns: VitalSign[]): ChartDataPoint[] {
  return vitalSigns.map((vs, idx) => ({
    label: vs.measuredAt
      ? format(parseISO(vs.measuredAt), 'HH:mm', { locale: localeId })
      : `T-${idx + 1}`,
    nadi:     vs.nadi     ?? null,
    sistolik: vs.tensiSistolik  ?? null,
    diastolik: vs.tensiDiastolik ?? null,
    pi: vs.pi ? parseFloat(vs.pi) : null,
  }));
}

interface Props {
  vitalSigns: VitalSign[];
}

export function VitalSignTimeline({ vitalSigns }: Props) {
  if (vitalSigns.length === 0) {
    return (
      <Card size="sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-500" />
            Grafik Tanda Vital
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EmptyState
            title="Belum ada data"
            description="Input minimal satu tanda vital untuk menampilkan grafik."
          />
        </CardContent>
      </Card>
    );
  }

  const chartData = toChartData(vitalSigns);

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-500" />
          Grafik Tanda Vital
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {vitalSigns.length} pengukuran
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                const labelMap: Record<string, string> = {
                  nadi:      'Nadi (bpm)',
                  sistolik:  'Sistolik (mmHg)',
                  diastolik: 'Diastolik (mmHg)',
                  pi:        'PI (%)',
                };
                return [value, labelMap[name] ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => {
                const map: Record<string, string> = {
                  nadi: 'Nadi', sistolik: 'Sistolik',
                  diastolik: 'Diastolik', pi: 'PI',
                };
                return map[value] ?? value;
              }}
            />
            <Line
              type="monotone"
              dataKey="nadi"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#14b8a6' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sistolik"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="diastolik"
              stroke="#fb923c"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#fb923c' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="pi"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 3, fill: '#a78bfa' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
