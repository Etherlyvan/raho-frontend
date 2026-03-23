"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Pencil, Power } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button }       from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton }     from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader }         from "@/components/shared/PageHeader";
import { ConfirmDialog }      from "@/components/shared/ConfirmDialog";
import { BranchStatusBadge }  from "@/components/modules/branch/BranchStatusBadge";
import { RoleBadge }          from "@/components/modules/user/RoleBadge";
import { ResetPasswordDialog } from "@/components/modules/user/ResetPasswordDialog";
import { UserForm }           from "@/components/modules/user/UserForm";
import { userApi }            from "@/lib/api/endpoints/users";
import { formatDate, getApiErrorMessage } from "@/lib/utils";

export default function SuperAdminUserDetailPage() {
  const { userId }    = useParams<{ userId: string }>();
  const router        = useRouter();
  const queryClient   = useQueryClient();

  const [showReset,  setShowReset]  = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [tab, setTab]               = useState<"detail" | "edit">("detail");

  // ── Data ──────────────────────────────────────────────────────────
  const { data: user, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn:  async () => (await userApi.detail(userId)).data.data,
  });

  // ── Toggle Active ─────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: () => userApi.toggleActive(userId),
    onSuccess: () => {
      toast.success("Status akun diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      setShowToggle(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  // ── Loading / Guard ───────────────────────────────────────────────
  if (isLoading) return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );

  if (!user) return null;

  const name     = user.profile?.fullName ?? user.email;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────── */}
      <PageHeader title={name} description={user.email}>
        <Button variant="outline" size="sm" onClick={router.back}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowReset(true)}>
          <KeyRound className="mr-2 h-4 w-4" /> Reset Password
        </Button>
        <Button
          variant={user.isActive ? "destructive" : "default"}
          size="sm"
          onClick={() => setShowToggle(true)}
        >
          <Power className="mr-2 h-4 w-4" />
          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      </PageHeader>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "detail" | "edit")}>
        <TabsList>
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="edit">
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detail */}
        <TabsContent value="detail" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Informasi Staff</CardTitle>
                <BranchStatusBadge isActive={user.isActive} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Avatar + nama + role */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-lg bg-slate-200 dark:bg-slate-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RoleBadge role={user.role.name} />
                    {user.staffCode && (
                      <span className="font-mono text-xs text-slate-500">{user.staffCode}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium mt-0.5 break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">No. Telepon</p>
                  <p className="font-medium mt-0.5">{user.profile?.phone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cabang</p>
                  <p className="font-medium mt-0.5">{user.branch?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Jenis Profesi</p>
                  <p className="font-medium mt-0.5">{user.profile?.jenisProfesi ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">No. STR</p>
                  <p className="font-medium mt-0.5">{user.profile?.strNumber ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Spesialisasi</p>
                  <p className="font-medium mt-0.5">{user.profile?.speciality ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Bergabung</p>
                  <p className="font-medium mt-0.5">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Edit */}
        <TabsContent value="edit" className="mt-4 max-w-2xl">
          <UserForm
            mode="edit"
            initialData={user}
            userId={userId}
            basePath="superadmin"
          />
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      <ResetPasswordDialog
        open={showReset}
        onOpenChange={setShowReset}
        userId={userId}
        userName={name}
      />

      <ConfirmDialog
        open={showToggle}
        onOpenChange={setShowToggle}
        title={user.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
        description={`Yakin ingin ${user.isActive ? "menonaktifkan" : "mengaktifkan"} akun ${name}?`}
        confirmLabel={user.isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={user.isActive ? "destructive" : "default"}
        onConfirm={() => toggleMutation.mutate()}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
