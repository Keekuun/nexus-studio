import { SSEConnectionStatus, type SSEMessage } from "@/types/sse";

/**
 * SSE服务工具类
 * 提供SSE相关的工具函数
 */
export class SSEService {
  /**
   * 解析SSE消息格式
   * @param rawMessage - 原始SSE消息字符串
   * @returns 解析后的SSE消息对象
   */
  static parseMessage(rawMessage: string): SSEMessage {
    const lines = rawMessage.split("\n");
    const message: SSEMessage = { data: null };

    for (const line of lines) {
      if (line.startsWith("id:")) {
        message.id = line.substring(3).trim();
      } else if (line.startsWith("event:")) {
        message.event = line.substring(6).trim();
      } else if (line.startsWith("data:")) {
        const dataStr = line.substring(5).trim();
        try {
          message.data = JSON.parse(dataStr);
        } catch {
          message.data = dataStr;
        }
      } else if (line.startsWith("retry:")) {
        message.retry = parseInt(line.substring(6).trim(), 10);
      }
    }

    return message;
  }

  /**
   * 格式化SSE消息
   * @param message - SSE消息对象
   * @returns 格式化后的SSE消息字符串
   */
  static formatMessage(message: SSEMessage): string {
    let formatted = "";
    if (message.id) formatted += `id: ${message.id}\n`;
    if (message.event) formatted += `event: ${message.event}\n`;
    formatted += `data: ${JSON.stringify(message.data)}\n`;
    if (message.retry) formatted += `retry: ${message.retry}\n`;
    formatted += "\n";
    return formatted;
  }

  /**
   * 检查连接状态是否有效
   * @param status - 连接状态
   * @returns 是否为有效连接状态
   */
  static isConnectionActive(status: SSEConnectionStatus): boolean {
    return status === SSEConnectionStatus.OPEN || status === SSEConnectionStatus.CONNECTING;
  }
}

