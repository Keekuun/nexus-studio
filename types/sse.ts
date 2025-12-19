/**
 * SSE (Server-Sent Events) 相关类型定义
 */

/**
 * SSE事件类型
 */
export type SSEEventType = "message" | "error" | "close" | "open";

/**
 * SSE消息数据接口
 */
export interface SSEMessage<T = unknown> {
  id?: string;
  event?: string;
  data: T;
  retry?: number;
}

/**
 * SSE连接状态
 */
export enum SSEConnectionStatus {
  CONNECTING = "connecting",
  OPEN = "open",
  CLOSED = "closed",
  ERROR = "error",
}

/**
 * SSE客户端配置
 */
export interface SSEClientConfig {
  url: string;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  onOpen?: () => void;
  onMessage?: <T = unknown>(data: T) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * SSE连接信息
 */
export interface SSEConnectionInfo {
  status: SSEConnectionStatus;
  reconnectAttempts: number;
  lastError?: Error;
}

