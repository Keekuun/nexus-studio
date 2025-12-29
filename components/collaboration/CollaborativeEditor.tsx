'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

/**
 * 协同编辑器组件 Props
 */
interface CollaborativeEditorProps {
  user: {
    name: string;
    color: string;
  };
  documentName: string;
}

/**
 * 基于 Yjs 和 TipTap 的实时协同编辑器
 * 
 * 技术栈：
 * - Yjs: CRDT 数据结构，用于冲突解决
 * - TipTap: 富文本编辑器框架
 * - WebsocketProvider (y-websocket): WebSocket 提供者，用于实时同步
 */
const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ user, documentName }) => {
  // 状态管理
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [ydoc, setYdoc] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);

  // 使用 useRef 存储引用，用于清理
  const providerRef = useRef<any>(null);

  // 标记组件已在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初始化 Yjs 和 WebsocketProvider (y-websocket)
  // 使用 dynamic import 避免 Yjs 重复导入问题
  // 参考: https://github.com/yjs/yjs/issues/438
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    let isMounted = true;
    let currentProvider: any = null;

    // 动态导入 Yjs 和 WebsocketProvider
    Promise.all([
      import('yjs'),
      import('y-websocket'),
    ])
      .then(([yjsModule, { WebsocketProvider }]) => {
        if (!isMounted) return;

        try {
          const Y = yjsModule;

          // 创建 Y.Doc 实例
          const doc = new Y.Doc();
          setYdoc(doc);

          // WebSocket 服务器地址
          // 默认使用 localhost:3001，可以通过环境变量配置
          const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
          const roomName = documentName;

          // 创建 WebsocketProvider
          // y-websocket 会自动处理连接、重连和同步
          const providerInstance = new WebsocketProvider(
            wsUrl,
            roomName,
            doc,
            {
              // 配置选项
              connect: true, // 自动连接
              params: {}, // 额外的 URL 参数
            }
          );

          currentProvider = providerInstance;
          providerRef.current = providerInstance;
          setProvider(providerInstance);

          // 监听连接事件
          // 使用 any 类型避免类型检查问题，因为 y-websocket 的类型定义可能不完整
          const handleStatus = (event: any) => {
            const status = event?.status || 'disconnected';
            console.log('[CollaborativeEditor] Provider status:', status);
            if (status === 'connected') {
              setIsConnected(true);
              setConnectionError(null);
            } else if (status === 'disconnected') {
              setIsConnected(false);
            }
          };

          const handleSync = (isSynced: boolean) => {
            console.log('[CollaborativeEditor] Document synced:', isSynced);
            if (isSynced) {
              setIsConnected(true);
              setConnectionError(null);
            }
          };

          const handleConnectionError = (event: any, provider?: any) => {
            console.error('[CollaborativeEditor] Provider error:', event);
            setConnectionError('连接错误');
            setIsConnected(false);
          };

          const handleConnectionClose = (event: any, provider?: any) => {
            console.log('[CollaborativeEditor] Connection closed');
            setIsConnected(false);
          };

          // 监听状态变化
          // 使用类型断言避免类型检查问题
          (providerInstance as any).on('status', handleStatus);
          (providerInstance as any).on('sync', handleSync);
          (providerInstance as any).on('connection-error', handleConnectionError);
          (providerInstance as any).on('connection-close', handleConnectionClose);

          // 检查初始连接状态
          if (providerInstance.ws && providerInstance.ws.readyState === WebSocket.OPEN) {
            setIsConnected(true);
          }
        } catch (error) {
          console.error('[CollaborativeEditor] Failed to initialize:', error);
          setConnectionError(error instanceof Error ? error.message : '初始化失败');
        }
      })
      .catch((error) => {
        console.error('[CollaborativeEditor] Failed to load modules:', error);
        setConnectionError('无法加载协同编辑模块');
      });

    return () => {
      isMounted = false;
      if (currentProvider) {
        try {
          currentProvider.destroy();
        } catch (error) {
          console.error('[CollaborativeEditor] Error destroying provider:', error);
        }
      }
    };
  }, [mounted, documentName]);

  // 创建编辑器实例
  // 只有在 Y.Doc 和 Provider 都准备好后才创建编辑器
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        // Collaboration 扩展：将 TipTap 与 Yjs 文档绑定
        ...(ydoc
          ? [
              Collaboration.configure({
                document: ydoc,
              }),
            ]
          : []),
        // CollaborationCursor 扩展：显示其他用户的光标
        // 只有在 provider 存在时才添加
        ...(provider && ydoc
          ? [
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  name: user.name,
                  color: user.color,
                },
              }),
            ]
          : []),
      ],
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        // 可以在这里处理内容更新
        // console.log('Editor updated:', editor.getHTML());
      },
      onCreate: () => {
        console.log('[CollaborativeEditor] Editor created');
      },
      onFocus: () => {
        console.log('[CollaborativeEditor] Editor focused');
      },
    },
    // 依赖项：当这些值变化时，编辑器会重新创建
    [ydoc, provider, user.name, user.color]
  );

  // 清理资源
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
      if (provider) {
        try {
          provider.destroy();
        } catch (error) {
          console.error('[CollaborativeEditor] Error cleaning up provider:', error);
        }
      }
    };
  }, [editor, provider]);

  // 如果还未挂载，显示加载状态
  if (!mounted) {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 min-h-[400px] flex items-center justify-center text-gray-500">
          正在初始化...
        </div>
      </div>
    );
  }

  // 如果编辑器还未创建，显示加载状态
  if (!editor || !ydoc) {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="border-b p-2 bg-gray-50">
          <span className="font-semibold text-gray-700">协同文档: {documentName}</span>
        </div>
        <div className="p-4 min-h-[400px] flex items-center justify-center text-gray-500">
          正在初始化编辑器...
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      {/* 头部工具栏 */}
      <div className="border-b p-2 bg-gray-50 flex items-center justify-between">
        <span className="font-semibold text-gray-700">协同文档: {documentName}</span>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span>
            你以 <span style={{ color: user.color, fontWeight: 'bold' }}>{user.name}</span> 的身份加入
          </span>
          {connectionError ? (
            <span className="text-red-500" title={connectionError}>
              ⚠️ 连接错误
            </span>
          ) : isConnected ? (
            <span className="text-green-500">● 已连接</span>
          ) : (
            <span className="text-blue-500">○ 连接中...</span>
          )}
        </div>
      </div>

      {/* 编辑器内容 */}
      <EditorContent
        editor={editor}
        className="p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none"
      />

      {/* 连接提示 */}
      {connectionError && (
        <div className="border-t p-2 bg-yellow-50 text-sm text-yellow-800">
          <p className="font-semibold">⚠️ 连接警告</p>
          <p>{connectionError}</p>
          <p className="mt-1 text-xs">
            提示：Next.js App Router 不支持 WebSocket 升级。请使用独立的 WebSocket 服务器（如运行在端口 3001 的 Hocuspocus 服务器）。
          </p>
        </div>
      )}
    </div>
  );
};

export default CollaborativeEditor;
