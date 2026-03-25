'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Error boundary granular untuk segmen /dashboard/patient.
 * Menampilkan pesan ramah dengan opsi reset atau kembali ke dashboard.
 *
 * Next.js App Router memanggil komponen ini saat terjadi runtime error
 * di dalam segment ini. Tidak mempengaruhi segmen lain.
 */

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PatientError({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Log error ke monitoring (e.g., Sentry) di production
    if (process.env.NODE_ENV === 'production') {
      console.error('[PatientError]', error.message, error.digest);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md border-red-100 dark:border-red-900">
        <CardContent className="pt-8 pb-7 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="rounded-full p-4 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>

          {/* Pesan */}
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Terjadi Kesalahan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Halaman ini tidak dapat dimuat saat ini. Coba muat ulang atau kembali
              ke dashboard.
            </p>
            {/* Tampilkan digest error di development untuk debugging */}
            {process.env.NODE_ENV !== 'production' && error.digest && (
              <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mt-2">
                digest: {error.digest}
              </p>
            )}
          </div>

          {/* Aksi */}
          <div className="flex gap-3 w-full max-w-[280px]">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.push('/dashboard/patient/dashboard')}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button className="flex-1 gap-2" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
