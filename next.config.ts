import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/japan-visa-enroll-helper",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
