"use client";

import { ChatInterface } from "@/components/ai/chat-interface";

/**
 * AI交互页面
 * AI助手对话界面
 */
export default function AIPage(): JSX.Element {
  return (
    <div className="container mx-auto p-6 flex-1 flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI助手</h1>
        <p className="text-muted-foreground">与AI进行对话，获取智能建议和帮助</p>
      </div>

      <div className="border rounded-lg flex-1">
        <ChatInterface />
      </div>
    </div>
  );
}

