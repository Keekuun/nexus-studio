"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAIChat } from "@/lib/hooks/use-ai-chat";
import { MessageContent } from "@/components/ai/message-content";
import { cn } from "@/lib/utils/cn";
import type { AIMessage } from "@/types/ai";

/**
 * 时间显示组件 - 避免 SSR hydration 错误
 */
function TimeDisplay({ timestamp, className }: { timestamp: number; className?: string }): JSX.Element {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    // 只在客户端格式化时间
    if (typeof window !== "undefined") {
      setTimeString(new Date(timestamp).toLocaleTimeString());
    } else {
      // 服务端使用 ISO 格式
      setTimeString(new Date(timestamp).toISOString().slice(11, 19));
    }
  }, [timestamp]);

  return <p className={className}>{timeString || new Date(timestamp).toISOString().slice(11, 19)}</p>;
}

/**
 * AI聊天界面组件
 */
export function ChatInterface(): JSX.Element {
  const {
    messages,
    loading,
    error,
    currentModel,
    setCurrentModel,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    clearMessages,
  } = useAIChat();
  const [input, setInput] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载可用模型列表
  useEffect(() => {
    const loadModels = async (): Promise<void> => {
      try {
        const response = await fetch("/api/ai/models");
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableModels(result.data.models);
          const defaultM = result.data.defaultModel || result.data.models[0];
          setDefaultModel(defaultM);
          if (!currentModel) {
            setCurrentModel(defaultM);
          }
        }
      } catch (err) {
        console.error("Failed to load models:", err);
      }
    };
    loadModels();
  }, [currentModel, setCurrentModel]);

  /**
   * 检查是否在底部附近（100px 内）
   */
  const isNearBottom = useCallback((): boolean => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // 距离底部的阈值（像素）
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  }, []);

  /**
   * 滚动到底部
   */
  const scrollToBottom = useCallback((force = false): void => {
    // 如果用户正在滚动或不在底部，且不是强制滚动，则不滚动
    if (!force && (!shouldAutoScroll || isUserScrolling || !isNearBottom())) {
      return;
    }

    // 使用 auto 而不是 smooth，减少晃眼
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [shouldAutoScroll, isUserScrolling, isNearBottom]);

  /**
   * 处理用户滚动事件
   */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let scrollTimer: NodeJS.Timeout | null = null;

    const handleScroll = (): void => {
      // 标记用户正在滚动
      setIsUserScrolling(true);
      
      // 检查是否在底部
      const nearBottom = isNearBottom();
      setShouldAutoScroll(nearBottom);

      // 清除之前的定时器
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      // 如果用户停止滚动一段时间，重置状态
      scrollTimer = setTimeout(() => {
        setIsUserScrolling(false);
        // 如果用户在底部，恢复自动滚动
        if (nearBottom) {
          setShouldAutoScroll(true);
        }
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [isNearBottom]);

  /**
   * 当消息更新时，智能滚动
   */
  useEffect(() => {
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 延迟滚动，避免过于频繁
    scrollTimeoutRef.current = setTimeout(() => {
      // 如果是最后一条消息且正在流式输出，或者用户已经在底部，则滚动
      const lastMessage = messages[messages.length - 1];
      const isStreaming = lastMessage?.metadata?.isStreaming;
      
      if (isStreaming || shouldAutoScroll) {
        scrollToBottom();
      }
    }, 50); // 50ms 防抖

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, shouldAutoScroll, scrollToBottom]);

  /**
   * 当发送新消息时，强制滚动到底部
   */
  useEffect(() => {
    if (loading) {
      // 开始加载时，强制滚动到底部
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [loading, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">AI助手</h2>
        <div className="flex items-center gap-2">
          {availableModels.length > 0 && (
            <select
              value={currentModel || defaultModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              disabled={loading}
              className="px-3 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {/*{model.replace(":free", "")}*/}
                  {model}
                </option>
              ))}
            </select>
          )}
          <Button variant="ghost" size="sm" onClick={clearMessages}>
            清空对话
          </Button>
        </div>
      </div>
      <div 
        ref={messagesContainerRef}
        className="flex-1 flex flex-col max-h-[500px] h-full overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12 flex-1 flex flex-col items-center justify-center">
            <p className="text-lg mb-2">开始与AI对话</p>
            <p className="text-sm">输入您的问题，AI将为您提供帮助</p>
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLastAssistant={
              index === messages.length - 1 && message.role === "assistant"
            }
            onRetry={retryLastMessage}
          />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <Loading size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRequest}
                className="h-8 text-xs"
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <ErrorMessage error={error} />
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastMessage}
                className="text-xs"
              >
                🔄 重试
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          {loading ? (
            <Button
              type="button"
              variant="destructive"
              onClick={cancelRequest}
            >
              取消
            </Button>
          ) : (
            <Button type="submit" disabled={loading || !input.trim()}>
              发送
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/**
 * 聊天消息组件
 */
function ChatMessage({
  message,
  isLastAssistant = false,
  onRetry,
}: {
  message: AIMessage;
  isLastAssistant?: boolean;
  onRetry?: () => void;
}): JSX.Element {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  /**
   * 复制消息内容
   */
  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4 group relative",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {/* 复制按钮 - 右上角 */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm"
            title={copied ? "已复制" : "复制消息"}
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600 dark:text-gray-400"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MessageContent content={message.content} isUser={false} />
        )}
        
        {/* 思考过程显示 */}
        {message.metadata?.thinking && !isUser && (
          <details className="mt-3 cursor-pointer">
            <summary className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              💭 查看思考过程
            </summary>
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
              {message.metadata.thinking}
            </div>
          </details>
        )}

        {/* 流式输出指示器 */}
        {message.metadata?.isStreaming && (
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">正在输入...</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <TimeDisplay timestamp={message.timestamp} className={cn("text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")} />
          <div className="flex items-center gap-2">
            {message.metadata?.model && !isUser && (
              <p className={cn("text-xs", "text-muted-foreground")}>
                {message.metadata.model}
              </p>
            )}
            {/* AI消息的重试按钮 */}
            {!isUser && !message.metadata?.isStreaming && isLastAssistant && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="重试此消息"
              >
                🔄
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

