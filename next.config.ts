import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 生产环境禁用 console
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
};

export default nextConfig;
