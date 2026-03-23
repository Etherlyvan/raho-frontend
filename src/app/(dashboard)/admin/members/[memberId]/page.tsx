"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MemberStatusBadge } from "@/components/modules/member/MemberStatusBadge";
import { MemberDetailTabs } from "@/components/modules/member/MemberDetailTabs";
import { memberApi } from "@/lib/api/endpoints/members";
import { formatDate, getApiErrorMessage } from "@/lib/utils";

export default function MemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showToggle, setShowToggle] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ["members", memberId],
    queryFn: async () => (await memberApi.detail(memberId)).data.data,
  });

  const toggleMutation = useMutation({
    mutationFn: () => memberApi.toggleActive(memberId),
    onSuccess: () => {
      toast.success("Status pasien berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      setShowToggle(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!member) return null;

  // ← member.fullName langsung, BUKAN member.profile.fullName
  const name = member.fullName;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  // ← isActive di-derive dari status, BUKAN member.isActive
  const isActive = member.status === "ACTIVE";

  return (
    <div className="space-y-6">

      {/* ─── Page Header ───────────────────────────────────────── */}
      <PageHeader
        title={name}
        // ← member.registrationBranch, BUKAN member.branch
        description={`${member.memberNo} · ${member.registrationBranch.name}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={router.back}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={() => setShowToggle(true)}
          >
            <Power className="mr-2 h-4 w-4" />
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        </div>
      </PageHeader>

      {/* ─── Header Pasien ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <Avatar className="h-14 w-14 shrink-0">
          {/* Member tidak punya avatarUrl, hanya pakai fallback */}
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{name}</p>
            <MemberStatusBadge status={member.status} />
            {member.isConsentToPhoto && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Consent OK</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {/* ← jenisKelamin "L"/"P", bukan "LAKILAKI"/"PEREMPUAN" */}
            {member.jenisKelamin === "L"
              ? "Laki-laki"
              : member.jenisKelamin === "P"
              ? "Perempuan"
              : ""}
            {/* ← dateOfBirth, bukan birthDate */}
            {member.dateOfBirth ? ` · ${member.dateOfBirth.slice(0, 4)}` : ""}
            {/* ← member.phone flat, bukan member.profile.phone */}
            {" · "}{member.phone ?? member.email ?? "-"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Terdaftar {formatDate(member.createdAt)} ·{" "}
            {/* ← registrationBranch, bukan branch */}
            {member.registrationBranch.name}, {member.registrationBranch.city}
          </p>
        </div>
      </div>

      {/* ─── Tabs ──────────────────────────────────────────────── */}
      <MemberDetailTabs member={member} />

      {/* ─── Confirm Toggle ────────────────────────────────────── */}
      <ConfirmDialog
        open={showToggle}
        onOpenChange={setShowToggle}
        title={isActive ? "Nonaktifkan Pasien" : "Aktifkan Pasien"}
        description={`Yakin ingin ${isActive ? "menonaktifkan" : "mengaktifkan"} pasien ${name}?`}
        confirmLabel={isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={isActive ? "destructive" : "default"}
        onConfirm={() => toggleMutation.mutate()}
        isLoading={toggleMutation.isPending}
      />

    </div>
  );
}
