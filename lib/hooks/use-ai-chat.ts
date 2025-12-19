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
  sendMessage: (content: string, config?: AIRequestConfig) => Promise<void>;
  clearMessages: () => void;
} {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: content, config }),
        });

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
    []
  );

  const clearMessages = useCallback((): void => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}

