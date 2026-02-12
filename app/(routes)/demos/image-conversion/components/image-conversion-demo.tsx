"use client";

import { useState, useRef } from "react";
import { useImageToWebp } from "@/hooks/use-img-to-webp";

interface ConversionResult {
  original: File;
  converted: File | null;
  error?: string;
  loading: boolean;
}

export default function ImageConversionDemo() {
  const { convertToWebp, loading, error, clearError } = useImageToWebp();
  const [results, setResults] = useState<ConversionResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    clearError();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 添加到结果列表，标记为加载中
      setResults((prev) => [
        ...prev,
        {
          original: file,
          converted: null,
          loading: true,
        },
      ]);

      try {
        const convertedFile = await convertToWebp(file, {
          maxSize: 1920,
          quality: 0.8,
        });

        setResults((prev) =>
          prev.map((item) =>
            item.original === file
              ? { ...item, converted: convertedFile, loading: false }
              : item
          )
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "转换失败";
        setResults((prev) =>
          prev.map((item) =>
            item.original === file
              ? { ...item, error: errorMessage, loading: false }
              : item
          )
        );
      }
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCompressionRatio = (
    original: File,
    converted: File | null
  ): string => {
    if (!converted) return "-";
    const ratio = (converted.size / original.size) * 100;
    return ratio.toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".heic,.heif,.tiff,.tif,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />
        <div className="space-y-4">
          <div className="text-6xl">📸</div>
          <h2 className="text-xl font-semibold">选择图片文件进行转换</h2>
          <p className="text-gray-600">
            支持 HEIC、HEIF、TIFF、JPG、PNG 格式转换为 WebP
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="rounded-md bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "处理中..." : "选择文件"}
          </button>
        </div>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-red-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">错误</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 转换结果列表 */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">转换结果</h3>
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{result.original.name}</h4>
                    <p className="text-sm text-gray-600">
                      原始: {formatFileSize(result.original.size)} •{" "}
                      {result.original.type}
                    </p>
                  </div>

                  {result.loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  ) : result.converted ? (
                    <div className="text-right">
                      <p className="text-sm text-green-600">
                        {formatFileSize(result.converted.size)} •{" "}
                        {result.converted.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        压缩率:{" "}
                        {getCompressionRatio(result.original, result.converted)}
                      </p>
                    </div>
                  ) : result.error ? (
                    <div className="text-sm text-red-600">{result.error}</div>
                  ) : null}
                </div>

                {/* 预览区域 */}
                {result.converted && (
                  <div className="mt-4 flex space-x-4">
                    <div className="flex-1">
                      <p className="mb-2 text-sm font-medium">原始图片预览</p>
                      <img
                        src={URL.createObjectURL(result.original)}
                        alt="Original"
                        className="h-32 w-full rounded border object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="mb-2 text-sm font-medium">转换后预览</p>
                      <img
                        src={URL.createObjectURL(result.converted)}
                        alt="Converted"
                        className="h-32 w-full rounded border object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">功能特性</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 支持 HEIC/HEIF/TIFF/JPG/PNG 转 WebP</li>
          <li>• 自动图片压缩和尺寸优化</li>
          <li>• 批量文件处理</li>
          <li>• 实时预览转换效果</li>
          <li>• 显示压缩率和文件大小对比</li>
        </ul>
      </div>
    </div>
  );
}
