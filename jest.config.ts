import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // 提供 Next.js app 的路径以加载 next.config.js 和 .env 文件
  dir: "./",
});

// 添加任何自定义配置到下面的配置对象
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // 添加更多设置选项
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
};

// createJestConfig 被导出以这种方式使用，以确保 next/jest 可以加载 Next.js 配置
export default createJestConfig(config);

