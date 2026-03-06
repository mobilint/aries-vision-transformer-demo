import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
