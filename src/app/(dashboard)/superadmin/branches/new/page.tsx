import { PageHeader }  from "@/components/shared/PageHeader";
import { BranchForm }  from "@/components/modules/branch/BranchForm";
import { RoleGuard }   from "@/components/layout/RoleGuard";

export default function NewBranchPage() {
  return (
    <RoleGuard roles={["SUPER_ADMIN"]}>
      <div className="max-w-2xl space-y-6">
        <PageHeader
          title="Buat Cabang Baru"
          description="Tambahkan cabang klinik RAHO baru ke sistem"
        />
        <BranchForm mode="create" />
      </div>
    </RoleGuard>
  );
}
