"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Markdown 文章组件属性
 */
interface MarkdownArticleProps {
  content: string;
}

/**
 * Markdown 文章组件
 * 用于展示 markdown 格式的文章内容
 */
export function MarkdownArticle({ content }: MarkdownArticleProps): JSX.Element {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCjkFriendly, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
        components={{
          // 自定义代码块样式
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            if (match) {
              return (
                <div className="relative my-4">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 rounded-t-lg">
                    <span className="text-xs font-medium uppercase">
                      {match[1]}
                    </span>
                  </div>
                  <pre className="bg-gray-900 p-4 overflow-x-auto rounded-b-lg m-0">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <div className="relative my-4">
                <pre className="bg-gray-900 p-4 overflow-x-auto rounded-lg m-0">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // 自定义链接样式
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            />
          ),
          // 自定义图片样式
          img: ({ src, ...props }) => (
            <img
              {...props}
              src={src}
              className="rounded-lg max-w-full h-auto shadow-md"
              alt="Article image"
            />
          ),
          // 自定义表格样式
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border-collapse border border-gray-300"
                {...props}
              />
            </div>
          ),
          // 自定义视频样式，确保可播放
          video: ({ ...props }) => (
            <video
              {...props}
              controls
              className="w-full rounded-lg border border-gray-200 shadow-sm"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

