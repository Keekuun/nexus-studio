"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { EditorContent as EditorContentType } from "@/types/editor";

/**
 * 富文本编辑器组件Props接口
 */
export interface RichTextEditorProps {
  content?: EditorContentType;
  onChange?: (content: EditorContentType) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

/**
 * 富文本编辑器组件
 * 基于Tiptap的富文本编辑器
 */
export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "开始输入...",
  className,
  editable = true,
}: RichTextEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: [StarterKit],
    content: typeof content === "string" ? content : JSON.stringify(content),
    editable,
    immediatelyRender: false, // 修复SSR问题
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      onChange?.(json);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
          className
        ),
      },
    },
  });

  if (!editor) {
    return <div className="border rounded-lg p-4">加载编辑器...</div>;
  }

  return (
    <div className="border rounded-lg">
      {editable && (
        <div className="border-b p-2 flex flex-wrap gap-2">
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </Button>
          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </Button>
          <Button
            variant={editor.isActive("strike") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          <Button
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
          <Button
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            •
          </Button>
          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1.
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            &quot;
          </Button>
          <Button
            variant={editor.isActive("codeBlock") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            &lt;/&gt;
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

