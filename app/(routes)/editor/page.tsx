"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import type { EditorContent } from "@/types/editor";

/**
 * 编辑器页面
 * 富文本协作编辑
 */
export default function EditorPage(): JSX.Element {
  const [content, setContent] = useState<EditorContent>("");

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
    </div>
  );
}

