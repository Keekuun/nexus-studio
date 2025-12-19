/**
 * WebSocket 相关类型定义
 */

/**
 * WebSocket连接状态
 */
export enum WebSocketStatus {
  CONNECTING = "connecting",
  OPEN = "open",
  CLOSING = "closing",
  CLOSED = "closed",
  ERROR = "error",
}

/**
 * WebSocket消息类型
 */
export type WebSocketMessageType = "text" | "json" | "binary";

/**
 * WebSocket消息接口
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp?: number;
  id?: string;
}

/**
 * WebSocket客户端配置
 */
export interface WebSocketClientConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
  onOpen?: () => void;
  onMessage?: <T = unknown>(data: T) => void;
  onError?: (error: Error) => void;
  onClose?: (event: CloseEvent) => void;
  onReconnect?: (attempt: number) => void;
}

/**
 * WebSocket连接信息
 */
export interface WebSocketConnectionInfo {
  status: WebSocketStatus;
  reconnectAttempts: number;
  lastError?: Error;
  lastMessageTime?: number;
}

/**
 * WebSocket消息队列项
 */
export interface QueuedMessage {
  message: WebSocketMessage;
  timestamp: number;
  retries: number;
}

