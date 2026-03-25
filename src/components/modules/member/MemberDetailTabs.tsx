'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MemberForm }         from '@/components/modules/member/MemberForm';
import { PackageCard }        from '@/components/modules/package/PackageCard';
import { AssignPackageForm }  from '@/components/modules/package/AssignPackageForm';
import { DocumentList }       from '@/components/modules/document/DocumentList';
import { DocumentUploadForm } from '@/components/modules/document/DocumentUploadForm';
import { BranchAccessList }   from '@/components/modules/branch-access/BranchAccessList';
import { GrantAccessForm }    from '@/components/modules/branch-access/GrantAccessForm';
import { memberPackageApi }   from '@/lib/api/endpoints/memberPackages';
import { memberDocumentApi }  from '@/lib/api/endpoints/memberDocuments';
import { branchAccessApi }    from '@/lib/api/endpoints/branchAccess';
import { memberApi }          from '@/lib/api/endpoints/members';
import { formatDate, getApiErrorMessage } from '@/lib/utils';
import type { Member, MemberPackage } from '@/types';

type TabKey = 'info' | 'packages' | 'documents' | 'branch-access' | 'emr';

interface Props {
  member: Member;
}

export function MemberDetailTabs({ member }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const queryClient  = useQueryClient();

  const currentTab = (searchParams.get('tab') as TabKey) ?? 'info';
  const [showAssign, setShowAssign] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editMode,   setEditMode]   = useState(false);

  function setTab(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  // ✅ Explicit type <MemberPackage[]> agar tidak salah infer dari return
  //    memberPackageApi.list() jika generic-nya keliru di endpoint file
  const { data: packages, isLoading: pkgLoading } = useQuery<MemberPackage[]>({
    queryKey: ['packages', member.memberId],
    queryFn: async () => {
      const res = await memberPackageApi.list(member.memberId);
      // res.data.data: normalnya MemberPackage[] — cast menjaga kontrak
      return res.data.data as unknown as MemberPackage[];
    },
    enabled: currentTab === 'packages',
  });

  const { data: documents, isLoading: docLoading } = useQuery({
    queryKey: ['documents', member.memberId],
    queryFn: async () =>
      (await memberDocumentApi.list(member.memberId)).data.data,
    enabled: currentTab === 'documents',
  });

  const { data: accesses, isLoading: baLoading } = useQuery({
    queryKey: ['branch-access', member.memberId],
    queryFn: async () =>
      (await branchAccessApi.listByMember(member.memberId)).data.data,
    enabled: currentTab === 'branch-access',
  });

  const { data: emr, isLoading: emrLoading } = useQuery({
    queryKey: ['emr', member.memberId],
    queryFn: async () =>
      (await memberApi.emr(member.memberId)).data.data,
    enabled: currentTab === 'emr',
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Tabs
      value={currentTab}
      onValueChange={(v) => setTab(v as TabKey)}
    >
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="packages">Paket</TabsTrigger>
        <TabsTrigger value="documents">Dokumen</TabsTrigger>
        <TabsTrigger value="branch-access">Akses Cabang</TabsTrigger>
        <TabsTrigger value="emr">EMR</TabsTrigger>
      </TabsList>

      {/* ── Tab 1: Info ────────────────────────────────────────────────────── */}
      <TabsContent value="info" className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
            <Pencil className="mr-2 h-3 w-3" />
            {editMode ? 'Batal Edit' : 'Edit Data'}
          </Button>
        </div>

        {editMode && (
          <MemberForm
            mode="edit"
            initialData={member}
            memberId={member.memberId}
            onSuccess={() => {
              setEditMode(false);
              queryClient.invalidateQueries({ queryKey: ['members', member.memberId] });
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identitas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Identitas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'No. Pasien',    value: member.memberNo },
                { label: 'NIK',           value: member.nik ?? '-' },
                { label: 'Nama',          value: member.fullName },
                { label: 'Tgl Lahir',     value: member.dateOfBirth ? formatDate(member.dateOfBirth) : '-' },
                { label: 'Tempat Lahir',  value: member.tempatLahir ?? '-' },
                { label: 'Jenis Kelamin', value: member.jenisKelamin === 'L' ? 'Laki-laki' : member.jenisKelamin === 'P' ? 'Perempuan' : '-' },
                { label: 'Status Nikah',  value: member.statusNikah ?? '-' },
                { label: 'Pekerjaan',     value: member.pekerjaan ?? '-' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-medium mt-0.5 text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kontak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Kontak &amp; Alamat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Telepon</p>
                <p className="font-medium mt-0.5">{member.phone ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium mt-0.5">{member.email ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Alamat</p>
                <p className="font-medium mt-0.5 text-sm leading-relaxed">{member.address ?? '-'}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 mb-2">Kontak Darurat</p>
                <p className="font-medium">{member.emergencyContact ?? '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Medis */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informasi Medis</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Riwayat Penyakit</p>
                <p className="mt-0.5 leading-relaxed">
                  {member.medicalHistory
                    ? typeof member.medicalHistory === 'string'
                      ? member.medicalHistory
                      : JSON.stringify(member.medicalHistory)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Sumber Info RAHO</p>
                <p className="mt-0.5">{member.sumberInfoRaho ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Consent Foto</p>
                <Badge
                  variant="outline"
                  className={
                    member.isConsentToPhoto
                      ? 'border-emerald-200 text-emerald-700 mt-1'
                      : 'border-slate-200 text-slate-500 mt-1'
                  }
                >
                  {member.isConsentToPhoto ? 'Setuju' : 'Tidak Setuju'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cabang Daftar</p>
                <p className="font-medium mt-0.5">
                  {member.registrationBranch.name} — {member.registrationBranch.city}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Tab 2: Packages ────────────────────────────────────────────────── */}
      <TabsContent value="packages" className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Dialog open={showAssign} onOpenChange={setShowAssign}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Assign Paket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Paket Baru</DialogTitle>
              </DialogHeader>
              <AssignPackageForm
                memberId={member.memberId}
                onSuccess={() => setShowAssign(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {pkgLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : !packages?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-slate-500">Belum ada paket</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ✅ packages bertipe MemberPackage[] — pkg bertipe MemberPackage */}
            {packages.map((pkg: MemberPackage) => (
              <PackageCard
                key={pkg.memberPackageId}
                pkg={pkg}
                memberId={member.memberId}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Tab 3: Documents ───────────────────────────────────────────────── */}
      <TabsContent value="documents" className="mt-4 space-y-4">
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Upload Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Dokumen Pasien</DialogTitle>
            </DialogHeader>
            <DocumentUploadForm
              memberId={member.memberId}
              onSuccess={() => setShowUpload(false)}
            />
          </DialogContent>
        </Dialog>

        {docLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : (
          <DocumentList
            documents={documents ?? []}
            memberId={member.memberId}
          />
        )}
      </TabsContent>

      {/* ── Tab 4: Branch Access ───────────────────────────────────────────── */}
      <TabsContent value="branch-access" className="mt-4 space-y-4">
        <GrantAccessForm memberId={member.memberId} />

        {baLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <BranchAccessList
            accesses={accesses ?? []}
            memberId={member.memberId}
          />
        )}
      </TabsContent>

      {/* ── Tab 5: EMR (read-only) ─────────────────────────────────────────── */}
      <TabsContent value="emr" className="mt-4 space-y-4">
        {emrLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : !emr?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-slate-500">Belum ada catatan EMR</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emr.map((entry) => (
              <Card key={entry.encounterId} className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.type} — {formatDate(entry.encounterDate)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dr. {entry.doctor.fullName}
                      </p>
                    </div>
                    {entry.diagnosis && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.diagnosis}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {entry.sessions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Sesi ({entry.sessions.length})
                      </p>
                      <ul className="space-y-1">
                        {entry.sessions.map((s) => (
                          <li
                            key={s.sessionId}
                            className="text-xs text-slate-600 dark:text-slate-400 flex gap-2"
                          >
                            <span>{formatDate(s.sessionDate)}</span>
                            <span className="text-slate-400">·</span>
                            <span>{s.status}</span>
                            {s.notes && (
                              <>
                                <span className="text-slate-400">·</span>
                                <span className="italic">{s.notes}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.emrNotes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Catatan EMR
                      </p>
                      <ul className="space-y-2">
                        {entry.emrNotes.map((note) => (
                          <li
                            key={note.noteId}
                            className="rounded-md bg-slate-50 dark:bg-slate-800 p-3"
                          >
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span className="font-medium">{note.type}</span>
                              <span>{formatDate(note.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {note.content}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
