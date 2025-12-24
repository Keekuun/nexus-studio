"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAIChat } from "@/lib/hooks/use-ai-chat";
import { MessageContent } from "@/components/ai/message-content";
import { cn } from "@/lib/utils/cn";
import type { AIMessage } from "@/types/ai";

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

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
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

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4 group",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
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
          <p className={cn("text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
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

