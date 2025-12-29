"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import type { EditorContent } from "@/types/editor";
import CollaborativeEditor from "@/components/collaboration/CollaborativeEditor";

/**
 * 编辑器页面
 * 富文本协作编辑
 */
export default function EditorPage(): JSX.Element {
  const [content, setContent] = useState<EditorContent>("");
  const [user, setUser] = useState<{ name: string; color: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // 在客户端挂载后生成用户信息，避免 SSR hydration 错误
  useEffect(() => {
    setMounted(true);
    if (!user) {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF2'];
      // 使用稳定的随机种子（基于时间戳），确保每次刷新时用户信息一致
      const seed = Math.floor(Date.now() / 10000); // 每10秒变化一次
      const randomName = names[seed % names.length];
      const randomColor = colors[seed % colors.length];
      setUser({ name: randomName, color: randomColor });
    }
  }, [user]);

  const handleExport = (): void => {
    // 导出功能
    if (typeof content === "string") {
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.html";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">编辑器</h1>
          <p className="text-muted-foreground">富文本协作编辑</p>
        </div>
        <Button onClick={handleExport}>导出</Button>
      </div>

      <RichTextEditor content={content} onChange={setContent} />

      <hr/>

      <p className="text-center text-gray-600 mb-8">
        打开多个浏览器窗口或标签页来测试实时协作。所有窗口都将同步。
      </p>

      {mounted && user && (
        <>
          <CollaborativeEditor user={user} documentName="my-first-document" />

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>当前用户: <strong style={{ color: user.color }}>{user.name}</strong></p>
            <p>你可以手动刷新页面或打开新窗口来模拟不同的用户。</p>
          </div>
        </>
      )}
      
      {!mounted && (
        <div className="text-center text-sm text-gray-500 py-8">
          加载中...
        </div>
      )}
    </div>
  );
}
