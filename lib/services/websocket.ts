import {
  WebSocketStatus,
  type WebSocketMessage,
  type WebSocketMessageType,
} from "@/types/websocket";

/**
 * WebSocket服务工具类
 * 提供WebSocket相关的工具函数
 */
export class WebSocketService {
  /**
   * 检查连接状态是否有效
   * @param status - 连接状态
   * @returns 是否为有效连接状态
   */
  static isConnectionActive(status: WebSocketStatus): boolean {
    return status === WebSocketStatus.OPEN || status === WebSocketStatus.CONNECTING;
  }

  /**
   * 创建WebSocket消息
   * @param data - 消息数据
   * @param type - 消息类型
   * @returns WebSocket消息对象
   */
  static createMessage<T>(data: T, type: WebSocketMessageType = "json"): WebSocketMessage<T> {
    return {
      type,
      data,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
  }

  /**
   * 序列化WebSocket消息
   * @param message - WebSocket消息对象
   * @returns 序列化后的字符串
   */
  static serializeMessage<T>(message: WebSocketMessage<T>): string {
    return JSON.stringify(message);
  }

  /**
   * 反序列化WebSocket消息
   * @param data - 序列化的消息字符串
   * @returns WebSocket消息对象
   */
  static deserializeMessage<T>(data: string): WebSocketMessage<T> {
    return JSON.parse(data) as WebSocketMessage<T>;
  }

  /**
   * 验证消息格式
   * @param message - WebSocket消息对象
   * @returns 是否为有效消息
   */
  static isValidMessage(message: unknown): message is WebSocketMessage {
    return (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      "data" in message
    );
  }
}

