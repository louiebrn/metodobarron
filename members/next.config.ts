import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/afiliados.html", destination: "/afiliados", permanent: true },
      { source: "/obrigado.html", destination: "/obrigado", permanent: true },
      { source: "/privacidade.html", destination: "/privacidade", permanent: true },
      { source: "/termos.html", destination: "/termos", permanent: true },
    ];
  },
};

export default nextConfig;
