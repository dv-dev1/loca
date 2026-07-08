import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (extração de texto de PDF) roda só no server e traz seu próprio
  // pdf.js — deixa o Next requerê-lo em runtime em vez de empacotá-lo.
  serverExternalPackages: ["pdf-parse"],
  // Libera recursos de dev (HMR) quando acessados por um túnel — senão o Next
  // bloqueia como cross-origin e o client bundle não conecta direito.
  allowedDevOrigins: ["*.trycloudflare.com", "*.cfargotunnel.com", "*.ngrok-free.app"],
  experimental: {
    // Libera as Server Actions quando acessadas por um túnel (Cloudflare/ngrok)
    // ou outra origem além de localhost — senão o Next bloqueia por CSRF.
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "*.cfargotunnel.com", "*.ngrok-free.app", "localhost:3000"],
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
