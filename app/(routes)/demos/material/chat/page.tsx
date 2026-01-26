"use client";

/**
 * 创意内容管理系统聊天页面
 * 设计参考：豆包 AI 聊天界面
 *
 * 功能说明：
 * 1. 聊天界面：上下布局，上方对话记录（AI左边，用户右边），底部输入框
 * 2. 消息类型：message-user、message-ai、message-ai-card（模块卡片）
 * 3. 模块卡片：Brief、CreativePlanning、VisualAsset、Storyboard、FinalVideo
 * 4. 布局切换：出现模块时变为左右布局（左边模块详情，右边对话）
 * 5. 模块详情：支持收起展开，展示 docs 字段内容
 */

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FlexibleDocument, DocumentType } from "../creative-types";

// ==================== 图标组件 ====================
const Icons = {
  NewChat: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Writing: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  AICreate: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6M9 15h6M9 12h6" />
    </svg>
  ),
  Cloud: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  More: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Chat: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Attachment: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  DeepThink: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Send: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Code: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Image: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Translate: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3M22 22l-5-10-5 10M14 18h6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Video: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Layers: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Film: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  Play: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
};

// ==================== 类型定义 ====================
type MessageType = "message-user" | "message-ai" | "message-ai-card";

interface BaseMessage {
  id: string;
  type: MessageType;
  timestamp: string;
}

interface UserMessage extends BaseMessage {
  type: "message-user";
  content: string;
  attachments?: { type: "image" | "video"; url: string; name: string }[];
}

interface AIMessage extends BaseMessage {
  type: "message-ai";
  content: string;
  media?: { type: "image" | "video"; url: string; thumbnailUrl?: string }[];
}

interface AICardMessage extends BaseMessage {
  type: "message-ai-card";
  content: string;
  document: FlexibleDocument;
}

type Message = UserMessage | AIMessage | AICardMessage;

interface HistoryItem {
  id: string;
  title: string;
  messages: Message[];
}

