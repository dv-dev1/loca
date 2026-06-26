import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
