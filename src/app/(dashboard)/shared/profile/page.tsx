import type { Metadata } from "next";
import { ProfileForm }        from "./_components/ProfileForm";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { PageHeader }         from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Profil Saya — RAHO" };

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profil Saya" description="Kelola informasi akun dan keamanan Anda" />
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Data Profil</TabsTrigger>
          <TabsTrigger value="password">Ubah Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
