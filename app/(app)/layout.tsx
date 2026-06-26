import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getContratos } from "@/app/_data/contratos-db";
import { alertasDaCarteira } from "@/lib/domain/alertas";
import { getProfile } from "@/lib/supabase/profile";
import { AppShell } from "../_components/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  // Locador não acessa a área da imobiliária — vai para o portal dele.
  if (profile?.papel === "locador") redirect("/cliente");

  const alertasCount = alertasDaCarteira(await getContratos(), new Date()).length;
  return <AppShell alertasCount={alertasCount}>{children}</AppShell>;
}
