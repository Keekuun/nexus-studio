"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  SSEConnectionStatus,
  type SSEClientConfig,
  type SSEConnectionInfo,
  type SSEMessage,
} from "@/types/sse";

/**
 * SSE客户端Hook
 * 提供Server-Sent Events的连接管理、消息接收和错误处理
 *
 * @param config - SSE客户端配置
 * @returns SSE连接状态和控制方法
 */
export function useSSE<T = unknown>(
  config: SSEClientConfig
): {
  connectionInfo: SSEConnectionInfo;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
} {
  const [connectionInfo, setConnectionInfo] = useState<SSEConnectionInfo>({
    status: SSEConnectionStatus.CLOSED,
    reconnectAttempts: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
  const reconnectInterval = config.reconnectInterval ?? 3000;

  /**
   * 清理资源
   */
  const cleanup = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  /**
   * 连接SSE服务器
   */
  const connect = useCallback((): void => {
    // 如果已经连接，先断开
    if (eventSourceRef.current) {
      disconnect();
    }

    try {
      setConnectionInfo((prev) => ({
        ...prev,
        status: SSEConnectionStatus.CONNECTING,
      }));

      const eventSource = new EventSource(config.url, {
        withCredentials: config.withCredentials ?? false,
      });

      // 连接打开
      eventSource.onopen = (): void => {
        reconnectAttemptsRef.current = 0;
        setConnectionInfo({
          status: SSEConnectionStatus.OPEN,
          reconnectAttempts: 0,
        });
        config.onOpen?.();
      };

      // 接收消息
      eventSource.onmessage = (event: MessageEvent): void => {
        try {
          const data: T = JSON.parse(event.data);
          config.onMessage?.(data);
        } catch (error) {
          console.error("Failed to parse SSE message:", error);
          config.onError?.(error as Error);
        }
      };

      // 处理错误
      eventSource.onerror = (error: Event): void => {
        const errorObj = new Error("SSE connection error");
        setConnectionInfo((prev) => ({
          ...prev,
          status: SSEConnectionStatus.ERROR,
          lastError: errorObj,
        }));

        config.onError?.(errorObj);

        // 如果连接关闭，尝试重连
        if (eventSource.readyState === EventSource.CLOSED) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            setConnectionInfo((prev) => ({
              ...prev,
              reconnectAttempts: reconnectAttemptsRef.current,
            }));

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else {
            setConnectionInfo((prev) => ({
              ...prev,
              status: SSEConnectionStatus.CLOSED,
            }));
            config.onClose?.();
          }
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Failed to create SSE connection");
      setConnectionInfo({
        status: SSEConnectionStatus.ERROR,
        reconnectAttempts: reconnectAttemptsRef.current,
        lastError: errorObj,
      });
      config.onError?.(errorObj);
    }
  }, [config, maxReconnectAttempts, reconnectInterval]);

  /**
   * 断开SSE连接
   */
  const disconnect = useCallback((): void => {
    cleanup();
    setConnectionInfo({
      status: SSEConnectionStatus.CLOSED,
      reconnectAttempts: 0,
    });
    config.onClose?.();
  }, [config, cleanup]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionInfo,
    connect,
    disconnect,
    isConnected: connectionInfo.status === SSEConnectionStatus.OPEN,
  };
}

