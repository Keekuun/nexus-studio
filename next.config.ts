import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 性能优化配置
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  // 压缩配置
  compress: true,
  // 生产环境优化
  productionBrowserSourceMaps: false,
  // 实验性功能
  experimental: {
    optimizePackageImports: ["@tiptap/react", "@tiptap/starter-kit"],
  },
};

export default nextConfig;

