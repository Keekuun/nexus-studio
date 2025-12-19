import { NextRequest, NextResponse } from "next/server";
import type { MediaFile, MediaType } from "@/types/media";

/**
 * 媒体文件上传API路由
 * 处理音视频文件上传
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // 确定媒体类型
    let mediaType: MediaType;
    if (file.type.startsWith("video/")) {
      mediaType = "video";
    } else if (file.type.startsWith("audio/")) {
      mediaType = "audio";
    } else {
      mediaType = "image";
    }

    // 在实际应用中，这里应该：
    // 1. 将文件保存到存储服务（如S3、OSS等）
    // 2. 生成缩略图（对于视频）
    // 3. 提取元数据（时长、分辨率等）
    // 4. 保存到数据库

    // 模拟返回文件信息
    const mediaFile: MediaFile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: file.name,
      type: mediaType,
      mimeType: file.type,
      size: file.size,
      url: `/uploads/${file.name}`, // 实际应该是存储服务的URL
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: mediaFile,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

