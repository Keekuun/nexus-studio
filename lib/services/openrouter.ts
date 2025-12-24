/**
 * OpenRouter API 服务
 * 提供与 OpenRouter API 交互的功能
 */

import type { AIRequestConfig, AIMessage } from "@/types/ai";

/**
 * 获取默认模型
 * 从环境变量 OPENROUTER_DEFAULT_MODEL 读取，如果没有配置则使用默认免费模型
 */
function getDefaultModel(): string {
  return (
    process.env.OPENROUTER_DEFAULT_MODEL ||
    "meta-llama/llama-3.2-3b-instruct:free"
  );
}

/**
 * 获取可用模型列表
 * 从环境变量 OPENROUTER_MODELS 读取（逗号分隔），如果没有配置则返回默认模型列表
 */
export function getAvailableModels(): string[] {
  const envModels = process.env.OPENROUTER_MODELS;
  if (envModels) {
    return envModels.split(",").map((model) => model.trim()).filter(Boolean);
  }

  // 默认免费模型列表
  return [
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemini-flash-1.5:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
  ];
}

/**
 * 获取 OpenRouter API URL
 * 从环境变量读取，如果没有配置则使用默认值
 */
function getApiUrl(): string {
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai";
  return `${baseUrl}/api/v1/chat/completions`;
}

/**
 * 获取 OpenRouter API Key
 */
function getApiKey(): string {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!openRouterKey) {
    throw new Error(
      "OPENROUTER_API_KEY must be configured in environment variables"
    );
  }
  
  return openRouterKey;
}

/**
 * 检查是否配置了 OpenRouter API Key
 */
export function hasOpenRouterKey(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * OpenRouter 请求消息格式
 */
interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenRouter API 请求体
 */
interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * OpenRouter API 响应
 */
interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 将 AIMessage 数组转换为 OpenRouter 消息格式
 */
function convertMessagesToOpenRouterFormat(
  messages: AIMessage[],
  systemPrompt?: string
): OpenRouterMessage[] {
  const openRouterMessages: OpenRouterMessage[] = [];

  // 添加系统提示（如果有）
  if (systemPrompt) {
    openRouterMessages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  // 转换消息
  for (const message of messages) {
    if (message.role === "user" || message.role === "assistant") {
      openRouterMessages.push({
        role: message.role,
        content: message.content,
      });
    }
  }

  return openRouterMessages;
}

/**
 * 调用 OpenRouter API
 * @param messages - 对话消息历史
 * @param config - AI 请求配置
 * @returns AI 响应数据
 */
export async function callOpenRouterAPI(
  messages: AIMessage[],
  config?: AIRequestConfig
): Promise<{
  content: string;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
}> {
  const apiKey = getApiKey();

  // 如果没有消息，抛出错误
  if (messages.length === 0) {
    throw new Error("Messages are required");
  }

  // 转换消息格式
  const openRouterMessages = convertMessagesToOpenRouterFormat(
    messages,
    config?.systemPrompt
  );

  // 构建请求体
  const requestBody: OpenRouterRequest = {
    model: config?.model || getDefaultModel(),
    messages: openRouterMessages,
    temperature: config?.temperature ?? 0.7,
    max_tokens: config?.maxTokens,
    stream: config?.stream ?? false,
  };

  // 发送请求
  const apiUrl = getApiUrl();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Nexus Studio",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenRouter API error: ${response.statusText}`
    );
  }

  const data: OpenRouterResponse = await response.json();

  // 提取响应内容
  const choice = data.choices[0];
  if (!choice) {
    throw new Error("No response from OpenRouter API");
  }

  return {
    content: choice.message.content,
    model: data.model,
    tokens: data.usage
      ? {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        }
      : undefined,
    finishReason: choice.finish_reason,
  };
}

/**
 * 流式调用 OpenRouter API
 * @param messages - 对话消息历史
 * @param config - AI 请求配置
 * @param onChunk - 接收数据块的回调函数
 */
export async function streamOpenRouterAPI(
  messages: AIMessage[],
  config: AIRequestConfig,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = getApiKey();

  // 如果没有消息，抛出错误
  if (messages.length === 0) {
    throw new Error("Messages are required");
  }

  // 转换消息格式
  const openRouterMessages = convertMessagesToOpenRouterFormat(
    messages,
    config.systemPrompt
  );

  // 构建请求体
  const requestBody: OpenRouterRequest = {
    model: config.model || getDefaultModel(),
    messages: openRouterMessages,
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens,
    stream: true,
  };

  // 发送请求
  const apiUrl = getApiUrl();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Nexus Studio",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenRouter API error: ${response.statusText}`
    );
  }

  // 处理流式响应
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  let buffer = ""; // 缓冲区，用于处理不完整的行

  try {
    while (true) {
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
                  const delta = json.choices[0]?.delta?.content;
                  if (delta) {
                    onChunk(delta);
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
              return;
            }

            if (data) {
              try {
                const json = JSON.parse(data);
                const delta = json.choices[0]?.delta?.content;
                if (delta) {
                  onChunk(delta);
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

