"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberLookupInput } from "@/components/modules/member/MemberLookupInput";
import { branchAccessApi }   from "@/lib/api/endpoints/branchAccess";
import { getApiErrorMessage } from "@/lib/utils";
import type { MemberLookupResult } from "@/types";

interface Props {
  memberId: string;   // untuk invalidate query setelah grant
}

export function GrantAccessForm({ memberId }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<MemberLookupResult | null>(null);

  const mutation = useMutation({
    // POST /branch-access { memberNo }
    mutationFn: () => branchAccessApi.grant({ memberNo: selected!.memberNo }),
    onSuccess: () => {
      toast.success("Akses cabang berhasil diberikan");
      queryClient.invalidateQueries({ queryKey: ["branch-access", memberId] });
      setSelected(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal memberikan akses")),
  });

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Grant Akses Cabang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <MemberLookupInput
          onSelect={(m) => setSelected(m)}
          placeholder="Cari kode akun pasien..."
        />
        <Button
          type="button"
          disabled={!selected || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="w-full"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {mutation.isPending ? "Memproses..." : "Grant Akses Cabang Ini"}
        </Button>
      </CardContent>
    </Card>
  );
}
