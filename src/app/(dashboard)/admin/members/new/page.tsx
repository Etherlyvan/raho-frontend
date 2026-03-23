import { PageHeader }  from "@/components/shared/PageHeader";
import { MemberForm }  from "@/components/modules/member/MemberForm";
import { RoleGuard }   from "@/components/layout/RoleGuard";

export default function NewMemberPage() {
  return (
    <RoleGuard roles={["ADMIN", "MASTER_ADMIN"]}>
      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Daftarkan Pasien Baru"
          description="Isi data lengkap pasien untuk pendaftaran"
        />
        <MemberForm mode="create" />
      </div>
    </RoleGuard>
  );
}
