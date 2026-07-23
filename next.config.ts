import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "paqtohmxagfebeyyurlq.supabase.co" },
      { protocol: "https", hostname: "static.gorfactory.es" },
    ],
    // Los logos de marca (GOR FACTORY y partners) se sirven como .svg/.png desde CDNs
    // corporativos de confianza — necesario para que next/image los optimice.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
