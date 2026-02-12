import { Server } from "@hocuspocus/server";

/**
 * Hocuspocus 协作服务器
 *
 * 使用 Hocuspocus 替代 y-websocket，提供更现代、更强大的协同功能。
 * Hocuspocus 默认支持 WebSocket，并且对 TypeScript 支持更好。
 *
 * 启动方式：
 *   pnpm run server:collaboration
 *   或
 *   tsx server/collaboration-server.ts
 */

const PORT = process.env.COLLABORATION_PORT
  ? parseInt(process.env.COLLABORATION_PORT)
  : 3001;
const HOST = process.env.COLLABORATION_HOST || "0.0.0.0"; // Hocuspocus 默认建议监听 0.0.0.0 以便外部访问

// 创建 Hocuspocus 服务器实例
const server = new Server({
  port: PORT,
  address: HOST,
  name: "Nexus Studio Collaboration", // 服务器名称

  // 连接钩子
  async onConnect(data) {
    console.log(`🔗 新连接: ${data.documentName}`);
  },

  // 加载文档钩子
  async onLoadDocument(data) {
    console.log(`📄 加载文档: ${data.documentName}`);
    return data.document;
  },

  // 断开连接钩子
  async onDisconnect(data) {
    console.log(`🔌 断开连接: ${data.documentName}`);
  },

  // 错误处理
  // async onUpgrade(data) {
  //   console.log("WebSocket Upgrade request");
  // },
});

// 启动服务器
server.listen().then(() => {
  console.log(`🚀 Hocuspocus 协作服务器启动在 ws://${HOST}:${PORT}`);
  console.log(
    `   访问 http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT} 进行健康检查`
  );
});

// 优雅关闭
const cleanup = async () => {
  console.log("\n🛑 正在关闭服务器...");
  await server.destroy();
  console.log("✅ 服务器已关闭");
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
