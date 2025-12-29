/**
 * Yjs WebSocket 协同服务器
 * 
 * 这是一个独立的 WebSocket 服务器，用于处理 Yjs 文档的实时协同编辑
 * 使用 y-websocket 库来处理 WebSocket 连接和文档同步
 * 
 * 启动方式：
 *   pnpm run server:collaboration
 *   或
 *   tsx server/collaboration-server.ts
 */

import { WebSocketServer } from 'ws';
// y-websocket 的 setupWSConnection 函数
// 注意：y-websocket 3.x 版本中，setupWSConnection 的导入路径可能不同
// 如果导入失败，可以尝试直接从 'y-websocket' 导入
let setupWSConnection: any;

try {
  // 尝试从 bin/utils 导入
  setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
} catch {
  // 如果失败，尝试从主包导入
  try {
    setupWSConnection = require('y-websocket').setupWSConnection;
  } catch {
    console.error('无法导入 setupWSConnection，请检查 y-websocket 版本');
    process.exit(1);
  }
}

const PORT = process.env.COLLABORATION_PORT ? parseInt(process.env.COLLABORATION_PORT) : 3001;
const HOST = process.env.COLLABORATION_HOST || 'localhost';

// 创建 WebSocket 服务器
const wss = new WebSocketServer({
  port: PORT,
  host: HOST,
});

console.log(`🚀 Yjs WebSocket 协同服务器启动在 ws://${HOST}:${PORT}`);

// 处理 WebSocket 连接
// y-websocket 的 setupWSConnection 会自动处理文档的创建和同步
wss.on('connection', (ws, request) => {
  const url = new URL(request.url || '/', `http://${HOST}:${PORT}`);
  const roomName = url.pathname.slice(1) || 'default'; // 从路径获取房间名

  console.log(`📝 新连接: ${roomName} (${request.socket.remoteAddress || 'unknown'})`);

  // setupWSConnection 会自动处理 Y.Doc 的创建和同步
  // 它会根据房间名自动管理文档
  setupWSConnection(ws, request, {
    // 可选配置
    gc: true, // 启用垃圾回收
  });

  // 监听连接关闭
  ws.on('close', () => {
    console.log(`🔌 连接关闭: ${roomName}`);
  });

  // 监听错误
  ws.on('error', (error) => {
    console.error(`❌ WebSocket 错误 (${roomName}):`, error);
  });
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  wss.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...');
  wss.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

// 错误处理
wss.on('error', (error) => {
  console.error('❌ WebSocket 服务器错误:', error);
});

