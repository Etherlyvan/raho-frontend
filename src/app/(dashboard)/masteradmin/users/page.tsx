"use client";

import { useState }    from "react";
import { useQuery }    from "@tanstack/react-query";
import { useRouter }   from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { UserTable }  from "@/components/modules/user/UserTable";
import { userApi }    from "@/lib/api/endpoints/users";
import { branchApi }  from "@/lib/api/endpoints/branches";
import type { RoleName } from "@/types";

const ROLE_OPTIONS: { label: string; value: RoleName | "ALL" }[] = [
  { label: "Semua Role",   value: "ALL" },
  { label: "Master Admin", value: "MASTER_ADMIN" },
  { label: "Admin",        value: "ADMIN" },
  { label: "Dokter",       value: "DOCTOR" },
  { label: "Perawat",      value: "NURSE" },
];

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [role,     setRole]     = useState<RoleName | "ALL">("ALL");
  const [branchId, setBranchId] = useState<string | "ALL">("ALL");
  const [status,   setStatus]   = useState<"ALL" | "true" | "false">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, role, branchId, status, scope: "masteradmin" }],
    queryFn: async () => {
      const res = await userApi.list({
        page,
        limit:    15,
        role:     role     !== "ALL" ? role     : undefined,
        branchId: branchId !== "ALL" ? branchId : undefined,
        isActive: status   !== "ALL" ? status === "true" : undefined,
      });
      return res.data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ["branches", "all"],
    queryFn:  async () => (await branchApi.list({ limit: 100 })).data.data,
  });

  const filtered = (data?.data ?? []).filter((u) =>
    search === "" ||
    (u.profile?.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.staffCode ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Staff"
        description="Kelola akun seluruh staff RAHO"
      >
        <Button onClick={() => router.push("/masteradmin/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Staff
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama, email, atau kode staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as RoleName | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={branchId} onValueChange={(v) => { setBranchId(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Cabang</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.branchId} value={b.branchId}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UserTable data={filtered} isLoading={isLoading} basePath="/superadmin" />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}
