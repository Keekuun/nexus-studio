/**
 * 错误处理工具函数测试
 */

import {
  ErrorType,
  AppError,
  getErrorMessage,
  handleApiError,
  logError,
} from "../error-handler";

describe("错误处理工具函数", () => {
  describe("AppError", () => {
    it("应该创建AppError实例", () => {
      const error = new AppError("测试错误", ErrorType.NETWORK, 500);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("测试错误");
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.statusCode).toBe(500);
    });

    it("应该设置默认值", () => {
      const error = new AppError("测试错误");
      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe("getErrorMessage", () => {
    it("应该返回AppError的用户友好消息", () => {
      const error = new AppError("自定义错误", ErrorType.NETWORK);
      const message = getErrorMessage(error);
      expect(message).toBe("网络连接失败，请检查您的网络设置");
    });

    it("应该返回普通Error的消息", () => {
      const error = new Error("普通错误");
      const message = getErrorMessage(error);
      expect(message).toBe("普通错误");
    });

    it("应该返回未知错误的默认消息", () => {
      const message = getErrorMessage("字符串错误");
      expect(message).toBe("发生未知错误");
    });

    it("应该处理null和undefined", () => {
      expect(getErrorMessage(null)).toBe("发生未知错误");
      expect(getErrorMessage(undefined)).toBe("发生未知错误");
    });
  });

  describe("handleApiError", () => {
    it("应该返回AppError实例本身", () => {
      const appError = new AppError("测试", ErrorType.NETWORK);
      const result = handleApiError(appError);
      expect(result).toBe(appError);
    });

    it("应该将网络错误转换为AppError", () => {
      const error = new Error("fetch failed");
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.originalError).toBe(error);
    });

    it("应该将普通错误转换为AppError", () => {
      const error = new Error("普通错误");
      const result = handleApiError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.type).toBe(ErrorType.UNKNOWN);
    });

    it("应该处理未知类型的错误", () => {
      const result = handleApiError("字符串错误");
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("发生未知错误");
      expect(result.type).toBe(ErrorType.UNKNOWN);
    });
  });

  describe("logError", () => {
    let consoleSpy: jest.SpyInstance;
    const originalNavigator = window.navigator;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation();
      // Mock navigator
      Object.defineProperty(window, "navigator", {
        writable: true,
        configurable: true,
        value: { userAgent: "test-agent" },
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      // 恢复原始对象
      Object.defineProperty(window, "navigator", {
        writable: true,
        configurable: true,
        value: originalNavigator,
      });
    });

    it("应该记录AppError", () => {
      const error = new AppError("测试错误", ErrorType.NETWORK, 500);
      logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      // console.error 的第一个参数是字符串，第二个参数是对象
      const callArgs = consoleSpy.mock.calls[0][1];
      expect(callArgs).toMatchObject({
        message: expect.any(String),
        type: ErrorType.NETWORK,
        statusCode: 500,
      });
    });

    it("应该记录普通Error", () => {
      const error = new Error("普通错误");
      logError(error);

      expect(consoleSpy).toHaveBeenCalled();
    });

    it("应该包含上下文信息", () => {
      const error = new Error("测试错误");
      const context = { userId: "123", action: "test" };
      logError(error, context);

      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][1];
      expect(callArgs.context).toEqual(context);
    });

    it("应该包含时间戳", () => {
      const error = new Error("测试错误");
      logError(error);

      const callArgs = consoleSpy.mock.calls[0][1];
      expect(callArgs.timestamp).toBeDefined();
      expect(new Date(callArgs.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});

