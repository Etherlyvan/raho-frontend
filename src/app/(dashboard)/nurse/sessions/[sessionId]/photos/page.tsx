'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PhotoUploadForm } from '@/components/modules/nurse/photo/PhotoUploadForm';
import { PhotoGallery } from '@/components/modules/nurse/photo/PhotoGallery';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import { sessionPhotoApi } from '@/lib/api/endpoints/photos';
import type { TreatmentSessionDetail, SessionPhoto } from '@/types';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionPhotosPage({ params }: PageProps) {
  const { sessionId } = use(params);

  /* ── Fetch Detail Sesi (butuh isConsentToPhoto dan status) ── */
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data as TreatmentSessionDetail;
    },
  });

  /* ── Fetch Foto ── */
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['session-photos', sessionId],
    queryFn: async () => {
      const res = await sessionPhotoApi.list(sessionId);
      return res.data.data as SessionPhoto[];
    },
  });

  const isLoading   = sessionLoading || photosLoading;
  const isInProgress      = session?.status === 'IN_PROGRESS';
  const isConsentToPhoto  = session?.encounter.member.isConsentToPhoto ?? false;
  const patientName       = session?.encounter.member.fullName ?? '...';

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/nurse/sessions/${sessionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title="Foto Sesi"
            description={`Sesi ${patientName} — dokumentasi kondisi sebelum dan sesudah tindakan`}
          />
        </div>

        {/* ── Form Upload — hanya saat INPROGRESS ── */}
        {sessionLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : isInProgress ? (
          /* Komponen sendiri yang handle blokir jika consent false */
          <PhotoUploadForm
            sessionId={sessionId}
            isConsentToPhoto={isConsentToPhoto}
          />
        ) : (
          session && (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {session.status === 'COMPLETED'
                  ? 'Sesi telah selesai — foto hanya dapat dilihat.'
                  : 'Upload foto hanya tersedia saat sesi berstatus INPROGRESS.'}
              </p>
            </div>
          )
        )}

        {/* ── Galeri ── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Galeri Foto
          </h3>
          <PhotoGallery
            sessionId={sessionId}
            photos={photos}
            isLoading={isLoading}
            canDelete={isInProgress}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
