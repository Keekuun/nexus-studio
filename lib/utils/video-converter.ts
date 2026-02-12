import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export type VideoQuality = "original" | "1080p" | "720p" | "480p";

export interface TranscodeOptions {
  quality?: VideoQuality;
  fps?: number;
  bitrate?: string; // e.g. "2500k", if provided, overrides CRF
}

export interface VideoConverterOptions {
  coreURL?: string;
  wasmURL?: string;
  workerURL?: string;
}

export class VideoConverter {
  private ffmpeg: FFmpeg;
  private baseURL =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

  constructor() {
    this.ffmpeg = new FFmpeg();
    this.ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
  }

  public get isLoaded(): boolean {
    return this.ffmpeg.loaded;
  }

  /**
   * 加载 FFmpeg 核心
   */
  async load(options?: VideoConverterOptions): Promise<void> {
    if (this.ffmpeg.loaded) return;

    try {
      const coreURL =
        options?.coreURL ||
        (await toBlobURL(`${this.baseURL}/ffmpeg-core.js`, "text/javascript"));
      const wasmURL =
        options?.wasmURL ||
        (await toBlobURL(
          `${this.baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ));
      const workerURL =
        options?.workerURL ||
        (await toBlobURL(
          `${this.baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ));

      await this.ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });
    } catch (err) {
      console.error("FFmpeg load failed:", err);
      throw new Error(
        "FFmpeg failed to load. Transcoding is unavailable. Please check your network or refresh."
      );
    }
  }

  /**
   * 清理文件
   */
  private async cleanup(files: string[]): Promise<void> {
    for (const f of files) {
      try {
        await this.ffmpeg.deleteFile(f);
      } catch (e) {
        // ignore
      }
    }
  }

  private getScaleFilter(quality: VideoQuality): string[] {
    switch (quality) {
      case "1080p":
        return ["-vf", "scale=1920:-2"];
      case "720p":
        return ["-vf", "scale=1280:-2"];
      case "480p":
        return ["-vf", "scale=854:-2"];
      case "original":
      default:
        return [];
    }
  }

  /**
   * 将 Blob 转换为 MP4
   */
  async convertToMp4(
    blob: Blob,
    options: TranscodeOptions = {}
  ): Promise<Blob> {
    if (!this.ffmpeg.loaded) throw new Error("FFmpeg not loaded");
    if (blob.size === 0) throw new Error("Recording data is empty");

    const { quality = "1080p", fps = 30, bitrate } = options;

    try {
      await this.cleanup(["input.webm", "output.mp4"]);
      await this.ffmpeg.writeFile("input.webm", await fetchFile(blob));

      const args = [
        "-i",
        "input.webm",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
      ];

      // 如果指定了码率，则使用码率控制，否则使用 CRF
      if (bitrate) {
        args.push("-b:v", bitrate);
      } else {
        args.push("-crf", "28");
      }

      // 帧率控制
      if (fps) {
        args.push("-r", fps.toString());
      }

      args.push(...this.getScaleFilter(quality), "-c:a", "aac", "output.mp4");

      await this.ffmpeg.exec(args);

      const data = await this.ffmpeg.readFile("output.mp4");
      if (data.length === 0)
        throw new Error("Transcoding generated an empty file");

      const mp4Blob = new Blob([new Uint8Array(data as any)], {
        type: "video/mp4",
      });

      return mp4Blob;
    } finally {
      await this.cleanup(["input.webm", "output.mp4"]);
    }
  }

  /**
   * Extract video track only (Pure Video)
   */
  async extractVideoOnly(
    blob: Blob,
    format: "webm" | "mp4",
    options: TranscodeOptions = {}
  ): Promise<Blob> {
    if (!this.ffmpeg.loaded) throw new Error("FFmpeg not loaded");

    const { quality = "1080p", fps = 30, bitrate } = options;
    const outputFile = format === "webm" ? "video_only.webm" : "video_only.mp4";

    try {
      await this.cleanup(["input.webm", outputFile]);
      await this.ffmpeg.writeFile("input.webm", await fetchFile(blob));

      const args = ["-i", "input.webm", "-an"];
      if (format === "webm") {
        args.push("-c:v", "copy");
      } else {
        args.push("-c:v", "libx264", "-preset", "ultrafast");

        if (bitrate) {
          args.push("-b:v", bitrate);
        } else {
          args.push("-crf", "28");
        }

        if (fps) {
          args.push("-r", fps.toString());
        }

        args.push(...this.getScaleFilter(quality));
      }
      args.push(outputFile);

      await this.ffmpeg.exec(args);

      const data = await this.ffmpeg.readFile(outputFile);
      if (data.length === 0) throw new Error("Generated file is empty");

      const videoBlob = new Blob([new Uint8Array(data as any)], {
        type: format === "webm" ? "video/webm" : "video/mp4",
      });

      return videoBlob;
    } finally {
      await this.cleanup(["input.webm", outputFile]);
    }
  }

  /**
   * Extract audio track only (Pure Audio)
   */
  async extractAudioOnly(blob: Blob): Promise<Blob> {
    if (!this.ffmpeg.loaded) throw new Error("FFmpeg not loaded");

    try {
      await this.cleanup(["input.webm", "audio.mp3"]);
      await this.ffmpeg.writeFile("input.webm", await fetchFile(blob));

      await this.ffmpeg.exec([
        "-i",
        "input.webm",
        "-vn",
        "-c:a",
        "libmp3lame",
        "-q:a",
        "4",
        "audio.mp3",
      ]);

      const data = await this.ffmpeg.readFile("audio.mp3");
      if (data.length === 0) throw new Error("Generated file is empty");

      const audioBlob = new Blob([new Uint8Array(data as any)], {
        type: "audio/mpeg",
      });

      return audioBlob;
    } finally {
      await this.cleanup(["input.webm", "audio.mp3"]);
    }
  }
}

// 导出单例，方便直接使用
export const videoConverter = new VideoConverter();
