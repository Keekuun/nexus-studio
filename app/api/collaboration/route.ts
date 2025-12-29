import { NextRequest } from 'next/server';

/**
 * 协同编辑 API 路由
 * 
 * 注意：Next.js App Router 不直接支持 WebSocket 升级
 * Hocuspocus 服务器需要作为独立服务器运行
 * 
 * 建议方案：
 * 1. 在单独的端口（如 3001）运行独立的 Hocuspocus 服务器
 * 2. 更新客户端连接 URL 为 ws://localhost:3001
 * 3. 或者使用 y-websocket 配合独立的 WebSocket 服务器
 */
export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: 'WebSocket upgrade not supported',
      message: 'Next.js App Router does not support WebSocket upgrades. Please use a standalone Hocuspocus server.',
      suggestion: 'Run Hocuspocus as a standalone server on a different port (e.g., 3001) and update the client URL accordingly.',
      example: {
        server: 'ws://localhost:3001',
        client: 'Update CollaborativeEditor.tsx to use ws://localhost:3001/api/collaboration',
      },
    }),
    {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// 处理 POST 请求
export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: 'WebSocket upgrade not supported',
      message: 'Next.js App Router does not support WebSocket upgrades. Please use a standalone Hocuspocus server.',
    }),
    {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

