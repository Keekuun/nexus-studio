"use client";

/**
 * 性能监控组件
 * 在客户端监控页面性能指标
 */

import { useEffect } from "react";
import { monitorPagePerformance } from "@/lib/utils/performance";

/**
 * 性能监控组件属性
 */
interface PerformanceMonitorProps {
  /**
   * 是否启用性能监控
   */
  enabled?: boolean;
  /**
   * 性能数据回调函数
   */
  onMetrics?: (metrics: unknown) => void;
}

/**
 * 性能监控组件
 * 自动监控页面性能并在开发环境下输出日志
 */
export function PerformanceMonitor({
  enabled = true,
  onMetrics,
}: PerformanceMonitorProps): null {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    // 监控页面性能
    monitorPagePerformance((metrics) => {
      // 调用回调函数，可以用于发送到监控服务
      onMetrics?.(metrics);

      // 在生产环境下，可以发送到性能监控服务
      if (process.env.NODE_ENV === "production") {
        // 这里可以集成第三方性能监控服务
        // 例如：sendToAnalytics(metrics);
      }
    });

    // 监控全局错误
    const handleError = (event: ErrorEvent): void => {
      console.error("[Global Error]", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };

    // 监控未处理的Promise拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      console.error("[Unhandled Promise Rejection]", {
        reason: event.reason,
        promise: event.promise,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [enabled, onMetrics]);

  // 此组件不渲染任何内容
  return null;
}

