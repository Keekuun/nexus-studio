import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppStore } from "@/types/store";

/**
 * 应用全局状态Store
 * 使用Zustand进行状态管理，支持持久化
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      ui: {
        theme: "system",
        sidebarOpen: false,
        loading: false,
        error: null,
      },
      connections: {
        sse: {
          connected: false,
        },
        websocket: {
          connected: false,
        },
      },

      // Actions
      setUser: (user) => set({ user }),

      setTheme: (theme) =>
        set((state) => ({
          ui: { ...state.ui, theme },
        })),

      setSidebarOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: open },
        })),

      setLoading: (loading) =>
        set((state) => ({
          ui: { ...state.ui, loading },
        })),

      setError: (error) =>
        set((state) => ({
          ui: { ...state.ui, error },
        })),

      setSSEConnected: (connected) =>
        set((state) => ({
          connections: {
            ...state.connections,
            sse: { ...state.connections.sse, connected },
          },
        })),

      setSSELastMessage: (message) =>
        set((state) => ({
          connections: {
            ...state.connections,
            sse: { ...state.connections.sse, lastMessage: message },
          },
        })),

      setWebSocketConnected: (connected) =>
        set((state) => ({
          connections: {
            ...state.connections,
            websocket: { ...state.connections.websocket, connected },
          },
        })),

      setWebSocketLastMessage: (message) =>
        set((state) => ({
          connections: {
            ...state.connections,
            websocket: { ...state.connections.websocket, lastMessage: message },
          },
        })),
    }),
    {
      name: "nexus-studio-storage",
      storage: createJSONStorage(() => localStorage),
      // 只持久化部分状态
      partialize: (state) => ({
        user: state.user,
        ui: {
          theme: state.ui.theme,
          sidebarOpen: state.ui.sidebarOpen,
        },
      }),
    }
  )
);

