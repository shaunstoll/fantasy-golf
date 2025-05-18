import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "datagolf.com",
        pathname: "/static/flags/**",
      },
    ],
  },
};

export default nextConfig;
