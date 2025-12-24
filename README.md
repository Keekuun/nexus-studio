# Nexus Studio

## 项目概述

Nexus Studio 是一个多模态创作平台，集成了文本、音视频和AI技术，提供实时协作、音视频编辑、富文本创作和AI驱动的交互体验。

## 项目命名含义

"Nexus" 代表连接、纽带和核心节点，体现了项目的核心特性：
- **多模态技术的交叉融合**（文本/音视频/AI）
- **实时通信协议的双向桥接**（SSE + WebSocket）
- **前后端技术的全栈贯通**（Next.js 服务端/客户端组件）

"Studio" 强调创作工具属性，提供：
- 音视频编辑的「制作间」
- 富文本协作的「工作台」
- AI 交互的「实验场」

详细命名说明请参考：[Why-Named-Nexus.md](./Why-Named-Nexus.md)

## 技术架构

### 核心技术栈

- **编程语言**: TypeScript（**强制要求，不使用纯JavaScript**）
  - 所有代码文件使用 `.ts` 或 `.tsx` 扩展名
  - 严格的类型检查和类型安全
  - 完整的类型定义和接口规范

- **前端框架**: Next.js (App Router)
  - 服务端组件 (Server Components)
  - 客户端组件 (Client Components)
  
- **UI框架**: 
  - shadcn/ui (模块化组件库)
  - Tailwind CSS (样式系统)

- **实时通信**:
  - SSE (Server-Sent Events) - 单向流式传输
  - WebSocket - 双向实时通信

- **AI集成**: AGUI (AI驱动的用户界面)

### 架构设计

```
┌─────────────────────────────────────────┐
│         Next.js Application             │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │   SSE    │  │WebSocket │  │ AGUI │ │
│  └──────────┘  └──────────┘  └──────┘ │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ 音视频编辑│  │富文本协作│  │AI交互│ │
│  └──────────┘  └──────────┘  └──────┘ │
└─────────────────────────────────────────┘
```

## 核心功能模块

### 1. 音视频编辑模块
- 音视频文件上传和管理
- 基础编辑功能（裁剪、合并、转码）
- 实时预览
- 导出功能

### 2. 富文本协作模块
- 实时协作编辑
- 版本控制
- 评论和标注
- 导出多种格式

### 3. AI交互模块 (AGUI)
- AI驱动的界面生成
- 智能内容建议
- 多模态AI处理（文本、图像、音频）
- 对话式交互

### 4. 实时通信模块
- SSE流式数据传输
- WebSocket双向通信
- 状态同步
- 事件广播

## 项目结构规划

```
nexus-studio/
├── README.md                    # 项目说明文档
├── Why-Named-Nexus.md          # 命名说明文档
├── package.json                 # 项目依赖配置
├── next.config.ts               # Next.js配置（TypeScript）
├── tailwind.config.ts           # Tailwind配置（TypeScript）
├── tsconfig.json                # TypeScript配置
│
├── app/                         # Next.js App Router（所有文件使用.tsx）
│   ├── layout.tsx               # 根布局（TypeScript）
│   ├── page.tsx                 # 首页（TypeScript）
│   ├── api/                     # API路由（所有路由使用TypeScript）
│   │   ├── sse/                 # SSE端点（.ts文件）
│   │   ├── websocket/           # WebSocket端点（.ts文件）
│   │   └── ai/                  # AI相关API（.ts文件）
│   └── (routes)/                # 功能路由组（.tsx文件）
│       ├── editor/              # 编辑器页面
│       ├── studio/              # 工作室页面
│       └── ai/                  # AI交互页面
│
├── components/                  # React组件（所有组件使用.tsx）
│   ├── ui/                      # shadcn/ui基础组件
│   ├── editor/                  # 编辑器组件
│   ├── video/                   # 音视频组件
│   ├── collaboration/           # 协作组件
│   └── ai/                      # AI交互组件
│
├── lib/                         # 工具库（所有文件使用.ts）
│   ├── utils/                   # 工具函数（.ts文件）
│   ├── hooks/                   # 自定义Hooks（.ts文件）
│   ├── stores/                  # 状态管理（.ts文件）
│   └── services/                # 服务层（.ts文件）
│       ├── sse.ts               # SSE服务（TypeScript）
│       ├── websocket.ts         # WebSocket服务（TypeScript）
│       └── ai.ts                # AI服务（TypeScript）
│
├── types/                       # TypeScript类型定义（.d.ts和.ts文件）
├── styles/                      # 全局样式
└── public/                      # 静态资源
```

## 开发计划

### 阶段一：项目初始化
- [ ] 初始化Next.js项目（**必须使用TypeScript模板**）
- [ ] 配置TypeScript（严格模式）
- [ ] 集成Tailwind CSS和shadcn/ui（使用TypeScript配置）
- [ ] 搭建基础项目结构（所有文件使用.ts/.tsx）
- [ ] 创建README和文档

### 阶段二：核心基础设施
- [ ] 实现SSE服务端和客户端
- [ ] 实现WebSocket服务端和客户端
- [ ] 搭建状态管理系统
- [ ] 创建基础UI组件库

### 阶段三：功能模块开发
- [ ] 音视频编辑模块
- [ ] 富文本协作模块
- [ ] AI交互模块
- [ ] 实时通信集成

### 阶段四：优化和测试
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 单元测试和集成测试
- [ ] 文档完善

