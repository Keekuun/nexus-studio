"use client";

import { useState, useCallback } from "react";
import type { AIMessage, AIRequestConfig, AIResponse, ApiResponse } from "@/types";

/**
 * AI聊天Hook
 * 提供AI对话功能
 */
export function useAIChat(): {
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
  currentModel: string;
  setCurrentModel: (model: string) => void;
  sendMessage: (content: string, config?: AIRequestConfig) => Promise<void>;
  clearMessages: () => void;
} {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>("");

  const sendMessage = useCallback(
    async (content: string, config?: AIRequestConfig): Promise<void> => {
      if (!content.trim()) return;

      setLoading(true);
      setError(null);

      // 添加用户消息
      const userMessage: AIMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content,
        timestamp: Date.now(),
      };

      // 更新消息列表（包含新用户消息）
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        // 合并当前选择的模型到配置中
        const requestConfig: AIRequestConfig = {
          ...config,
          model: config?.model || currentModel || undefined,
        };

        // 发送完整的对话历史到 API
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            config: requestConfig,
          }),
        });

        // 检查响应状态
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<AIResponse> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "AI request failed");
        }

        // 添加AI回复
        const aiMessage: AIMessage = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: result.data.content,
          timestamp: Date.now(),
          metadata: {
            model: result.data.model,
            tokens: result.data.tokens?.total,
          },
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "AI request failed";
        setError(errorMessage);
        console.error("AI chat error:", err);
      } finally {
        setLoading(false);
      }
    },
    [messages, currentModel]
  );

  const clearMessages = useCallback((): void => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    currentModel,
    setCurrentModel,
    sendMessage,
    clearMessages,
  };
}

