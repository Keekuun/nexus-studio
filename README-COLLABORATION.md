# 协同编辑器使用指南

## 概述

本项目使用 Yjs 和 TipTap 实现实时协同编辑功能。协同服务器使用 `y-websocket` 库来处理 WebSocket 连接和文档同步。

## 架构

- **客户端**: `components/collaboration/CollaborativeEditor.tsx`
  - 使用 `WebsocketProvider` (y-websocket) 连接到 WebSocket 服务器
  - 使用 TipTap 编辑器进行富文本编辑
  - 使用 Yjs 进行文档同步

- **服务器**: `server/collaboration-server.ts`
  - 独立的 WebSocket 服务器
  - 处理多个客户端的连接和文档同步
  - 默认运行在 `ws://localhost:3001`

## 启动方式

### 方式一：分别启动（推荐用于开发）

1. **启动 Next.js 开发服务器**:
   ```bash
   pnpm run dev
   ```

2. **启动协同服务器**（新终端窗口）:
   ```bash
   pnpm run server:collaboration
   ```

### 方式二：同时启动（使用 concurrently）

```bash
pnpm run dev:all
```

这会同时启动 Next.js 开发服务器和协同服务器。

## 配置

### 环境变量

可以通过环境变量配置协同服务器：

- `COLLABORATION_PORT`: WebSocket 服务器端口（默认: 3001）
- `COLLABORATION_HOST`: WebSocket 服务器主机（默认: localhost）
- `NEXT_PUBLIC_WS_URL`: 客户端 WebSocket 服务器地址（默认: ws://localhost:3001）

### 示例

创建 `.env.local` 文件：

```env
COLLABORATION_PORT=3001
COLLABORATION_HOST=localhost
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 使用协同编辑器

在页面中使用 `CollaborativeEditor` 组件：

```tsx
import CollaborativeEditor from '@/components/collaboration/CollaborativeEditor';

function MyPage() {
  const user = {
    name: 'Alice',
    color: '#FF5733',
  };

  return (
    <CollaborativeEditor
      user={user}
      documentName="my-document"
    />
  );
}
```

### Props

- `user`: 用户信息
  - `name`: 用户名
  - `color`: 用户颜色（用于显示光标）
- `documentName`: 文档名称（房间名），相同名称的文档会同步

## 工作原理

1. **客户端连接**: 客户端使用 `WebsocketProvider` 连接到 WebSocket 服务器
2. **文档同步**: Yjs 自动处理文档的同步和冲突解决（CRDT）
3. **实时更新**: 所有连接到同一文档的客户端会实时看到其他用户的编辑
4. **光标显示**: `CollaborationCursor` 扩展显示其他用户的光标位置

## 故障排除

### 连接失败

如果看到 "连接错误" 提示：

1. 确保协同服务器正在运行
2. 检查端口是否被占用
3. 检查防火墙设置
4. 确认 `NEXT_PUBLIC_WS_URL` 环境变量配置正确

### 文档不同步

1. 确保所有客户端使用相同的 `documentName`
2. 检查浏览器控制台是否有错误信息
3. 确认 WebSocket 连接状态（应该显示 "已连接"）

## 生产环境部署

在生产环境中：

1. 将协同服务器部署为独立服务
2. 使用反向代理（如 Nginx）处理 WebSocket 连接
3. 配置 SSL/TLS 以支持 `wss://` 连接
4. 考虑添加身份验证和授权
5. 实现文档持久化（可选）

## 相关资源

- [Yjs 文档](https://docs.yjs.dev/)
- [TipTap 文档](https://tiptap.dev/)
- [y-websocket GitHub](https://github.com/yjs/y-websocket)

