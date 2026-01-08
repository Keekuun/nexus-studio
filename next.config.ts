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
  // Webpack 配置 - 修复 createFilename 错误和 canvas 模块问题
  webpack: (config, { isServer }) => {
    // 确保 webpack 配置正确
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };
    }
    // 忽略 canvas 模块（Node.js 原生模块，不能在浏览器中使用）
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }
    return config;
  },
  // 构建时忽略 ESLint（Vercel 构建场景存在大量第三方警告）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

