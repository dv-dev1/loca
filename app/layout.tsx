import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Corpo em Inter: neutra e altamente legível em texto corrido. A personalidade
// do "Editorial Arquitetural" segue nos títulos (Bricolage) e nos números (mono).
const body = Inter({
  variable: "--ff-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Locá — Gestão de locação para imobiliárias",
  description:
    "Organize toda a carteira de locação da sua imobiliária: contratos, reajustes, vencimentos e documentos num só lugar, com aviso antes de cada data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink font-body">{children}</body>
    </html>
  );
}
