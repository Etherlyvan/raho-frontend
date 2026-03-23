import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm }   from "@/components/modules/user/UserForm";

export default function NewUserPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Tambah Staff Baru"
        description="Buat akun staff baru untuk klinik RAHO"
      />
      <UserForm mode="create" basePath="/masteradmin" />
    </div>
  );
}
