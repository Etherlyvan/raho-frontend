import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCompareArrows } from 'lucide-react';
import type { TherapyPlan, InfusionExecution } from '@/types';

interface DosisRow {
  label: string;
  unit: string;
  planValue: number | null | undefined;
  actualValue: number | null | undefined;
}

function buildRows(
  plan: TherapyPlan | null,
  execution: InfusionExecution | null
): DosisRow[] {
  return [
    {
      label: 'IFA',
      unit: 'mg',
      planValue:   plan?.ifaMg ?? null,
      actualValue: execution?.ifaMgActual ?? null,
    },
    {
      label: 'HHO',
      unit: 'mL',
      planValue:   plan?.hhoMl ?? null,
      actualValue: execution?.hhoMlActual ?? null,
    },
    {
      label: 'H₂',
      unit: 'mL',
      planValue:   plan?.h2Ml ?? null,
      actualValue: execution?.h2MlActual ?? null,
    },
    {
      label: 'NO',
      unit: 'mL',
      planValue:   plan?.noMl ?? null,
      actualValue: execution?.noMlActual ?? null,
    },
    {
      label: 'GasO',
      unit: 'mL',
      planValue:   plan?.gasoMl ?? null,
      actualValue: execution?.gasoMlActual ?? null,
    },
    {
      label: 'O₂',
      unit: 'mL',
      planValue:   plan?.o2Ml ?? null,
      actualValue: execution?.o2MlActual ?? null,
    },
  ];
}

function isDifferent(
  plan: number | null | undefined,
  actual: number | null | undefined
): boolean {
  return (
    plan   !== null && plan   !== undefined &&
    actual !== null && actual !== undefined &&
    plan !== actual
  );
}

function ValueCell({
  value,
  unit,
  highlight,
  side,
}: {
  value: number | null | undefined;
  unit: string;
  highlight: boolean;
  side: 'plan' | 'actual';
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <span
      className={cn(
        'text-sm font-medium tabular-nums',
        highlight && side === 'actual'
          ? 'text-amber-700 dark:text-amber-400 font-semibold'
          : highlight && side === 'plan'
          ? 'text-slate-500 dark:text-slate-400 line-through decoration-red-400'
          : 'text-slate-800 dark:text-slate-200'
      )}
    >
      {value}
      <span className="text-xs font-normal text-muted-foreground ml-0.5">
        {unit}
      </span>
    </span>
  );
}

interface Props {
  plan: TherapyPlan | null;
  execution: InfusionExecution | null;
}

/**
 * InfusionPlanCompare — Tabel 2 kolom: Rencana Dokter vs Aktual Perawat.
 * Baris yang berbeda di-highlight amber pada kolom Aktual.
 */
export function InfusionPlanCompare({ plan, execution }: Props) {
  const rows    = buildRows(plan, execution);
  const hasDiff = rows.some((r) => isDifferent(r.planValue, r.actualValue));

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-blue-500" />
          Perbandingan Rencana vs Aktual
          {hasDiff && (
            <span className="ml-auto text-xs font-normal text-amber-600 dark:text-amber-400">
              Ada deviasi
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-16">
                  Komponen
                </th>
                <th className="pb-2 text-center text-xs font-medium text-muted-foreground">
                  Rencana Dokter
                </th>
                <th className="pb-2 text-center text-xs font-medium text-muted-foreground">
                  Aktual Perawat
                </th>
                <th className="pb-2 text-center text-xs font-medium text-muted-foreground w-20">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {rows.map((row) => {
                const diff = isDifferent(row.planValue, row.actualValue);
                return (
                  <tr
                    key={row.label}
                    className={cn(
                      'transition-colors',
                      diff
                        ? 'bg-amber-50/60 dark:bg-amber-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    )}
                  >
                    <td className="py-2.5 pr-2 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {row.label}
                    </td>
                    <td className="py-2.5 text-center">
                      <ValueCell
                        value={row.planValue}
                        unit={row.unit}
                        highlight={diff}
                        side="plan"
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      <ValueCell
                        value={row.actualValue}
                        unit={row.unit}
                        highlight={diff}
                        side="actual"
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      {diff ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          ⚠ Beda
                        </span>
                      ) : row.planValue !== null && row.actualValue !== null ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          ✓ Sesuai
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail fisik infus — hanya tampil jika execution ada */}
        {execution && (
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
            {[
              { label: 'Jenis Botol',      value: execution.jenisBotol },
              { label: 'Jenis Cairan',     value: execution.jenisCairan },
              {
                label: 'Volume Carrier',
                value: execution.volumeCarrierMl ? `${execution.volumeCarrierMl} mL` : null,
              },
              {
                label: 'Penggunaan Jarum',
                value: execution.jumlahPenggunaanJarum
                  ? `${execution.jumlahPenggunaanJarum}×`
                  : null,
              },
              {
                label: 'Tgl Produksi Cairan',
                value: execution.tglProduksiCairan
                  ? new Date(execution.tglProduksiCairan).toLocaleDateString('id-ID')
                  : null,
              },
              { label: 'Diisi oleh', value: execution.filler.profile?.fullName ?? execution.filler.staffCode },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {value ?? '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Catatan deviasi — tampil jika ada */}
        {execution?.deviationNote && (
          <div className="mt-4 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">
              Catatan Deviasi
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {execution.deviationNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
