import { AlertTriangle } from 'lucide-react';

interface DosisFields {
  ifaMg?: number | null;
  hhoMl?: number | null;
  h2Ml?: number | null;
  noMl?: number | null;
  gasoMl?: number | null;
  o2Ml?: number | null;
}

interface ActualFields {
  ifaMgActual?: number | null;
  hhoMlActual?: number | null;
  h2MlActual?: number | null;
  noMlActual?: number | null;
  gasoMlActual?: number | null;
  o2MlActual?: number | null;
}

/**
 * Tentukan apakah ada deviasi antara nilai aktual dan rencana.
 * Hanya membandingkan field yang diisi (tidak undefined/null).
 */
export function hasDeviationFrom(
  actual: ActualFields,
  plan: DosisFields | null | undefined
): boolean {
  if (!plan) return false;

  const pairs: [number | null | undefined, number | null | undefined][] = [
    [actual.ifaMgActual,   plan.ifaMg],
    [actual.hhoMlActual,   plan.hhoMl],
    [actual.h2MlActual,    plan.h2Ml],
    [actual.noMlActual,    plan.noMl],
    [actual.gasoMlActual,  plan.gasoMl],
    [actual.o2MlActual,    plan.o2Ml],
  ];

  return pairs.some(
    ([a, p]) =>
      a !== undefined && a !== null &&
      p !== undefined && p !== null &&
      a !== p
  );
}

interface Props {
  hasDeviation: boolean;
  deviationNoteValue: string;
}

/**
 * DeviationAlert — Muncul otomatis jika nilai aktual berbeda dari rencana.
 * Mengingatkan perawat bahwa kolom `deviationNote` WAJIB diisi.
 */
export function DeviationAlert({ hasDeviation, deviationNoteValue }: Props) {
  if (!hasDeviation) return null;

  const noteIsFilled = deviationNoteValue.trim().length > 0;

  return (
    <div
      className={`rounded-lg border p-4 flex items-start gap-3 transition-colors ${
        noteIsFilled
          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
      }`}
    >
      <AlertTriangle
        className={`h-4 w-4 mt-0.5 shrink-0 ${
          noteIsFilled
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      />
      <div className="space-y-0.5">
        <p
          className={`text-sm font-medium ${
            noteIsFilled
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {noteIsFilled
            ? 'Deviasi tercatat — catatan tersimpan'
            : 'Deviasi Terdeteksi — Catatan Wajib Diisi'}
        </p>
        <p
          className={`text-xs ${
            noteIsFilled
              ? 'text-amber-600 dark:text-amber-500'
              : 'text-red-600 dark:text-red-500'
          }`}
        >
          {noteIsFilled
            ? 'Catatan deviasi sudah diisi. Pastikan alasan sudah cukup jelas.'
            : 'Satu atau lebih nilai aktual berbeda dari rencana terapi dokter. Kolom "Catatan Deviasi" wajib diisi sebelum menyimpan.'}
        </p>
      </div>
    </div>
  );
}
