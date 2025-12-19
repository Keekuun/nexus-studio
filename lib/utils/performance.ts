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

