'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Trash2, ZoomIn, X, Clock, User, ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { sessionPhotoApi } from '@/lib/api/endpoints/photos';
import { formatDateTime, getApiErrorMessage } from '@/lib/utils';
import type { SessionPhoto } from '@/types';

interface Props {
  sessionId:  string;
  photos:     SessionPhoto[];
  isLoading:  boolean;
  canDelete:  boolean;
}

export function PhotoGallery({
  sessionId, photos, isLoading, canDelete,
}: Props) {
  const queryClient                   = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<SessionPhoto | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<SessionPhoto | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) =>
      sessionPhotoApi.remove(sessionId, photoId),
    onSuccess: () => {
      toast.success('Foto berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['session-photos', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal menghapus foto')),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title="Belum ada foto"
        description="Belum ada foto yang diunggah untuk sesi ini."
      />
    );
  }

  return (
    <>
      {/* ── Summary ── */}
      <div className="flex items-center gap-2 pb-1">
        <span className="text-xs text-muted-foreground">
          {photos.length} foto tersimpan
        </span>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.sessionPhotoId}
            photo={photo}
            canDelete={canDelete}
            onZoom={() => setLightboxPhoto(photo)}
            onDelete={() => setDeleteTarget(photo)}
          />
        ))}
      </div>

      {/* ── Lightbox ── */}
      <Dialog
        open={!!lightboxPhoto}
        onOpenChange={(open) => !open && setLightboxPhoto(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-sm font-medium">
              {lightboxPhoto?.caption ?? lightboxPhoto?.fileName ?? 'Foto Sesi'}
            </DialogTitle>
            {lightboxPhoto?.takenAt && (
              <DialogDescription className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(lightboxPhoto.takenAt)}
                {lightboxPhoto.takenByUser.profile?.fullName && (
                  <>
                    {' · '}
                    <User className="h-3 w-3" />
                    {lightboxPhoto.takenByUser.profile.fullName}
                  </>
                )}
              </DialogDescription>
            )}
          </DialogHeader>
          {lightboxPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightboxPhoto.photoUrl}
              alt={lightboxPhoto.caption ?? lightboxPhoto.fileName}
              className="w-full max-h-[70vh] object-contain bg-slate-950"
            />
          )}
          {lightboxPhoto?.fileSizeBytes && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800">
              {lightboxPhoto.fileName} ·{' '}
              {(lightboxPhoto.fileSizeBytes / 1024).toFixed(1)} KB
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Foto Sesi"
        description={`Yakin ingin menghapus foto "${deleteTarget?.caption ?? deleteTarget?.fileName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Foto"
        variant="destructive"
        onConfirm={() =>
          deleteTarget &&
          deleteMutation.mutate(deleteTarget.sessionPhotoId)
        }
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

/* ─── Sub-komponen Card ─────────────────────────────────────────────────────── */

function PhotoCard({
  photo, canDelete, onZoom, onDelete,
}: {
  photo:     SessionPhoto;
  canDelete: boolean;
  onZoom:    () => void;
  onDelete:  () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 aspect-square">
      {imgError ? (
        <div className="flex h-full items-center justify-center">
          <ImageOff className="h-8 w-8 text-slate-300 dark:text-slate-700" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.photoUrl}
          alt={photo.caption ?? photo.fileName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay aksi — muncul saat hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
          onClick={onZoom}
          title="Perbesar"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-red-500/70 hover:bg-red-600/80 text-white backdrop-blur-sm"
            onClick={onDelete}
            title="Hapus foto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Caption overlay bawah */}
      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white truncate">{photo.caption}</p>
        </div>
      )}
    </div>
  );
}
