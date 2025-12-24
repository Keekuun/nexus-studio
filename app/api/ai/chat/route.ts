import { NextRequest, NextResponse } from "next/server";
import type { AIRequestConfig, AIResponse, ApiResponse, AIMessage } from "@/types";
import {
  callOpenRouterAPI,
  streamOpenRouterAPI,
  hasOpenRouterKey,
} from "@/lib/services/openrouter";
import {
  callOpenAIAPI,
  streamOpenAIAPI,
  hasOpenAIKey,
} from "@/lib/services/openai";

/**
 * AI聊天API路由
 * 处理AI对话请求，使用 OpenRouter API
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      message,
      messages,
      config,
    }: {
      message?: string;
      messages?: AIMessage[];
      config?: AIRequestConfig;
    } = body;

    // 验证输入：必须有 message 或 messages
    if (!message && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Message or messages are required" },
        { status: 400 }
      );
    }

    // 构建消息数组
    let conversationMessages: AIMessage[] = messages || [];

    // 如果有新消息，添加到对话历史
    if (message) {
      const userMessage: AIMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      conversationMessages = [...conversationMessages, userMessage];
    }

    // 确定使用哪个 API 服务
    const useOpenAI = hasOpenAIKey() && !hasOpenRouterKey();
    const useOpenRouter = hasOpenRouterKey();

    if (!useOpenAI && !useOpenRouter) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY or OPENROUTER_API_KEY must be configured",
        },
        { status: 500 }
      );
    }

    // 如果启用流式响应
    if (config?.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let thinkingBuffer = "";

            if (useOpenAI) {
              await streamOpenAIAPI(
                conversationMessages,
                config || {},
                (chunk: string) => {
                  // 检测思考过程（OpenAI的某些模型可能包含思考标记）
                  if (chunk.includes("<think>") || chunk.includes("</think>")) {
                    thinkingBuffer += chunk;
                    const thinkingMatch = chunk.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkingMatch) {
                      const data = `data: ${JSON.stringify({ thinking: thinkingMatch[1] })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                    }
                  } else {
                    const data = `data: ${JSON.stringify({ chunk })}\n\n`;
                    controller.enqueue(encoder.encode(data));
                  }
                }
              );
            } else {
              await streamOpenRouterAPI(
                conversationMessages,
                config || {},
                (chunk: string) => {
                  // 检测思考过程（OpenRouter可能返回思考标记）
                  if (chunk.includes("<think>") || chunk.includes("</think>")) {
                    thinkingBuffer += chunk;
                    const thinkingMatch = chunk.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkingMatch) {
                      const data = `data: ${JSON.stringify({ thinking: thinkingMatch[1] })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                    }
                  } else {
                    const data = `data: ${JSON.stringify({ chunk })}\n\n`;
                    controller.enqueue(encoder.encode(data));
                  }
                }
              );
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Stream error";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: errorMessage })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 非流式响应
    const response = useOpenAI
      ? await callOpenAIAPI(conversationMessages, config)
      : await callOpenRouterAPI(conversationMessages, config);

    const aiResponse: AIResponse = {
      content: response.content,
      model: response.model,
      tokens: response.tokens,
      finishReason: response.finishReason,
    };

    return NextResponse.json({
      success: true,
      data: aiResponse,
    } as ApiResponse<AIResponse>);
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI request failed",
      },
      { status: 500 }
    );
  }
}

