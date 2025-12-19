"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  WebSocketStatus,
  type WebSocketClientConfig,
  type WebSocketConnectionInfo,
  type WebSocketMessage,
  type QueuedMessage,
} from "@/types/websocket";

/**
 * WebSocket客户端Hook
 * 提供WebSocket的连接管理、消息发送接收、心跳机制和自动重连
 *
 * @param config - WebSocket客户端配置
 * @returns WebSocket连接状态和控制方法
 */
export function useWebSocket<T = unknown>(
  config: WebSocketClientConfig
): {
  connectionInfo: WebSocketConnectionInfo;
  send: (data: T) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
} {
  const [connectionInfo, setConnectionInfo] = useState<WebSocketConnectionInfo>({
    status: WebSocketStatus.CLOSED,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const reconnectAttemptsRef = useRef(0);

  const maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
  const reconnectInterval = config.reconnectInterval ?? 3000;
  const heartbeatInterval = config.heartbeatInterval ?? 30000;
  const heartbeatMessage = config.heartbeatMessage ?? JSON.stringify({ type: "ping" });

  /**
   * 清理资源
   */
  const cleanup = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  /**
   * 启动心跳机制
   */
  const startHeartbeat = useCallback((): void => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(heartbeatMessage);
        } catch (error) {
          console.error("Failed to send heartbeat:", error);
        }
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, heartbeatMessage]);

  /**
   * 处理消息队列
   */
  const processMessageQueue = useCallback((): void => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    const queue = messageQueueRef.current;
    while (queue.length > 0) {
      const queued = queue[0];
      try {
        const message: WebSocketMessage<T> = {
          type: "json",
          data: queued.message.data as T,
          timestamp: Date.now(),
        };
        wsRef.current.send(JSON.stringify(message));
        queue.shift();
      } catch (error) {
        queued.retries += 1;
        if (queued.retries >= 3) {
          queue.shift();
          console.error("Failed to send message after 3 retries:", queued.message);
        }
        break;
      }
    }
  }, []);

  /**
   * 连接WebSocket服务器
   */
  const connect = useCallback((): void => {
    // 如果已经连接，先断开
    if (wsRef.current) {
      disconnect();
    }

    try {
      setConnectionInfo((prev) => ({
        ...prev,
        status: WebSocketStatus.CONNECTING,
      }));

      const ws = new WebSocket(config.url, config.protocols);

      // 连接打开
      ws.onopen = (): void => {
        reconnectAttemptsRef.current = 0;
        setConnectionInfo({
          status: WebSocketStatus.OPEN,
          reconnectAttempts: 0,
        });
        startHeartbeat();
        processMessageQueue();
        config.onOpen?.();
      };

      // 接收消息
      ws.onmessage = (event: MessageEvent): void => {
        setConnectionInfo((prev) => ({
          ...prev,
          lastMessageTime: Date.now(),
        }));

        try {
          const message: WebSocketMessage<T> = JSON.parse(event.data);
          config.onMessage?.(message.data);
        } catch (error) {
          // 如果不是JSON，直接作为文本处理
          config.onMessage?.(event.data as T);
        }
      };

      // 处理错误
      ws.onerror = (error: Event): void => {
        const errorObj = new Error("WebSocket connection error");
        setConnectionInfo((prev) => ({
          ...prev,
          status: WebSocketStatus.ERROR,
          lastError: errorObj,
        }));
        config.onError?.(errorObj);
      };

      // 连接关闭
      ws.onclose = (event: CloseEvent): void => {
        setConnectionInfo((prev) => ({
          ...prev,
          status: WebSocketStatus.CLOSED,
        }));

        config.onClose?.(event);

        // 如果不是主动关闭，尝试重连
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setConnectionInfo((prev) => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          config.onReconnect?.(reconnectAttemptsRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Failed to create WebSocket connection");
      setConnectionInfo({
        status: WebSocketStatus.ERROR,
        reconnectAttempts: reconnectAttemptsRef.current,
        lastError: errorObj,
      });
      config.onError?.(errorObj);
    }
  }, [config, maxReconnectAttempts, reconnectInterval, startHeartbeat, processMessageQueue]);

  /**
   * 发送消息
   */
  const send = useCallback(
    (data: T): void => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          const message: WebSocketMessage<T> = {
            type: "json",
            data,
            timestamp: Date.now(),
          };
          wsRef.current.send(JSON.stringify(message));
        } catch (error) {
          console.error("Failed to send message:", error);
          // 如果发送失败，加入队列
          messageQueueRef.current.push({
            message: { type: "json", data },
            timestamp: Date.now(),
            retries: 0,
          });
        }
      } else {
        // 如果未连接，加入队列
        messageQueueRef.current.push({
          message: { type: "json", data },
          timestamp: Date.now(),
          retries: 0,
        });
        // 尝试连接
        if (connectionInfo.status === WebSocketStatus.CLOSED) {
          connect();
        }
      }
    },
    [connect, connectionInfo.status]
  );

  /**
   * 断开WebSocket连接
   */
  const disconnect = useCallback((): void => {
    cleanup();
    setConnectionInfo({
      status: WebSocketStatus.CLOSED,
      reconnectAttempts: 0,
    });
  }, [cleanup]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionInfo,
    send,
    connect,
    disconnect,
    isConnected: connectionInfo.status === WebSocketStatus.OPEN,
  };
}

