import type { ReactNode } from "react";
import { CONTRATOS } from "@/app/_data/contratos";
import { alertasDaCarteira } from "@/lib/domain/alertas";
import { AppShell } from "../_components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  const alertasCount = alertasDaCarteira(CONTRATOS, new Date()).length;
  return <AppShell alertasCount={alertasCount}>{children}</AppShell>;
}
