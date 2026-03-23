"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader }   from "@/components/shared/PageHeader";
import { Pagination }   from "@/components/shared/Pagination";
import { BranchTable }  from "@/components/modules/branch/BranchTable";
import { branchApi }    from "@/lib/api/endpoints/branches";
import type { BranchType } from "@/types";

export default function SuperAdminBranchesPage() {
  const router = useRouter();
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [tipe,   setTipe]   = useState<BranchType | "ALL">("ALL");
  const [status, setStatus] = useState<"ALL" | "true" | "false">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["branches", { page, tipe, status }],
    queryFn: async () => {
      const res = await branchApi.list({
        page,
        limit:    15,
        tipe:     tipe    !== "ALL" ? tipe    : undefined,
        isActive: status  !== "ALL" ? status === "true" : undefined,
      });
      return res.data;
    },
  });

  const filtered = (data?.data ?? []).filter((b) =>
    search === "" ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Cabang"
        description="Kelola seluruh cabang klinik RAHO"
      >
        <Button onClick={() => router.push("/superadmin/branches/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Cabang
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tipe} onValueChange={(v) => { setTipe(v as BranchType | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="KLINIK">Klinik</SelectItem>
            <SelectItem value="HOMECARE">Homecare</SelectItem>
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

      <BranchTable data={filtered} isLoading={isLoading} basePath="/superadmin" />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}
