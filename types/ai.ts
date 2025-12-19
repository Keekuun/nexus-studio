/**
 * AI交互相关类型定义
 */

/**
 * AI消息角色
 */
export type AIMessageRole = "user" | "assistant" | "system";

/**
 * AI消息
 */
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    [key: string]: unknown;
  };
}

/**
 * AI对话会话
 */
export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

/**
 * AI请求配置
 */
export interface AIRequestConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

/**
 * AI响应
 */
export interface AIResponse {
  content: string;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
}

/**
 * 多模态输入类型
 */
export type MultimodalInputType = "text" | "image" | "audio";

/**
 * 多模态输入
 */
export interface MultimodalInput {
  type: MultimodalInputType;
  content: string | File | Blob;
  mimeType?: string;
}

/**
 * AGUI组件类型
 */
export type AGUIComponentType = "button" | "input" | "select" | "card" | "list";

/**
 * AGUI组件
 */
export interface AGUIComponent {
  type: AGUIComponentType;
  id: string;
  props: Record<string, unknown>;
  children?: AGUIComponent[];
}

