/**
 * 性能监控Hook
 */

import { useEffect, useState } from "react";
import {
  getPagePerformanceMetrics,
  monitorPagePerformance,
  type PagePerformanceMetrics,
} from "@/lib/utils/performance";

/**
 * 使用性能监控Hook
 * @param enabled - 是否启用性能监控
 * @returns 性能指标数据
 */
export function usePerformanceMonitor(
  enabled: boolean = true
): PagePerformanceMetrics | null {
  const [metrics, setMetrics] = useState<PagePerformanceMetrics | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    monitorPagePerformance((performanceMetrics) => {
      setMetrics(performanceMetrics);
    });

    // 如果页面已经加载完成，立即获取指标
    if (document.readyState === "complete") {
      const currentMetrics = getPagePerformanceMetrics();
      if (currentMetrics) {
        setMetrics(currentMetrics);
      }
    }
  }, [enabled]);

  return metrics;
}

