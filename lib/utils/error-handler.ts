/**
 * 错误处理工具函数
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: "网络连接失败，请检查您的网络设置",
  [ErrorType.VALIDATION]: "输入数据验证失败",
  [ErrorType.AUTHENTICATION]: "身份验证失败，请重新登录",
  [ErrorType.AUTHORIZATION]: "您没有权限执行此操作",
  [ErrorType.NOT_FOUND]: "请求的资源不存在",
  [ErrorType.SERVER]: "服务器错误，请稍后重试",
  [ErrorType.UNKNOWN]: "发生未知错误",
};

/**
 * 获取用户友好的错误消息
 * @param error - 错误对象
 * @returns 用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.type] || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES[ErrorType.UNKNOWN];
}

/**
 * 处理API错误
 * @param error - 错误对象
 * @returns AppError实例
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new AppError(error.message, ErrorType.NETWORK, undefined, error);
    }

    return new AppError(error.message, ErrorType.UNKNOWN, undefined, error);
  }

  return new AppError("发生未知错误", ErrorType.UNKNOWN);
}

/**
 * 记录错误到监控服务
 * @param error - 错误对象
 * @param context - 错误上下文
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    message: getErrorMessage(error),
    type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
    statusCode: error instanceof AppError ? error.statusCode : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  // 在实际应用中，这里应该发送到错误监控服务（如Sentry、LogRocket等）
  console.error("Error logged:", errorInfo);

  // 开发环境下显示详细错误信息
  if (process.env.NODE_ENV === "development") {
    console.error("Original error:", error);
  }
}

