import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "Login — RAHO" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          RAHO
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Masuk ke sistem manajemen klinik
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