// ==================== 模块类型配置 ====================
const MODULE_CONFIG: Record<
  DocumentType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  brief: {
    label: "Brief",
    icon: <Icons.FileText />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  "creative-planning": {
    label: "创意策划",
    icon: <Icons.Layers />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  "visual-asset": {
    label: "视觉素材",
    icon: <Icons.Image />,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  storyboard: {
    label: "分镜脚本",
    icon: <Icons.Film />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  "final-video": {
    label: "成片视频",
    icon: <Icons.Play />,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

// ==================== Mock 数据 ====================

// 1. Brief 模块
const MOCK_BRIEF: FlexibleDocument = {
  type: "brief",
  id: "brief-001",
  title: "Brief V2 - 智能手表产品视频需求",
  createdAt: "2025-01-26T10:00:00Z",
  docs: [
    {
      id: "block-videoConfig-001",
      block: "视频配置",
      data: [
        { id: "kv-duration", key: "时长", value: "30秒" },
        { id: "kv-aspectRatio", key: "画面比例", value: "9:16（竖版）" },
        { id: "kv-resolution", key: "分辨率", value: "1080p" },
        { id: "kv-frameRate", key: "帧率", value: "30fps" },
        { id: "kv-codec", key: "编码格式", value: "H.264" },
      ],
    },
    {
      id: "block-contentRequirement-001",
      block: "内容需求",
      data: [
        { id: "kv-productName", key: "产品名称", value: "智能手表 Pro Max" },
        {
          id: "kv-productLink",
          key: "产品链接",
          value: "https://shop.example.com/watch-pro-max",
        },
        {
          id: "kv-platforms",
          key: "投放平台",
          value: ["抖音", "快手", "小红书", "视频号"],
        },
        {
          id: "kv-targetAudience",
          key: "目标人群",
          value: "18-35岁都市年轻白领",
        },
        {
          id: "kv-corePoints",
          key: "核心卖点",
          value: "血氧监测、7天超长续航、100+运动模式、时尚轻薄设计",
        },
        { id: "kv-budget", key: "预算", value: "15000元" },
      ],
    },
    {
      id: "block-referenceAssets-001",
      block: "参考素材",
      data: [
        {
          id: "kv-styleRef",
          key: "风格参考",
          value: "Apple Watch 广告、华为手表宣传片",
        },
        {
          id: "kv-toneRef",
          key: "调性参考",
          value: "科技感、年轻活力、健康生活",
        },
      ],
    },
  ],
};

// 2. CreativePlanning 模块
const MOCK_CREATIVE_PLANNING: FlexibleDocument = {
  type: "creative-planning",
  id: "creative-planning-001",
  title: "创意策划 V1 - 活力生活主题",
  createdAt: "2025-01-26T10:30:00Z",
  docs: [
    {
      id: "block-concepts-001",
      block: "创意概念",
      data: [
        { id: "kv-mainTheme", key: "主题", value: "活力每一刻" },
        { id: "kv-tagline", key: "广告语", value: "戴上Pro Max，掌控健康节奏" },
        {
          id: "kv-narrative",
          key: "叙事角度",
          value: "第一人称视角，展示都市白领一天的健康生活",
        },
      ],
    },
    {
      id: "block-creativeDirection-001",
      block: "创意方向",
      data: [
        {
          id: "kv-concept1",
          key: "方案A - 晨跑达人",
          value: {
            title: "晨跑达人",
            tags: ["运动", "健康监测"],
            description:
              "清晨6点，主角戴着手表开始晨跑，手表实时显示心率、配速，展现科技赋能运动的场景",
          },
        },
        {
          id: "kv-concept2",
          key: "方案B - 办公室精英",
          value: {
            title: "办公室精英",
            tags: ["久坐提醒", "血氧监测"],
            description:
              "办公室场景，手表提醒站立休息，一键测量血氧，展现对健康的关怀",
          },
        },
        {
          id: "kv-concept3",
          key: "方案C - 全场景生活",
          value: {
            title: "全场景生活",
            tags: ["综合展示"],
            description: "融合晨跑、办公、约会、睡眠多场景，展现手表全天候陪伴",
          },
        },
      ],
    },
    {
      id: "block-selectedConcept-001",
      block: "选定方案",
      data: [
        { id: "kv-selected", key: "最终选择", value: "方案C - 全场景生活" },
        {
          id: "kv-reason",
          key: "选择理由",
          value: "更全面展示产品功能，覆盖更多使用场景，提升用户共鸣",
        },
      ],
    },
  ],
};

// 3. VisualAsset 模块
const MOCK_VISUAL_ASSET: FlexibleDocument = {
  type: "visual-asset",
  id: "visual-asset-001",
  title: "视觉素材 V1 - 角色与场景确认",
  createdAt: "2025-01-26T11:00:00Z",
  docs: [
    {
      id: "block-creativeConcept-001",
      block: "创意概念",
      data: [
        { id: "kv-concept", key: "选定概念", value: "全场景生活" },
        {
          id: "kv-visualStyle",
          key: "视觉风格",
          value: "明亮清新、都市感、科技质感",
        },
      ],
    },
    {
      id: "block-characters-001",
      block: "角色设定",
      data: [
        {
          id: "kv-mainChar",
          key: "主角",
          value: {
            name: "都市白领女性",
            age: "25-28岁",
            style: "时尚简约、活力阳光",
            description: "热爱运动和健康生活的年轻职场女性",
          },
        },
        {
          id: "kv-supportChar",
          key: "配角",
          value: {
            name: "男友/闺蜜",
            description: "约会场景中出现，增加生活感",
          },
        },
      ],
    },
    {
      id: "block-scenes-001",
      block: "场景素材",
      data: [
        {
          id: "kv-scene1",
          key: "场景1 - 晨跑",
          value: "城市公园晨光、跑道、绿植",
        },
        {
          id: "kv-scene2",
          key: "场景2 - 办公室",
          value: "现代简约办公区、落地窗、绿植",
        },
        {
          id: "kv-scene3",
          key: "场景3 - 咖啡厅",
          value: "精品咖啡店、暖色调、约会氛围",
        },
        {
          id: "kv-scene4",
          key: "场景4 - 卧室",
          value: "温馨卧室、柔和灯光、睡眠场景",
        },
      ],
    },
    {
      id: "block-productShots-001",
      block: "产品素材",
      data: [
        {
          id: "kv-product1",
          key: "产品主图",
          value: "45度侧视角，展示表盘和表带",
        },
        {
          id: "kv-product2",
          key: "功能界面",
          value: "心率、血氧、睡眠、运动模式界面截图",
        },
        { id: "kv-product3", key: "细节特写", value: "表冠、传感器、充电底座" },
      ],
    },
  ],
};

// 4. Storyboard 模块
const MOCK_STORYBOARD: FlexibleDocument = {
  type: "storyboard",
  id: "storyboard-001",
  title: "分镜脚本 V1 - 30秒完整版",
  createdAt: "2025-01-26T11:30:00Z",
  docs: [
    {
      id: "block-overview-001",
      block: "脚本概览",
      data: [
        { id: "kv-totalDuration", key: "总时长", value: "30秒" },
        { id: "kv-shotCount", key: "镜头数量", value: "8个镜头" },
        { id: "kv-bgm", key: "背景音乐", value: "轻快电子节奏，积极向上" },
      ],
    },
    {
      id: "block-shots-001",
      block: "分镜列表",
      data: [
        {
          id: "kv-shot1",
          key: "镜头1",
          value: {
            duration: "3s",
            scene: "晨跑",
            description: "清晨阳光透过窗帘，手表震动提醒起床",
            camera: "特写",
            audio: "轻柔闹铃声",
          },
        },
        {
          id: "kv-shot2",
          key: "镜头2",
          value: {
            duration: "4s",
            scene: "晨跑",
            description: "主角在公园跑步，手表显示心率120bpm",
            camera: "跟拍",
            audio: "背景音乐渐起",
          },
        },
        {
          id: "kv-shot3",
          key: "镜头3",
          value: {
            duration: "4s",
            scene: "办公室",
            description: "办公桌前工作，手表提醒站立休息",
            camera: "中景",
            audio: "键盘敲击声",
          },
        },
        {
          id: "kv-shot4",
          key: "镜头4",
          value: {
            duration: "3s",
            scene: "办公室",
            description: "手表测量血氧，显示98%",
            camera: "手部特写",
            audio: "清脆提示音",
          },
        },
        {
          id: "kv-shot5",
          key: "镜头5",
          value: {
            duration: "4s",
            scene: "咖啡厅",
            description: "与朋友约会，手表收到消息提醒",
            camera: "双人中景",
            audio: "咖啡厅环境音",
          },
        },
        {
          id: "kv-shot6",
          key: "镜头6",
          value: {
            duration: "4s",
            scene: "咖啡厅",
            description: "展示手表多种表盘切换",
            camera: "手腕特写",
            audio: "轻快背景乐",
          },
        },
        {
          id: "kv-shot7",
          key: "镜头7",
          value: {
            duration: "4s",
            scene: "卧室",
            description: "夜晚睡眠，手表监测睡眠质量",
            camera: "暗调中景",
            audio: "舒缓音乐",
          },
        },
        {
          id: "kv-shot8",
          key: "镜头8",
          value: {
            duration: "4s",
            scene: "产品展示",
            description: "产品主图+LOGO+广告语+购买引导",
            camera: "产品全景",
            audio: "品牌音效",
          },
        },
      ],
    },
  ],
};

// 5. FinalVideo 模块
const MOCK_FINAL_VIDEO: FlexibleDocument = {
  type: "final-video",
  id: "final-video-001",
  title: "成片交付 - 智能手表Pro Max 30秒广告",
  createdAt: "2025-01-26T14:00:00Z",
  docs: [
    {
      id: "block-videoInfo-001",
      block: "视频信息",
      data: [
        {
          id: "kv-title",
          key: "视频标题",
          value: "智能手表Pro Max - 活力每一刻",
        },
        { id: "kv-duration", key: "时长", value: "30秒" },
        { id: "kv-resolution", key: "分辨率", value: "1080x1920 (9:16)" },
        { id: "kv-fileSize", key: "文件大小", value: "45.6MB" },
        { id: "kv-format", key: "格式", value: "MP4 / H.264" },
      ],
    },
    {
      id: "block-deliverables-001",
      block: "交付文件",
      data: [
        {
          id: "kv-mainVideo",
          key: "主视频",
          value: "watch-pro-max-30s-v1.mp4",
        },
        {
          id: "kv-subtitleVersion",
          key: "带字幕版",
          value: "watch-pro-max-30s-v1-subtitle.mp4",
        },
        {
          id: "kv-noMusicVersion",
          key: "无音乐版",
          value: "watch-pro-max-30s-v1-nomusic.mp4",
        },
        { id: "kv-coverImage", key: "封面图", value: "cover-thumbnail.jpg" },
      ],
    },
    {
      id: "block-platformVersions-001",
      block: "平台适配版本",
      data: [
        {
          id: "kv-douyin",
          key: "抖音版",
          value: "9:16竖版，已添加抖音水印位置预留",
        },
        { id: "kv-kuaishou", key: "快手版", value: "9:16竖版，封面优化" },
        {
          id: "kv-xiaohongshu",
          key: "小红书版",
          value: "3:4版本，适配小红书展示",
        },
        {
          id: "kv-shipinhao",
          key: "视频号版",
          value: "9:16竖版，已适配视频号规范",
        },
      ],
    },
    {
      id: "block-reviewStatus-001",
      block: "审核状态",
      data: [
        { id: "kv-clientReview", key: "客户审核", value: "已通过 ✓" },
        { id: "kv-legalReview", key: "法务审核", value: "已通过 ✓" },
        { id: "kv-publishReady", key: "发布就绪", value: "是" },
      ],
    },
  ],
};

// 完整对话消息（包含所有5种模块卡片）
const MOCK_MESSAGES: Message[] = [
  // 开场对话
  {
    id: "msg-1",
    type: "message-user",
    content:
      "你好，我想为我们的新品「智能手表 Pro Max」制作一个短视频广告，准备投放到抖音、快手等平台。",
    timestamp: "2025-01-26T09:00:00Z",
  },
  {
    id: "msg-2",
    type: "message-ai",
    content:
      "好的！我来帮你完成这个短视频广告的全流程制作。首先需要了解一些基本信息：\n\n1. 产品的核心卖点是什么？\n2. 目标受众是哪些人群？\n3. 视频时长和预算大概是多少？\n4. 有没有参考的视频风格？",
    timestamp: "2025-01-26T09:01:00Z",
  },
  {
    id: "msg-3",
    type: "message-user",
    content:
      "产品卖点是：血氧监测、7天超长续航、100+运动模式、时尚轻薄设计。\n目标人群是18-35岁的都市年轻白领。\n视频30秒左右，预算15000元。\n风格参考Apple Watch和华为手表的广告，科技感、年轻活力。",
    timestamp: "2025-01-26T09:03:00Z",
  },

  // Brief 模块
  {
    id: "msg-4",
    type: "message-ai-card",
    content:
      "收到！我已经整理好了完整的 Brief 需求文档，包含视频配置、内容需求和参考素材，请确认：",
    document: MOCK_BRIEF,
    timestamp: "2025-01-26T09:05:00Z",
  },
  {
    id: "msg-5",
    type: "message-user",
    content: "Brief 内容确认没问题！可以开始做创意策划了。",
    timestamp: "2025-01-26T09:10:00Z",
  },

  // CreativePlanning 模块
  {
    id: "msg-6",
    type: "message-ai",
    content:
      "太好了！根据 Brief 需求，我为你设计了3个创意方向：\n\n• 方案A「晨跑达人」- 聚焦运动场景\n• 方案B「办公室精英」- 聚焦健康监测\n• 方案C「全场景生活」- 综合展示多场景\n\n我推荐方案C，可以更全面地展示产品功能。",
    timestamp: "2025-01-26T09:12:00Z",
  },
  {
    id: "msg-7",
    type: "message-ai-card",
    content: "详细的创意策划方案如下：",
    document: MOCK_CREATIVE_PLANNING,
    timestamp: "2025-01-26T09:13:00Z",
  },
  {
    id: "msg-8",
    type: "message-user",
    content: "我也觉得方案C更好，能覆盖更多使用场景。就用这个方案！",
    timestamp: "2025-01-26T09:20:00Z",
  },

  // VisualAsset 模块
  {
    id: "msg-9",
    type: "message-ai",
    content:
      "确认选择方案C「全场景生活」！接下来我来设计视觉素材，包括角色设定、场景规划和产品素材需求。",
    timestamp: "2025-01-26T09:22:00Z",
  },
  {
    id: "msg-10",
    type: "message-ai-card",
    content: "视觉素材规划已完成，包含角色设定、4个拍摄场景和产品素材需求：",
    document: MOCK_VISUAL_ASSET,
    timestamp: "2025-01-26T09:25:00Z",
  },
  {
    id: "msg-11",
    type: "message-user",
    content:
      "视觉素材规划很详细！主角选年轻职场女性很合适。可以开始做分镜脚本了。",
    timestamp: "2025-01-26T09:30:00Z",
  },

  // Storyboard 模块
  {
    id: "msg-12",
    type: "message-ai",
    content:
      "好的！根据创意方案和视觉素材，我设计了30秒8镜头的分镜脚本，涵盖晨跑、办公、约会、睡眠四个场景。",
    timestamp: "2025-01-26T09:32:00Z",
  },
  {
    id: "msg-13",
    type: "message-ai-card",
    content: "完整的分镜脚本如下，包含每个镜头的时长、场景、描述和音效：",
    document: MOCK_STORYBOARD,
    timestamp: "2025-01-26T09:35:00Z",
  },
  {
    id: "msg-14",
    type: "message-user",
    content:
      "分镜脚本非常完整！节奏把控得很好，每个镜头都能突出产品功能。开始制作成片吧！",
    timestamp: "2025-01-26T09:45:00Z",
  },

  // 制作中间过程
  {
    id: "msg-15",
    type: "message-ai",
    content:
      "收到！现在开始视频制作，预计需要2-3小时完成。制作过程中我会：\n\n1. 素材拍摄与采集\n2. 剪辑与调色\n3. 添加音乐与音效\n4. 字幕与特效\n5. 多平台适配导出\n\n完成后会第一时间发给你审核。",
    timestamp: "2025-01-26T09:50:00Z",
  },
  {
    id: "msg-16",
    type: "message-user",
    content: "好的，辛苦了！",
    timestamp: "2025-01-26T09:52:00Z",
  },
  {
    id: "msg-17",
    type: "message-ai",
    content:
      "视频制作已完成！我为你准备了多个版本：\n\n✅ 主视频（30秒完整版）\n✅ 带字幕版本\n✅ 无音乐版本（方便二次剪辑）\n✅ 各平台适配版本（抖音、快手、小红书、视频号）",
    timestamp: "2025-01-26T14:00:00Z",
  },

  // FinalVideo 模块
  {
    id: "msg-18",
    type: "message-ai-card",
    content: "成片交付详情如下，包含所有交付文件和平台适配版本：",
    document: MOCK_FINAL_VIDEO,
    timestamp: "2025-01-26T14:02:00Z",
  },
  {
    id: "msg-19",
    type: "message-user",
    content:
      "太棒了！成片效果很好，各平台版本都准备齐全了。审核通过，可以发布了！",
    timestamp: "2025-01-26T14:30:00Z",
  },
  {
    id: "msg-20",
    type: "message-ai",
    content:
      "感谢确认！🎉 项目已完成，祝视频投放效果大卖！\n\n如果后续需要优化或制作其他版本，随时可以联系我。",
    timestamp: "2025-01-26T14:32:00Z",
  },
];

const HISTORY_ITEMS: HistoryItem[] = [
  { id: "1", title: "智能手表Pro Max广告 - 完整流程", messages: MOCK_MESSAGES },
  { id: "2", title: "美妆产品宣传片", messages: [] },
  { id: "3", title: "运动鞋创意视频", messages: [] },
];

const MENU_ITEMS = [
  { id: "writing", icon: <Icons.Writing />, label: "帮我写作" },
  { id: "ai-create", icon: <Icons.AICreate />, label: "AI 创作" },
  { id: "cloud", icon: <Icons.Cloud />, label: "云盘" },
  { id: "more", icon: <Icons.More />, label: "更多", hasArrow: true },
];

const SKILL_BUTTONS = [
  { id: "code", icon: <Icons.Code />, label: "编程", color: "text-amber-600" },
  {
    id: "image",
    icon: <Icons.Image />,
    label: "图像生成",
    color: "text-blue-600",
  },
  {
    id: "writing",
    icon: <Icons.Writing />,
    label: "帮我写作",
    color: "text-green-600",
  },
  {
    id: "translate",
    icon: <Icons.Translate />,
    label: "翻译",
    color: "text-purple-600",
  },
  { id: "more", icon: <Icons.More />, label: "更多" },
];

// ==================== 工具函数 ====================
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==================== 侧边栏组件 ====================
function Sidebar({
  historyItems,
  activeId,
  onSelect,
  onNewChat,
}: {
  historyItems: HistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      {/* Logo 区域 */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/logo.png" alt="Logo" />
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
            创
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-gray-900">创意工作台</span>
      </div>

      {/* 新对话按钮 */}
      <div className="mb-2 px-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
          variant="outline"
        >
          <Icons.NewChat />
          <span className="font-medium">新对话</span>
          <span className="ml-auto text-xs text-gray-400">⌘K</span>
        </Button>
      </div>

      {/* 功能菜单 */}
      <nav className="hidden space-y-1 px-3 py-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <span className="text-gray-500">{item.icon}</span>
            <span>{item.label}</span>
            {item.hasArrow && (
              <span className="ml-auto text-gray-400">
                <Icons.ChevronRight />
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* 分隔线 */}
      <div className="px-6 py-2">
        <div className="border-t border-gray-200" />
      </div>

      {/* 历史对话 */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="px-3 py-2 text-xs text-gray-400">历史对话</div>
        <div className="space-y-0.5">
          {historyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-sm transition-colors",
                activeId === item.id
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span
                className={cn(
                  "shrink-0",
                  activeId === item.id ? "text-amber-500" : "text-gray-400"
                )}
              >
                <Icons.Chat />
              </span>
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ==================== 模块卡片组件 ====================
function ModuleCard({
  document,
  onClick,
  isActive,
}: {
  document: FlexibleDocument;
  onClick: () => void;
  isActive: boolean;
}) {
  const config = MODULE_CONFIG[document.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        isActive
          ? "border-amber-300 bg-amber-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className={cn("rounded-lg p-2", config.bgColor, config.color)}>
          {config.icon}
        </div>
        <div>
          <div className="text-xs text-gray-400">{config.label}</div>
          <div className="text-sm font-medium text-gray-900">
            {document.title}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {document.docs.length} 个区块 · {formatTime(document.createdAt)}
      </div>
    </button>
  );
}

// ==================== 消息组件 ====================
function MessageItem({
  message,
  onCardClick,
  activeDocId,
}: {
  message: Message;
  onCardClick?: (doc: FlexibleDocument) => void;
  activeDocId?: string;
}) {
  const isUser = message.type === "message-user";
  const isCard = message.type === "message-ai-card";

  return (
    <div
      className={cn(
        "mb-4 flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isUser
              ? "bg-blue-100 text-blue-600"
              : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          )}
        >
          {isUser ? "我" : "AI"}
        </AvatarFallback>
      </Avatar>

      {/* 消息内容 */}
      <div className={cn("max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "rounded-br-md bg-blue-500 text-white"
              : "rounded-bl-md bg-gray-100 text-gray-900"
          )}
        >
          {message.content}
        </div>

        {/* 模块卡片 */}
        {isCard && (
          <div className="mt-2 max-w-xs">
            <ModuleCard
              document={(message as AICardMessage).document}
              onClick={() => onCardClick?.((message as AICardMessage).document)}
              isActive={activeDocId === (message as AICardMessage).document.id}
            />
          </div>
        )}

        {/* 时间 */}
        <div
          className={cn(
            "mt-1 text-xs text-gray-400",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ==================== 模块详情面板 ====================
function ModuleDetailPanel({
  document,
  onClose,
}: {
  document: FlexibleDocument;
  onClose: () => void;
}) {
  const config = MODULE_CONFIG[document.type];

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-lg p-2", config.bgColor, config.color)}>
            {config.icon}
          </div>
          <div>
            <div className="text-xs text-gray-400">{config.label}</div>
            <div className="font-semibold text-gray-900">{document.title}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icons.Close />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {document.docs.map((block) => (
          <div key={block.id} className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
              <span className="h-4 w-1 rounded-full bg-amber-400" />
              {block.block}
            </h3>
            <div className="space-y-2">
              {block.data.map((kv) => (
                <div key={kv.id} className="flex gap-3">
                  <span className="w-24 shrink-0 text-sm text-gray-500">
                    {kv.key}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {typeof kv.value === "object"
                      ? Array.isArray(kv.value)
                        ? (kv.value as string[]).join("、")
                        : JSON.stringify(kv.value, null, 2)
                      : String(kv.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 输入框组件 ====================
function ChatInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="rounded-2xl border border-gray-200 bg-gray-50">
        <div className="px-4 pt-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发消息或输入 '/' 选择技能"
            className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            rows={1}
          />
        </div>
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <Icons.Attachment />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100">
              <Icons.DeepThink />
              <span>深度思考</span>
            </button>
          </div>
          <button
            onClick={onSend}
            disabled={!value.trim()}
            className={cn(
              "rounded-full p-2 transition-colors",
              value.trim()
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            )}
          >
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 欢迎页组件 ====================
function WelcomePage({
  inputValue,
  onInputChange,
  onSend,
}: {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}) {
  const userName = "创作者";

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-8">
      <h1 className="mb-12 text-4xl font-bold text-gray-900">
        {getGreeting()}，{userName}
      </h1>

      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 pt-4">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="发消息或输入 '/' 选择技能"
              className="max-h-[200px] min-h-[60px] w-full resize-none text-base text-gray-900 outline-none placeholder:text-gray-400"
              rows={1}
            />
          </div>
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <Icons.Attachment />
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100">
                <Icons.DeepThink />
                <span>深度思考</span>
              </button>
            </div>
            <button
              onClick={onSend}
              disabled={!inputValue.trim()}
              className={cn(
                "rounded-full p-2.5 transition-colors",
                inputValue.trim()
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "cursor-not-allowed bg-gray-100 text-gray-300"
              )}
            >
              <Icons.Send />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {SKILL_BUTTONS.map((skill) => (
            <button
              key={skill.id}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              <span className={skill.color}>{skill.icon}</span>
              <span>{skill.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 对话区域组件 ====================
function ChatArea({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onCardClick,
  activeDocId,
}: {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCardClick: (doc: FlexibleDocument) => void;
  activeDocId?: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onCardClick={onCardClick}
            activeDocId={activeDocId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <ChatInput value={inputValue} onChange={onInputChange} onSend={onSend} />
    </div>
  );
}

// ==================== 主页面组件 ====================
export default function MaterialChatPage() {
  const [historyItems] = useState<HistoryItem[]>(HISTORY_ITEMS);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>("1");
  const [inputValue, setInputValue] = useState("");
  const [activeDocument, setActiveDocument] = useState<FlexibleDocument | null>(
    null
  );

  // 获取当前对话的消息
  const currentMessages = activeHistoryId
    ? historyItems.find((h) => h.id === activeHistoryId)?.messages || []
    : [];

  // 检查是否有模块卡片消息
  const hasModuleCards = currentMessages.some(
    (m) => m.type === "message-ai-card"
  );

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log("发送消息:", inputValue);
      // TODO: 实现消息发送逻辑
      setInputValue("");
    }
  };

  const handleNewChat = () => {
    setActiveHistoryId(null);
    setActiveDocument(null);
    setInputValue("");
  };

  const handleCardClick = (doc: FlexibleDocument) => {
    setActiveDocument(activeDocument?.id === doc.id ? null : doc);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 左侧历史记录栏 */}
      <Sidebar
        historyItems={historyItems}
        activeId={activeHistoryId}
        onSelect={setActiveHistoryId}
        onNewChat={handleNewChat}
      />

      {/* 主内容区 */}
      <div className="flex flex-1">
        {/* 模块详情面板（仅在有选中模块时显示） */}
        {activeDocument && (
          <div className="w-96 shrink-0">
            <ModuleDetailPanel
              document={activeDocument}
              onClose={() => setActiveDocument(null)}
            />
          </div>
        )}

        {/* 对话区域 */}
        {activeHistoryId && currentMessages.length > 0 ? (
          <ChatArea
            messages={currentMessages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            onCardClick={handleCardClick}
            activeDocId={activeDocument?.id}
          />
        ) : (
          <WelcomePage
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
          />
        )}
      </div>
    </div>
  );
}
