import { NextRequest } from "next/server";

/**
 * SSE API路由处理器
 * 提供Server-Sent Events流式数据传输
 */
export async function GET(request: NextRequest): Promise<Response> {
  // 创建ReadableStream用于SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // 发送初始连接消息
      const sendMessage = (data: unknown, event?: string, id?: string): void => {
        let message = "";
        if (id) message += `id: ${id}\n`;
        if (event) message += `event: ${event}\n`;
        message += `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 发送连接成功消息
      sendMessage({ status: "connected", timestamp: Date.now() }, "open");

      // 模拟定期发送数据（实际应用中应该根据业务逻辑发送）
      const interval = setInterval(() => {
        try {
          sendMessage(
            {
              message: "Heartbeat",
              timestamp: Date.now(),
            },
            "message",
            Date.now().toString()
          );
        } catch (error) {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      // 处理客户端断开连接
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  // 返回SSE响应
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // 禁用Nginx缓冲
    },
  });
}

