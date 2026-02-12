"use client";

import dynamic from "next/dynamic";

const ImageConversionDemo = dynamic(
  () => import("./components/image-conversion-demo"),
  { ssr: false }
);

export default function ImageConversionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">图片格式转换 Demo</h1>
      <p className="mb-8 text-gray-600">
        使用 use-img-to-webp hook 将 HEIC、HEIF、TIFF、JPG、PNG 等格式转换为
        WebP 格式
      </p>
      <ImageConversionDemo />
    </div>
  );
}
