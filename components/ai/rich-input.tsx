"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Card } from "./extensions/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, StickerIcon } from "lucide-react";

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: RichInputProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      } as any),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class:
            "w-[100px] h-[100px] object-cover rounded-md inline-block align-middle mx-1",
        },
      }),
      Card,
      Placeholder.configure({
        placeholder: placeholder || "输入消息...",
      }),
    ],
    content: value, // 初始内容
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[44px] px-3 py-2.5",
      },
      handleKeyDown: (view, event) => {
        // Enter 发送，Shift+Enter 换行
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          // 确保内容不为空（排除只有空白标签的情况）
          if (editor && !editor.isEmpty) {
            onSubmit();
          }
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // 提取纯文本用于判断是否为空，提取 HTML 用于发送
      const html = editor.getHTML();
      const text = editor.getText();
      // 如果只有空标签，视为无效
      if (
        !text.trim() &&
        !html.includes("<img") &&
        !html.includes('data-type="card"')
      ) {
        onChange("");
      } else {
        onChange(html);
      }
    },
    immediatelyRender: false,
  });

  // 监听外部 value 变化（主要是清空操作）
  useEffect(() => {
    if (editor && value === "") {
      // 只有当编辑器当前不为空时才清空，避免死循环
      if (!editor.isEmpty) {
        editor.commands.clearContent();
      }
    }
  }, [value, editor]);

  // 监听 disabled 状态
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const addImage = () => {
    const url = window.prompt("请输入图片 URL (支持 http/https 链接):");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addCard = (label: string, value: string) => {
    if (editor) {
      // 在光标处插入一个空格，然后插入卡片，再插入一个空格，体验更好
      editor
        .chain()
        .focus()
        .insertContent(" ")
        .insertContent({
          type: "card",
          attrs: { label, value },
        })
        .insertContent(" ")
        .run();
    }
  };

  if (!editor) return null;

  return (
    <div
      className={`flex flex-col rounded-lg border bg-background transition-all ${disabled ? "cursor-not-allowed opacity-50" : "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"}`}
    >
      <EditorContent
        editor={editor}
        className="max-h-[200px] flex-1 overflow-y-auto"
      />

      <div className="flex items-center gap-1 border-t bg-muted/30 p-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={addImage}
          type="button"
          disabled={disabled}
          title="插入图片"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => addCard("🐻 Image", "like")}
          type="button"
          disabled={disabled}
          title="插入喜欢标签"
        >
          <StickerIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => addCard("🎥 Video", "dislike")}
          type="button"
          disabled={disabled}
          title="插入视频标签"
        >
          <span className="text-xs font-bold">V</span>
        </Button>
      </div>
    </div>
  );
}
