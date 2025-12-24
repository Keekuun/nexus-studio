import { NextResponse } from "next/server";
import {
  getAvailableModels,
  hasOpenRouterKey,
} from "@/lib/services/openrouter";
import { getOpenAIModels, hasOpenAIKey } from "@/lib/services/openai";
import type { ApiResponse } from "@/types";

/**
 * AI模型列表API路由
 * 返回可用的AI模型列表
 */
export async function GET(): Promise<NextResponse> {
  try {
    let models: string[] = [];
    let defaultModel = "";

    // 如果配置了 OpenRouter，使用 OpenRouter 模型
    if (hasOpenRouterKey()) {
      models = getAvailableModels();
      defaultModel =
        process.env.OPENROUTER_DEFAULT_MODEL || models[0] || "";
    }
    // 如果只配置了 OpenAI，使用 OpenAI 模型
    else if (hasOpenAIKey()) {
      models = getOpenAIModels();
      defaultModel = process.env.OPENAI_DEFAULT_MODEL || models[0] || "";
    }
    // 如果都没有配置，返回错误
    else {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY or OPENROUTER_API_KEY must be configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        models,
        defaultModel,
      },
    } as ApiResponse<{ models: string[]; defaultModel: string }>);
  } catch (error) {
    console.error("Get models error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get models",
      },
      { status: 500 }
    );
  }
}

