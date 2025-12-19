/**
 * 全局类型定义
 * 所有共享的TypeScript类型定义应放在此文件中
 */

// 通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 重新导出SSE类型
export * from "./sse";

// 重新导出WebSocket类型
export * from "./websocket";

// 重新导出媒体类型
export * from "./media";

// 重新导出编辑器类型
export * from "./editor";

// 重新导出AI类型
export * from "./ai";

