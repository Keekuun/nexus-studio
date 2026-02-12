"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import type { AnyExtension } from "@tiptap/core";
import type * as Yjs from "yjs";

// ==================== 类型定义 ====================
export interface User {
  id: string; // 新增用户ID，用于唯一标识
  name: string;
  color: string;
}

export interface CollaborativeEditorProps {
  /** 当前用户信息 */
  user: User;
  /** 文档唯一标识 */
  documentId: string;
  /** WebSocket 服务地址 */
  wsUrl?: string;
  /** 编辑器占位符 */
  placeholder?: string;
  /** 编辑器额外扩展 */
  extensions?: AnyExtension[];
  /** 编辑器容器类名 */
  className?: string;
  /** 连接状态变更回调 */
  onStatusChange?: (status: ConnectionStatus) => void;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

// 默认样式
const DEFAULT_EDITOR_CLASSES =
  "focus:outline-none prose prose-sm max-w-none min-h-[400px] p-4";

// ==================== 核心组件 ====================
const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  user,
  documentId,
  wsUrl = process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || "ws://localhost:3001",
  placeholder = "请输入内容...",
  extensions = [],
  className,
  onStatusChange,
}) => {
  // 核心状态
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [yDoc, setYDoc] = useState<Yjs.Doc | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 初始化 Yjs 和 Hocuspocus Provider
  const initCollaboration = useCallback(async () => {
    try {
      setStatus("connecting");
      setErrorMsg(null);

      // 动态导入 Yjs，避免 SSR 问题
      const Y = await import("yjs");

      // 创建 Yjs 文档
      const doc = new Y.Doc();
      setYDoc(doc);

      // 创建 Hocuspocus Provider
      const newProvider = new HocuspocusProvider({
        url: wsUrl,
        name: documentId,
        document: doc,
        // 传递用户信息（服务端可验证）
        parameters: {
          userId: user.id,
          userName: user.name,
          userColor: user.color,
        } as any,
        // 连接状态处理
        onConnect: () => {
          setStatus("connected");
          setErrorMsg(null);
          onStatusChange?.("connected");
        },
        onDisconnect: ({ event }: { event: any }) => {
          const isNormalClose = event?.code === 1000;
          setStatus(isNormalClose ? "disconnected" : "error");
          if (!isNormalClose) {
            setErrorMsg("连接已断开，请检查网络或服务器状态");
          }
          onStatusChange?.(isNormalClose ? "disconnected" : "error");
        },
        onError: (error: any) => {
          console.error("Hocuspocus 错误:", error);
          setStatus("error");
          setErrorMsg(error.message || "连接出错，请重试");
          onStatusChange?.("error");
        },
        // 配置自动重连
        retry: {
          retries: 5, // 最大重试次数
          factor: 1.5, // 指数退避因子
          minTimeout: 1000, // 最小重试间隔
          maxTimeout: 10000, // 最大重试间隔
        },
      } as any);

      setProvider(newProvider);

      // 更新用户感知信息
      newProvider.setAwarenessField("user", {
        name: user.name,
        color: user.color,
        id: user.id,
      });

      // 返回清理函数
      return () => {
        newProvider.destroy();
        doc.destroy();
      };
    } catch (error) {
      console.error("初始化协作失败:", error);
      setStatus("error");
      setErrorMsg((error as Error).message || "初始化协作环境失败");
      onStatusChange?.("error");
      return () => {};
    }
  }, [wsUrl, documentId, user, onStatusChange]);

  // 初始化和清理
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const init = async () => {
      cleanup = await initCollaboration();
    };

    init();

    // 组件卸载时清理资源
    return () => {
      cleanup?.();
    };
  }, [initCollaboration]);

  // 使用 Tiptap 的 useEditor 钩子
  const editor = useEditor(
    {
      extensions: [
        // 仅当 provider 和 yDoc 存在时启用协作扩展
        ...(provider && yDoc
          ? [
              StarterKit.configure({
                history: false, // 禁用本地历史记录，交由 Yjs 处理
              } as any),
              Collaboration.configure({
                document: yDoc,
              }),
              CollaborationCursor.configure({
                provider,
                user: {
                  name: user.name,
                  color: user.color,
                },
              }),
            ]
          : [StarterKit]),
        Placeholder.configure({
          placeholder,
        }),
        ...extensions,
      ],
      editorProps: {
        attributes: {
          class: className || DEFAULT_EDITOR_CLASSES,
        },
      },
      // 解决 SSR 水合问题
      immediatelyRender: false,
      autofocus: false,
    },
    [provider, yDoc]
  );

  // 重试连接
  const handleRetry = () => {
    // 销毁现有连接
    provider?.destroy();
    yDoc?.destroy();

    // 重新初始化
    initCollaboration();
  };

  // 状态指示器样式
  const getStatusIndicator = () => {
    switch (status) {
      case "connected":
        return (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            已连接
          </span>
        );
      case "connecting":
        return (
          <span className="flex items-center gap-1 text-xs text-blue-500">
            <span className="h-2 w-2 animate-spin rounded-full bg-blue-500"></span>
            连接中...
          </span>
        );
      case "disconnected":
        return (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
            已断开
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            出错
          </span>
        );
    }
  };

  // 加载中状态
  if (status === "connecting" && !editor) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 overflow-hidden rounded-lg border bg-gray-50 text-gray-500 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p>正在初始化协作编辑器...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* 顶部状态栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 p-2">
        <span className="font-semibold text-gray-700">📄 {documentId}</span>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: user.color }}
            ></div>
            <span className="font-medium">{user.name}</span>
          </div>

          <div className="h-4 w-[1px] bg-gray-300"></div>

          {getStatusIndicator()}
        </div>
      </div>

      {/* 错误提示 */}
      {errorMsg && (
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>⚠️ {errorMsg}</span>
          <button
            onClick={handleRetry}
            className="rounded border border-red-200 bg-white px-2 py-1 text-xs transition-colors hover:bg-red-50"
          >
            重试连接
          </button>
        </div>
      )}

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} />

      {/* 底部信息栏 */}
      <div className="flex justify-between border-t bg-gray-50 p-2 text-xs text-gray-400">
        <span>实时协作编辑</span>
        <span>{editor?.storage.characterCount?.characters() || 0} 字符</span>
      </div>
    </div>
  );
};

export default CollaborativeEditor;
