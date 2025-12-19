"use client";

import { useState } from "react";
import { MediaLibrary } from "@/components/video/media-library";
import { VideoPlayer } from "@/components/video/video-player";
import type { MediaFile } from "@/types/media";

/**
 * 工作室页面
 * 音视频编辑工作台
 */
export default function StudioPage(): JSX.Element {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">工作室</h1>
        <p className="text-muted-foreground">音视频编辑工作台</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedMedia ? (
            <VideoPlayer mediaFile={selectedMedia} />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <p className="text-muted-foreground">请从媒体库中选择一个文件</p>
            </div>
          )}
        </div>

        <div>
          <MediaLibrary onSelectMedia={setSelectedMedia} />
        </div>
      </div>
    </div>
  );
}

