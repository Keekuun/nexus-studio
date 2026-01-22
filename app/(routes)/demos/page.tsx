"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      description: "Tiptap + React 实现的文档交互，支持嵌套 Block 高亮、边缘检测、评论锚定等功能",
      href: "/demos/feishu-doc",
      tags: ["Tiptap", "ProseMirror", "Block Selection", "Comments"],
      status: "已完成",
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
    <div className="container mx-auto p-6 space-y-6">
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
                  className={`text-xs px-2 py-1 rounded ${
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
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="flex flex-wrap gap-2 mb-4">
                {demo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded"
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
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无案例演示</p>
        </div>
      )}
    </div>
  );
}

