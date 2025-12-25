"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils/cn";

/**
 * 消息内容组件属性
 */
interface MessageContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

/**
 * 检测URL是否为图片
 */
function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

/**
 * 检测URL是否为视频
 */
function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv)(\?.*)?$/i.test(url);
}

/**
 * 检测URL是否为音频
 */
function isAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url);
}

/**
 * 提取内容中的媒体URL
 */
function extractMediaUrls(content: string): {
  images: string[];
  videos: string[];
  audios: string[];
} {
  const urlRegex = /(https?:\/\/[^\s\)]+)/gi;
  const urls = content.match(urlRegex) || [];
  
  const images: string[] = [];
  const videos: string[] = [];
  const audios: string[] = [];

  for (const url of urls) {
    if (isImageUrl(url)) {
      images.push(url);
    } else if (isVideoUrl(url)) {
      videos.push(url);
    } else if (isAudioUrl(url)) {
      audios.push(url);
    }
  }

  return { images, videos, audios };
}

/**
 * 代码块组件属性
 */
interface CodeBlockProps {
  language: string;
  code: string | React.ReactNode;
  className?: string;
  isReactNode?: boolean;
}

/**
 * 代码块组件 - 包含语言标签、复制按钮和 LaTeX 预览
 */
function CodeBlock({ language, code, className, isReactNode = false }: CodeBlockProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<"latex" | "mermaid" | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const isLatex = language === "latex" || language === "tex";
  const isMermaid = language === "mermaid";

  /**
   * 提取纯文本用于复制
   */
  const getTextContent = (): string => {
    if (typeof code === "string") {
      return code;
    }
    // 如果是 ReactNode，提取文本内容
    if (isReactNode && code) {
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === "string") return node;
        if (typeof node === "number") return String(node);
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node && typeof node === "object" && "props" in node) {
          const props = (node as any).props;
          if (props.dangerouslySetInnerHTML) {
            // 从 HTML 中提取文本（使用正则表达式，避免使用 document）
            const html = props.dangerouslySetInnerHTML.__html;
            // 移除 HTML 标签，保留文本内容
            return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
          }
          return extractText(props.children || "");
        }
        return "";
      };
      return extractText(code);
    }
    return String(code);
  };

  /**
   * 复制代码到剪贴板
   */
  const handleCopy = async () => {
    try {
      const textContent = getTextContent();
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  /**
   * 渲染 LaTeX 预览
   */
  const renderLatexPreview = () => {
    if (!isLatex) return null;

    try {
      const textContent = getTextContent();
      // 尝试渲染 LaTeX
      const html = katex.renderToString(textContent, {
        throwOnError: false,
        displayMode: true,
      });
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      return (
        <div className="text-red-500 text-sm">
          渲染错误: {err instanceof Error ? err.message : "未知错误"}
        </div>
      );
    }
  };

  /**
   * 获取文本内容（用于 useEffect）
   */
  const textContent = useMemo(() => getTextContent(), [code, isReactNode]);

  /**
   * 渲染 Mermaid 流程图
   */
  useEffect(() => {
    if (showPreview && previewType === "mermaid" && mermaidRef.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // 清空容器
      mermaidRef.current.innerHTML = "";
      
      // 创建新的 div 用于渲染
      const mermaidDiv = document.createElement("div");
      mermaidDiv.id = id;
      mermaidDiv.className = "mermaid";
      mermaidRef.current.appendChild(mermaidDiv);

      // 初始化 mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
        securityLevel: "loose",
      });

      // 渲染 mermaid
      mermaid
        .render(id, textContent)
        .then((result) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = result.svg;
          }
        })
        .catch((err) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<div class="text-red-500 text-sm p-4">渲染错误: ${err.message || "未知错误"}</div>`;
          }
        });
    }
  }, [showPreview, previewType, textContent]);

  /**
   * 处理预览按钮点击
   */
  const handlePreviewClick = () => {
    if (isLatex) {
      setPreviewType("latex");
    } else if (isMermaid) {
      setPreviewType("mermaid");
    }
    setShowPreview(!showPreview);
  };

  /**
   * 获取语言显示名称
   */
  const getLanguageName = (lang: string): string => {
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      ts: "TypeScript",
      jsx: "JSX",
      tsx: "TSX",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      scala: "Scala",
      sh: "Shell",
      bash: "Bash",
      sql: "SQL",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
      md: "Markdown",
      latex: "LaTeX",
      tex: "LaTeX",
      mermaid: "Mermaid",
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className={cn("relative group my-4 rounded-lg overflow-hidden border ", className)}>
      {/* 代码块头部 - 语言标签和按钮 */}
      <div className="flex items-center justify-between px-4 py-2  border-b ">
        {/* 左侧：语言标签 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
            {getLanguageName(language)}
          </span>
        </div>

        {/* 右侧：预览和复制按钮 */}
        <div className="flex items-center gap-2">
          {/* LaTeX/Mermaid 预览按钮 */}
          {(isLatex || isMermaid) && (
            <button
              onClick={handlePreviewClick}
              className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
              title={isLatex ? "预览 LaTeX" : "预览 Mermaid"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 hover:text-gray-200"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}

          {/* 复制按钮 */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            title={copied ? "已复制" : "复制代码"}
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 hover:text-gray-200"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* LaTeX/Mermaid 预览模态框 */}
      {showPreview && (isLatex || isMermaid) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {previewType === "latex" ? "LaTeX 预览" : "Mermaid 流程图预览"}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewType(null);
                }}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 min-h-[200px] flex items-center justify-center">
              {previewType === "latex" ? (
                renderLatexPreview()
              ) : previewType === "mermaid" ? (
                <div ref={mermaidRef} className="w-full flex items-center justify-center" />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 代码内容 */}
      <pre className="bg-gray-900 dark:bg-gray-800 p-4 overflow-x-auto m-0">
        {isReactNode ? (
          <code className={className}>{code as React.ReactNode}</code>
        ) : typeof code === "string" && code.includes("<") ? (
          <code className={className} dangerouslySetInnerHTML={{ __html: code }} />
        ) : (
          <code className={className}>{code}</code>
        )}
      </pre>
    </div>
  );
}

/**
 * Markdown消息内容组件
 * 支持Markdown渲染、代码高亮、图片、视频、音频等多媒体内容
 */
export function MessageContent({
  content,
  isUser = false,
  className,
}: MessageContentProps): JSX.Element {
  const mediaUrls = extractMediaUrls(content);

  return (
    <div className={cn("space-y-3", className)}>
      {/* 思考过程 - 从metadata中获取 */}
      {content.includes("<think>") && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
              💭 思考过程
            </summary>
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
              {content.match(/<think>([\s\S]*?)<\/think>/)?.[1] || ""}
            </div>
          </details>
        </div>
      )}

      {/* 图片 */}
      {mediaUrls.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {mediaUrls.images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Image ${index + 1}`}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(url, "_blank")}
            />
          ))}
        </div>
      )}

      {/* 视频 */}
      {mediaUrls.videos.length > 0 && (
        <div className="space-y-2">
          {mediaUrls.videos.map((url, index) => (
            <video
              key={index}
              src={url}
              controls
              className="rounded-lg max-w-full"
            >
              您的浏览器不支持视频播放
            </video>
          ))}
        </div>
      )}

      {/* 音频 */}
      {mediaUrls.audios.length > 0 && (
        <div className="space-y-2">
          {mediaUrls.audios.map((url, index) => (
            <audio key={index} src={url} controls className="w-full">
              您的浏览器不支持音频播放
            </audio>
          ))}
        </div>
      )}

      {/* Markdown内容 */}
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-headings:font-semibold",
          "prose-p:leading-relaxed",
          "prose-ul:list-disc prose-ol:list-decimal",
          "prose-li:my-1",
          "prose-strong:font-semibold",
          "prose-em:italic",
          isUser && "prose-invert"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkCjkFriendly, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
          components={{
            // 自定义代码块样式
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !className;
              
              // 内联代码
              if (isInline) {
                return (
                  <code
                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              
              // 代码块
              if (match) {
                const language = match[1];
                
                // 处理 children，可能是字符串、数组或 React 元素
                let codeContent: string = "";
                
                if (typeof children === "string") {
                  codeContent = children;
                } else if (Array.isArray(children)) {
                  // 检查是否包含 React 元素（来自 highlight.js）
                  const hasReactElements = children.some(
                    (child: any) => child && typeof child === "object" && child.type
                  );
                  
                  if (hasReactElements) {
                    // 如果包含 React 元素，我们需要保留原始结构
                    // 但为了传递给 CodeBlock，我们需要提取 HTML
                    // 这里我们直接传递 children，让 CodeBlock 处理
                    return (
                      <CodeBlock
                        language={language}
                        code={children as any}
                        className={className}
                        isReactNode={true}
                      />
                    );
                  } else {
                    codeContent = children.map(String).join("");
                  }
                } else if (children && typeof children === "object") {
                  // 可能是 React 元素，检查是否有 dangerouslySetInnerHTML
                  const props = (children as any).props;
                  if (props?.dangerouslySetInnerHTML) {
                    codeContent = props.dangerouslySetInnerHTML.__html;
                  } else {
                    codeContent = String(children);
                  }
                } else {
                  codeContent = String(children);
                }
                
                const cleanedCode = codeContent.replace(/\n$/, "");
                
                return (
                  <CodeBlock
                    language={language}
                    code={cleanedCode}
                    className={className}
                  />
                );
              }
              
              // 没有语言标识的代码块
              return (
                <div className="relative my-4">
                  <pre className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-700 dark:border-gray-600">
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
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              />
            ),
            // 自定义图片样式（避免重复显示）
            img: ({ src, ...props }) => {
              // 如果已经在媒体区域显示，则不在这里显示
              if (src && mediaUrls.images.includes(src)) {
                return null;
              }
              return (
                <img
                  {...props}
                  src={src}
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                  onClick={() => src && window.open(src, "_blank")}
                  alt="Markdown image"
                />
              );
            },
            // 自定义表格样式
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
              </div>
            ),
          }}
        >
          {content.replace(/<think>[\s\S]*?<\/think>/g, "")}
        </ReactMarkdown>
      </div>
    </div>
  );
}

