/**
 * 富文本编辑器相关类型定义
 */

/**
 * 编辑器内容格式
 */
export type EditorContent = string | object;

/**
 * 编辑器用户信息
 */
export interface EditorUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

/**
 * 编辑器协作状态
 */
export interface CollaborationState {
  connected: boolean;
  users: EditorUser[];
  version: number;
}

/**
 * 编辑器操作历史
 */
export interface EditorHistory {
  id: string;
  content: EditorContent;
  timestamp: number;
  userId: string;
  userName: string;
}

/**
 * 评论位置
 */
export interface CommentPosition {
  from: number;
  to: number;
}

/**
 * 评论
 */
export interface Comment {
  id: string;
  position: CommentPosition;
  content: string;
  userId: string;
  userName: string;
  createdAt: number;
  resolved: boolean;
}

/**
 * 文档版本
 */
export interface DocumentVersion {
  id: string;
  content: EditorContent;
  version: number;
  createdAt: number;
  createdBy: string;
  description?: string;
}

