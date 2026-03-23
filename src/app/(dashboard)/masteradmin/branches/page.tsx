"use client";

// ✅ Reuse 100% logika superadmin, hanya ganti basePath & roles
import { useState }  from "react";
import { useQuery }  from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search }    from "lucide-react";
import { Input }     from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader }  from "@/components/shared/PageHeader";
import { Pagination }  from "@/components/shared/Pagination";
import { BranchTable } from "@/components/modules/branch/BranchTable";
import { branchApi }   from "@/lib/api/endpoints/branches";
import type { BranchType } from "@/types";

export default function MasterAdminBranchesPage() {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [tipe,   setTipe]   = useState<BranchType | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["branches", { page, tipe, role: "masteradmin" }],
    queryFn: async () => {
      const res = await branchApi.list({
        page, limit: 15,
        tipe: tipe !== "ALL" ? tipe : undefined,
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
      <PageHeader title="Manajemen Cabang" description="Kelola cabang klinik RAHO" />

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
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="KLINIK">Klinik</SelectItem>
            <SelectItem value="HOMECARE">Homecare</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* basePath "/masteradmin" → tombol toggle tidak muncul (hasRole check di BranchTable) */}
      <BranchTable data={filtered} isLoading={isLoading} basePath="/masteradmin" />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  );
}
