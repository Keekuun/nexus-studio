/**
 * 状态管理相关类型定义
 */

/**
 * 应用全局状态接口
 */
export interface AppState {
  // 用户相关
  user: UserState | null;
  // UI状态
  ui: UIState;
  // 连接状态
  connections: ConnectionState;
}

/**
 * 用户状态
 */
export interface UserState {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

/**
 * UI状态
 */
export interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * 连接状态
 */
export interface ConnectionState {
  sse: {
    connected: boolean;
    lastMessage?: unknown;
  };
  websocket: {
    connected: boolean;
    lastMessage?: unknown;
  };
}

/**
 * App Store Actions
 */
export interface AppActions {
  // 用户相关
  setUser: (user: UserState | null) => void;
  // UI相关
  setTheme: (theme: UIState["theme"]) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // 连接相关
  setSSEConnected: (connected: boolean) => void;
  setSSELastMessage: (message: unknown) => void;
  setWebSocketConnected: (connected: boolean) => void;
  setWebSocketLastMessage: (message: unknown) => void;
}

/**
 * App Store类型
 */
export type AppStore = AppState & AppActions;

