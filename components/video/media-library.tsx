"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useMediaUpload } from "@/lib/hooks/use-media-upload";
import type { MediaFile } from "@/types/media";

/**
 * 媒体库组件Props接口
 */
export interface MediaLibraryProps {
  onSelectMedia?: (media: MediaFile) => void;
  className?: string;
}

/**
 * 媒体库组件
 * 显示和管理上传的媒体文件
 */
export function MediaLibrary({ onSelectMedia, className }: MediaLibraryProps): JSX.Element {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const { uploading, error, uploadFile } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedFile = await uploadFile(file);
    if (uploadedFile) {
      setMediaFiles((prev) => [uploadedFile, ...prev]);
      onSelectMedia?.(uploadedFile);
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">媒体库</h2>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/*,audio/*,image/*"
            className="hidden"
            id="media-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "上传中..." : "上传文件"}
          </Button>
        </div>
      </div>

      {error && <ErrorMessage error={error} onDismiss={() => {}} />}

      {uploading && <Loading text="上传中..." />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelectMedia?.(file)}
          >
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                <span className="text-4xl">
                  {file.type === "video" ? "🎬" : file.type === "audio" ? "🎵" : "🖼️"}
                </span>
              </div>
            )}
            <p className="mt-2 text-sm truncate" title={file.name}>
              {file.name}
            </p>
            {file.duration && (
              <p className="text-xs text-muted-foreground">
                {formatDuration(file.duration)}
              </p>
            )}
          </div>
        ))}
      </div>

      {mediaFiles.length === 0 && !uploading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无媒体文件</p>
          <p className="text-sm mt-2">点击&quot;上传文件&quot;按钮开始上传</p>
        </div>
      )}
    </div>
  );
}

/**
 * 格式化时长
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