## 使用说明

### 环境要求
- Node.js 18+ 
- **pnpm**（**强制要求，项目使用pnpm作为包管理器**）

### 安装pnpm（如果未安装）
```bash
npm install -g pnpm
```

### 安装依赖
```bash
pnpm install
```

### 环境变量配置

创建 `.env.local` 文件（参考 `.env.example`），配置以下环境变量：

```bash
# 方式一：使用 OpenRouter（推荐，支持多个免费模型）
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenRouter Base URL（可选，默认使用官方地址）
OPENROUTER_BASE_URL=https://openrouter.ai

# OpenRouter 默认模型（可选）
OPENROUTER_DEFAULT_MODEL=meta-llama/llama-3.2-3b-instruct:free

# OpenRouter 可用模型列表（可选，逗号分隔，用于对话框中的模型切换）
OPENROUTER_MODELS=meta-llama/llama-3.2-3b-instruct:free,google/gemini-flash-1.5:free,microsoft/phi-3-mini-128k-instruct:free,qwen/qwen-2.5-7b-instruct:free

# 方式二：直接使用 OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI 默认模型（可选，默认使用 gpt-3.5-turbo）
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# 应用配置（可选）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**配置说明：**
- **OpenRouter**：如果配置了 `OPENROUTER_API_KEY`，将使用 OpenRouter API（支持多个免费模型）
- **OpenAI**：如果只配置了 `OPENAI_API_KEY`（没有配置 `OPENROUTER_API_KEY`），将直接使用 OpenAI API
- 优先使用 OpenRouter，如果未配置 OpenRouter 则使用 OpenAI

**获取 API Key：**

**OpenRouter API Key：**
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 在 [API Keys](https://openrouter.ai/keys) 页面创建新的 API Key
4. 将 API Key 复制到 `.env.local` 文件中

**OpenAI API Key：**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号并登录
3. 在 [API Keys](https://platform.openai.com/api-keys) 页面创建新的 API Key
4. 将 API Key 复制到 `.env.local` 文件中

**模型配置：**

**OpenRouter 模型：**
- **默认模型**：通过 `OPENROUTER_DEFAULT_MODEL` 环境变量设置，如果不配置则使用 `meta-llama/llama-3.2-3b-instruct:free`
- **可用模型列表**：通过 `OPENROUTER_MODELS` 环境变量设置（逗号分隔），这些模型会显示在对话框的模型选择器中
- 如果不配置 `OPENROUTER_MODELS`，将使用默认的免费模型列表

**OpenAI 模型：**
- **默认模型**：通过 `OPENAI_DEFAULT_MODEL` 环境变量设置，如果不配置则使用 `gpt-3.5-turbo`
- **可用模型**：gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- 用户可以在对话框中切换不同的模型进行对话

### 开发运行
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
pnpm start
```

### 其他常用命令
```bash
pnpm lint          # 运行ESLint检查
pnpm type-check    # 运行TypeScript类型检查
```

## 开发规范

### TypeScript 使用要求（**强制**）
- **必须使用 TypeScript，禁止使用纯 JavaScript**
- 所有代码文件使用 `.ts` 或 `.tsx` 扩展名
- 配置文件（如 `next.config.ts`、`tailwind.config.ts`）也使用 TypeScript
- 必须为所有函数、组件、接口定义明确的类型
- 禁止使用 `any` 类型，特殊情况需添加 `@ts-ignore` 注释说明原因
- 所有公共 API 必须提供完整的类型定义
- 使用严格的 TypeScript 编译选项（`strict: true`）

### 代码风格
- 遵循 TypeScript 最佳实践和类型安全原则
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- 遵循SOLID原则和设计模式

### 提交规范
- 使用清晰的提交信息
- 每个功能独立提交
- 提交前确保代码通过lint检查

### 注释规范
- 所有公共API需要注释说明
- 复杂逻辑需要注释解释
- 使用JSDoc格式注释

## 贡献指南

欢迎贡献代码！请确保：
1. 代码符合项目规范
2. 添加必要的测试
3. 更新相关文档
4. 提交前进行充分测试

## 许可证

[MIT]

## 联系方式

[待定]

## 项目进度

### ✅ 已完成
- **阶段一**：项目初始化
  - Next.js项目搭建（TypeScript）
  - 开发环境配置（ESLint、Prettier、Git）
  - UI框架集成（Tailwind CSS、shadcn/ui）
  - 项目结构搭建

- **阶段二**：核心基础设施
  - SSE实时通信（服务端和客户端）
  - WebSocket实时通信（客户端Hook、消息队列、心跳机制）
  - 状态管理（Zustand、状态持久化）
  - 基础UI组件库

- **阶段三**：功能模块开发
  - 音视频编辑模块（文件上传、媒体库、视频播放器）
  - 富文本协作模块（Tiptap编辑器、导出功能）
  - AI交互模块（AI聊天界面、对话式交互）

- **阶段四**：优化和测试（进行中）
  - 性能优化（代码分割、懒加载、性能监控）
  - 错误处理（全局错误边界、404页面、错误处理工具）

### 🚧 进行中
- 测试框架配置和单元测试
- 文档完善

### 📋 待完成
- 实时协作功能完善
- 音视频编辑功能增强
- AI功能集成真实API
- E2E测试

---

**注意**: 项目核心功能已实现，可以开始使用和测试。更多功能将根据需求逐步完善。

