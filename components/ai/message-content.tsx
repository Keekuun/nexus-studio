"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
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
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // 自定义代码块样式
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !className;
              return !isInline && match ? (
                <div className="relative">
                  <pre className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto border border-gray-700 dark:border-gray-600">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
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

