"use client";

import { useState, useCallback, useRef } from "react";
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
  cancelRequest: () => void;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
} {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>("");

  const sendMessage = useCallback(
    async (content: string, config?: AIRequestConfig): Promise<void> => {
      if (!content.trim()) return;

      setLoading(true);
      setError(null);

      // 保存最后一条用户消息用于重试
      lastUserMessageRef.current = content;

      // 创建 AbortController 用于取消请求
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

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
        // 合并当前选择的模型到配置中，默认启用流式输出
        const requestConfig: AIRequestConfig = {
          ...config,
          model: config?.model || currentModel || undefined,
          stream: config?.stream ?? true, // 默认启用流式输出
        };

        // 如果启用流式输出
        if (requestConfig.stream) {
          // 创建AI消息占位符
          const aiMessageId = `${Date.now()}-assistant`;
          const aiMessage: AIMessage = {
            id: aiMessageId,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
            metadata: {
              isStreaming: true,
            },
          };
          setMessages((prev) => [...prev, aiMessage]);

          // 发送流式请求
          const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: updatedMessages,
              config: requestConfig,
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // 处理流式响应
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("No response body");
          }

          let fullContent = "";
          let thinking = "";
          let buffer = ""; // 缓冲区，用于处理不完整的行

          try {
            while (true) {
              // 检查是否已取消
              if (abortController.signal.aborted) {
                reader.cancel();
                return; // 直接返回，不抛出错误
              }

              const { done, value } = await reader.read();
              if (done) {
                // 处理缓冲区中剩余的数据
                if (buffer.trim()) {
                  const lines = buffer.split("\n");
                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6).trim();
                      if (data && data !== "[DONE]") {
                        try {
                          const json = JSON.parse(data);
                          if (json.chunk) {
                            fullContent += json.chunk;
                          }
                          if (json.thinking) {
                            thinking = json.thinking;
                          }
                        } catch {
                          // 忽略解析错误
                        }
                      }
                    }
                  }
                }
                break;
              }

              // 解码数据块并添加到缓冲区
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // 处理完整的行（以 \n\n 分隔的 SSE 消息）
              const parts = buffer.split("\n\n");
              // 保留最后一个不完整的部分在缓冲区
              buffer = parts.pop() || "";

              for (const part of parts) {
                const lines = part.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") {
                      // 流式输出完成
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: fullContent,
                                metadata: {
                                  ...msg.metadata,
                                  isStreaming: false,
                                  thinking: thinking || undefined,
                                },
                              }
                            : msg
                        )
                      );
                      setLoading(false);
                      return;
                    }

                    if (data) {
                      try {
                        const json = JSON.parse(data);
                        if (json.chunk) {
                          fullContent += json.chunk;
                          // 更新消息内容
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === aiMessageId
                                ? { ...msg, content: fullContent }
                                : msg
                            )
                          );
                        }
                        if (json.thinking) {
                          thinking = json.thinking; // 使用最新的思考内容
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === aiMessageId
                                ? {
                                    ...msg,
                                    metadata: {
                                      ...msg.metadata,
                                      thinking: thinking,
                                    },
                                  }
                                : msg
                            )
                          );
                        }
                        if (json.error) {
                          throw new Error(json.error);
                        }
                      } catch (parseError) {
                        // 忽略解析错误，继续处理
                        console.warn("Failed to parse SSE data:", data, parseError);
                      }
                    }
                  }
                }
              }
            }

            // 流式输出完成（正常结束）
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: fullContent,
                      metadata: {
                        ...msg.metadata,
                        isStreaming: false,
                        thinking: thinking || undefined,
                      },
                    }
                  : msg
              )
            );
          } finally {
            reader.releaseLock();
          }
        } else {
          // 非流式响应
          const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: updatedMessages,
              config: requestConfig,
            }),
            signal: abortController.signal,
          });

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
        }
      } catch (err) {
        // 如果是取消操作，不显示错误
        if (
          (err instanceof Error && err.name === "AbortError") ||
          (err instanceof Error && err.message === "Request cancelled") ||
          abortController.signal.aborted
        ) {
          // 移除流式消息占位符
          setMessages((prev) => prev.filter((msg) => !msg.metadata?.isStreaming));
          setLoading(false);
          abortControllerRef.current = null;
          return;
        }

        const errorMessage = err instanceof Error ? err.message : "AI request failed";
        setError(errorMessage);
        console.error("AI chat error:", err);
        // 移除流式消息占位符（如果有）
        setMessages((prev) => prev.filter((msg) => !msg.metadata?.isStreaming));
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [messages, currentModel]
  );

  /**
   * 取消当前请求
   */
  const cancelRequest = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      // 移除流式消息占位符
      setMessages((prev) => prev.filter((msg) => !msg.metadata?.isStreaming));
    }
  }, []);

  /**
   * 重试最后一条消息
   */
  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastUserMessageRef.current) {
      return;
    }

    // 清除错误状态
    setError(null);

    // 移除最后一条用户消息和对应的AI回复（如果有）
    setMessages((prev) => {
      const newMessages = [...prev];
      // 找到最后一条用户消息
      const lastUserIndex = newMessages.findLastIndex((msg) => msg.role === "user");
      if (lastUserIndex !== -1) {
        // 移除用户消息及其后的所有消息（包括AI回复）
        return newMessages.slice(0, lastUserIndex);
      }
      return newMessages;
    });

    // 等待状态更新后重新发送最后一条消息
    setTimeout(() => {
      sendMessage(lastUserMessageRef.current);
    }, 0);
  }, [sendMessage]);

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
    cancelRequest,
    retryLastMessage,
    clearMessages,
  };
}

