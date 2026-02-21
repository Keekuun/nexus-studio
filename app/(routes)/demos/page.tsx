"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 案例演示页面
 * 统一管理所有技术调研和案例演示
 */
export default function DemosPage(): JSX.Element {
  const demos = [
    {
      id: "canvas-annotation",
      title: "Canvas 批注演示",
      description: "Markdown 文章展示 + Fabric.js 画布批注 + 图片融合功能演示",
      href: "/demos/canvas-annotation",
      tags: ["Canvas", "Fabric.js", "Markdown", "图片处理"],
      status: "已完成",
    },
    {
      id: "feishu-doc",
      title: "类飞书文档交互",
      description:
        "Tiptap + React 实现的文档交互，支持嵌套 Block 高亮、边缘检测、评论锚定等功能",
      href: "/demos/feishu-doc",
      tags: ["Tiptap", "ProseMirror", "Block Selection", "Comments"],
      status: "已完成",
    },
    {
      id: "slate-doc",
      title: "Slate.js 文档交互",
      description:
        "Slate.js + React 实现的文档交互，支持评论双向铆定、SSE 流式加载模拟、自定义 Block 等功能",
      href: "/demos/slate-doc",
      tags: ["Slate.js", "React", "Comments", "SSE"],
      status: "已完成",
    },
    {
      id: "chat-voice",
      title: "实时语音对话 Demo",
      description: "基于 Web Speech API 和 Next.js 的实时语音对话演示",
      href: "/demos/chat",
      tags: ["Web Speech API", "Next.js", "实时语音"],
      status: "已完成",
    },
    {
      id: "screen-recorder",
      title: "屏幕录制 Demo",
      description: "基于 React Media Recorder 实现的浏览器原生屏幕录制功能",
      href: "/demos/screen-recorder",
      tags: ["Screen Recording", "React Media Recorder", "Web API"],
      status: "已完成",
    },
    {
      id: "image-conversion",
      title: "图片格式转换 Demo",
      description:
        "使用 use-img-to-webp hook 将 HEIC、HEIF、TIFF 等格式转换为 WebP 格式",
      href: "/demos/image-conversion",
      tags: ["图片处理", "格式转换", "WebP", "HEIC"],
      status: "已完成",
    },
    {
      id: "media-compress",
      title: "音视频压缩性能对比",
      description: "基于浏览器原生硬件编码与 FFmpeg.wasm 的音视频压缩性能测试",
      href: "/demos/media-compress",
      tags: ["视频压缩", "MediaRecorder", "WebCodecs", "FFmpeg.wasm"],
      status: "进行中",
    },
    // 后续可以在这里添加更多案例
    // {
    //   id: "example-demo",
    //   title: "示例演示",
    //   description: "这是一个示例演示的描述",
    //   href: "/example-demo",
    //   tags: ["示例"],
    //   status: "开发中",
    // },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">案例演示</h1>
        <p className="text-muted-foreground">
          技术调研和功能演示集合，用于验证和展示各种技术方案
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Card key={demo.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{demo.title}</CardTitle>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    demo.status === "已完成"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {demo.status}
                </span>
              </div>
              <CardDescription>{demo.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="mb-4 flex flex-wrap gap-2">
                {demo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="w-full">
                <Link href={demo.href}>查看演示</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {demos.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>暂无案例演示</p>
        </div>
      )}
    </div>
  );
}
