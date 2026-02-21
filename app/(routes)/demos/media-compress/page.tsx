"use client";

import dynamic from "next/dynamic";

const MediaCompressDemo = dynamic(
  () => import("./components/media-compress-demo"),
  { ssr: false }
);

export default function MediaCompressPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">音视频压缩性能 Demo</h1>
      <p className="mb-8 text-muted-foreground">
        对比浏览器原生压缩与 FFmpeg.wasm 压缩效果与耗时，帮助选择合适方案
      </p>
      <MediaCompressDemo />
    </div>
  );
}
