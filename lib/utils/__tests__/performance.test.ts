/**
 * 性能工具函数测试
 */

import {
  measurePerformance,
  debounce,
  throttle,
  getPagePerformanceMetrics,
} from "../performance";

describe("性能工具函数", () => {
  describe("measurePerformance", () => {
    it("应该正确测量同步函数的执行时间", async () => {
      const fn = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const { result, time } = await measurePerformance(fn, "test");

      expect(result).toBe(499500);
      expect(time).toBeGreaterThanOrEqual(0);
      expect(typeof time).toBe("number");
    });

    it("应该正确测量异步函数的执行时间", async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "done";
      };

      const { result, time } = await measurePerformance(fn, "async-test");

      expect(result).toBe("done");
      expect(time).toBeGreaterThanOrEqual(10);
    });

    it("应该在没有标签时不输出日志", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const fn = () => "test";

      await measurePerformance(fn);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("应该延迟执行函数", () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("应该在延迟期间多次调用时只执行一次", () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("应该传递正确的参数", () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("arg1", "arg2");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("throttle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("应该立即执行第一次调用", () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("应该在延迟期间限制函数调用", () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("应该传递正确的参数", () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn("arg1", "arg2");
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("getPagePerformanceMetrics", () => {
    it("应该在非浏览器环境中返回null", () => {
      const originalWindow = global.window;
      // @ts-expect-error - 测试环境模拟
      delete global.window;

      const result = getPagePerformanceMetrics();
      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it("应该在performance不存在时返回null", () => {
      const originalPerformance = window.performance;
      // @ts-expect-error - 测试环境模拟
      delete window.performance;

      const result = getPagePerformanceMetrics();
      expect(result).toBeNull();

      window.performance = originalPerformance;
    });

    it("应该在浏览器环境中返回性能指标", () => {
      const mockNavigation = {
        domContentLoadedEventEnd: 100,
        domContentLoadedEventStart: 50,
        loadEventEnd: 200,
        loadEventStart: 150,
        domInteractive: 80,
        fetchStart: 0,
      };

      const mockPaint = [
        { name: "first-paint", startTime: 50 },
        { name: "first-contentful-paint", startTime: 60 },
      ];

      const mockResources = [
        { transferSize: 1000 },
        { transferSize: 2000 },
      ];

      Object.defineProperty(window, "performance", {
        writable: true,
        configurable: true,
        value: {
          getEntriesByType: jest.fn((type: string) => {
            if (type === "navigation") return [mockNavigation];
            if (type === "paint") return mockPaint;
            if (type === "resource") return mockResources;
            return [];
          }),
        },
      });

      const result = getPagePerformanceMetrics();

      expect(result).not.toBeNull();
      expect(result?.navigation.domContentLoaded).toBe(50);
      expect(result?.paint.firstPaint).toBe(50);
      expect(result?.resource.totalSize).toBe(3000);
      expect(result?.resource.count).toBe(2);
    });

    it("应该在navigation条目为空时返回null", () => {
      Object.defineProperty(window, "performance", {
        writable: true,
        configurable: true,
        value: {
          getEntriesByType: jest.fn(() => []),
        },
      });

      const result = getPagePerformanceMetrics();
      expect(result).toBeNull();
    });
  });
});

