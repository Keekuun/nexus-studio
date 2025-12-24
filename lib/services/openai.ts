/**
 * OpenAI API 服务
 * 提供与 OpenAI API 直接交互的功能
 */

import type { AIRequestConfig, AIMessage } from "@/types/ai";

/**
 * OpenAI API 配置
 */
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * OpenAI 请求消息格式
 */
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenAI API 请求体
 */
interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * OpenAI API 响应
 */
interface OpenAIResponse {
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
 * 将 AIMessage 数组转换为 OpenAI 消息格式
 */
function convertMessagesToOpenAIFormat(
  messages: AIMessage[],
  systemPrompt?: string
): OpenAIMessage[] {
  const openAIMessages: OpenAIMessage[] = [];

  // 添加系统提示（如果有）
  if (systemPrompt) {
    openAIMessages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  // 转换消息
  for (const message of messages) {
    if (message.role === "user" || message.role === "assistant") {
      openAIMessages.push({
        role: message.role,
        content: message.content,
      });
    }
  }

  return openAIMessages;
}

/**
 * 获取 OpenAI API Key
 */
function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return apiKey;
}

/**
 * 调用 OpenAI API
 * @param messages - 对话消息历史
 * @param config - AI 请求配置
 * @returns AI 响应数据
 */
export async function callOpenAIAPI(
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
  const apiKey = getOpenAIKey();

  // 如果没有消息，抛出错误
  if (messages.length === 0) {
    throw new Error("Messages are required");
  }

  // 转换消息格式
  const openAIMessages = convertMessagesToOpenAIFormat(
    messages,
    config?.systemPrompt
  );

  // 构建请求体
  const requestBody: OpenAIRequest = {
    model: config?.model || "gpt-3.5-turbo",
    messages: openAIMessages,
    temperature: config?.temperature ?? 0.7,
    max_tokens: config?.maxTokens,
    stream: config?.stream ?? false,
  };

  // 发送请求
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenAI API error: ${response.statusText}`
    );
  }

  const data: OpenAIResponse = await response.json();

  // 提取响应内容
  const choice = data.choices[0];
  if (!choice) {
    throw new Error("No response from OpenAI API");
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
 * 流式调用 OpenAI API
 * @param messages - 对话消息历史
 * @param config - AI 请求配置
 * @param onChunk - 接收数据块的回调函数
 */
export async function streamOpenAIAPI(
  messages: AIMessage[],
  config: AIRequestConfig,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = getOpenAIKey();

  // 如果没有消息，抛出错误
  if (messages.length === 0) {
    throw new Error("Messages are required");
  }

  // 转换消息格式
  const openAIMessages = convertMessagesToOpenAIFormat(
    messages,
    config.systemPrompt
  );

  // 构建请求体
  const requestBody: OpenAIRequest = {
    model: config.model || "gpt-3.5-turbo",
    messages: openAIMessages,
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens,
    stream: true,
  };

  // 发送请求
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenAI API error: ${response.statusText}`
    );
  }

  // 处理流式响应
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }

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
  } finally {
    reader.releaseLock();
  }
}

/**
 * 检查是否配置了 OpenAI API Key
 */
export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * 获取 OpenAI 默认模型列表
 */
export function getOpenAIModels(): string[] {
  return [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ];
}

