/**
 * 性能监控工具函数
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
  domContentLoaded?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

/**
 * 页面性能指标接口
 */
export interface PagePerformanceMetrics {
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    domInteractive: number;
  };
  paint: {
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  resource: {
    totalSize: number;
    count: number;
  };
}

/**
 * 测量函数执行时间
 * @param fn - 要测量的函数
 * @param label - 性能标签
 * @returns 执行结果和执行时间
 */
export async function measurePerformance<T>(
  fn: () => T | Promise<T>,
  label?: string
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const time = end - start;

  if (label && typeof window !== "undefined") {
    console.log(`[Performance] ${label}: ${time.toFixed(2)}ms`);
  }

  return { result, time };
}

/**
 * 获取页面性能指标
 * @returns 页面性能指标对象
 */
export function getPagePerformanceMetrics(): PagePerformanceMetrics | null {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const navigationEntries = performance.getEntriesByType("navigation");
  if (!navigationEntries || navigationEntries.length === 0) {
    return null;
  }

  const navigation = navigationEntries[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType("paint");
  const resources = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  const firstPaint = paint.find((entry) => entry.name === "first-paint");
  const firstContentfulPaint = paint.find(
    (entry) => entry.name === "first-contentful-paint"
  );

  const totalResourceSize = resources.reduce(
    (total, resource) => total + (resource.transferSize || 0),
    0
  );

  return {
    navigation: {
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
    },
    paint: {
      firstPaint: firstPaint ? firstPaint.startTime : undefined,
      firstContentfulPaint: firstContentfulPaint
        ? firstContentfulPaint.startTime
        : undefined,
    },
    resource: {
      totalSize: totalResourceSize,
      count: resources.length,
    },
  };
}

/**
 * 监控页面性能并记录
 * @param callback - 性能数据回调函数
 */
export function monitorPagePerformance(
  callback?: (metrics: PagePerformanceMetrics) => void
): void {
  if (typeof window === "undefined") {
    return;
  }

  // 等待页面完全加载后获取性能指标
  if (document.readyState === "complete") {
    const metrics = getPagePerformanceMetrics();
    if (metrics) {
      logPerformanceMetrics(metrics);
      callback?.(metrics);
    }
  } else {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const metrics = getPagePerformanceMetrics();
        if (metrics) {
          logPerformanceMetrics(metrics);
          callback?.(metrics);
        }
      }, 0);
    });
  }
}

/**
 * 记录性能指标到控制台
 * @param metrics - 性能指标对象
 */
function logPerformanceMetrics(metrics: PagePerformanceMetrics): void {
  if (process.env.NODE_ENV === "development") {
    console.group("[Performance Metrics]");
    console.log("Navigation:", metrics.navigation);
    console.log("Paint:", metrics.paint);
    console.log("Resources:", metrics.resource);
    console.groupEnd();
  }
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

