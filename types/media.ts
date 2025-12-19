/**
 * 音视频媒体相关类型定义
 */

/**
 * 媒体文件类型
 */
export type MediaType = "video" | "audio" | "image";

/**
 * 媒体文件信息
 */
export interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;
  duration?: number; // 视频/音频时长（秒）
  width?: number; // 视频/图片宽度
  height?: number; // 视频/图片高度
  url: string;
  thumbnail?: string; // 缩略图URL
  createdAt: number;
  updatedAt: number;
}

/**
 * 视频编辑操作类型
 */
export type VideoEditOperation =
  | "trim" // 裁剪
  | "merge" // 合并
  | "split" // 分割
  | "rotate" // 旋转
  | "scale" // 缩放
  | "filter" // 滤镜
  | "transition"; // 转场

/**
 * 视频编辑操作
 */
export interface VideoEditAction {
  id: string;
  operation: VideoEditOperation;
  startTime?: number; // 开始时间（秒）
  endTime?: number; // 结束时间（秒）
  params?: Record<string, unknown>; // 操作参数
}

/**
 * 视频编辑项目
 */
export interface VideoProject {
  id: string;
  name: string;
  mediaFiles: MediaFile[];
  timeline: VideoEditAction[];
  duration: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * 导出格式
 */
export type ExportFormat = "mp4" | "webm" | "mov" | "avi" | "mp3" | "wav";

/**
 * 导出配置
 */
export interface ExportConfig {
  format: ExportFormat;
  quality: "low" | "medium" | "high" | "ultra";
  resolution?: {
    width: number;
    height: number;
  };
  bitrate?: number;
  framerate?: number;
}

