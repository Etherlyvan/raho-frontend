import { PageHeader } from "@/components/shared/PageHeader";
import { DoctorDashboardCards } from "@/components/modules/doctor/DoctorDashboardCards";

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Dokter"
        description="Jadwal hari ini dan ringkasan klinis Anda"
      />
      <DoctorDashboardCards />
    </div>
  );
}
