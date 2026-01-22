'use client';

import React, { useState, useMemo } from 'react';
import { DocEditor } from './components/DocEditor';
import { CommentSidebar } from './components/CommentSidebar';

import Link from 'next/link';

export interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    initials: string;
    colorClass: string;
    blockId?: string; // Optional: Link comment back to a block
}

export default function FeishuDocDemo() {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  // Store comments by blockId
  const [comments, setComments] = useState<Record<string, Comment[]>>({
      'block-2': [
          {
              id: 'c1',
              author: 'John Doe',
              content: 'Please verify if this section matches the latest design requirements.',
              timestamp: '2m ago',
              initials: 'JD',
              colorClass: 'bg-blue-100 text-blue-600',
              blockId: 'block-2'
          }
      ],
      'block-3': [
          {
              id: 'c2',
              author: 'Alice Ivy',
              content: 'Looks good to me, but maybe we can shorten the text?',
              timestamp: '1h ago',
              initials: 'AI',
              colorClass: 'bg-green-100 text-green-600',
              blockId: 'block-3'
          }
      ]
  });

  // Flatten all comments into a single list
  const allComments = useMemo(() => {
      return Object.entries(comments).flatMap(([blockId, blockComments]) => 
          blockComments.map(c => ({ ...c, blockId }))
      ).sort((a, b) => {
          // Simple sort by ID (mock timestamp) or block order if possible
          // For now, just render as is
          return a.id.localeCompare(b.id);
      });
  }, [comments]);
  
  // Helper to check if a block has comments
  const commentedBlockIds = useMemo(() => Object.keys(comments), [comments]);

  const handleAddComment = (content: string) => {
      if (!activeBlockId || !content.trim()) return;

      const newComment: Comment = {
          id: Date.now().toString(),
          author: 'Me',
          content: content,
          timestamp: 'Just now',
          initials: 'ME',
          colorClass: 'bg-purple-100 text-purple-600',
          blockId: activeBlockId
      };

      setComments(prev => ({
          ...prev,
          [activeBlockId]: [...(prev[activeBlockId] || []), newComment]
      }));
  };
  
  const handleCommentClick = (blockId: string) => {
      setActiveBlockId(blockId);
  }

  return (
    <div className="flex w-full bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b bg-white flex items-center px-4 shrink-0 z-10 justify-between">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg">Feishu Doc Demo</h1>
            <p className="ml-4 text-sm text-gray-500">
              Hover blocks to see highlights. Click to select and comment. 
              Inner blocks vs Outer blocks detection enabled.
            </p>
          </div>
          <div>
            <Link 
              href="/demos/feishu-doc/spec" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
            >
              技术方案文档
            </Link>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
             <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-50">
                <div className="w-full max-w-[850px] bg-white min-h-[calc(100vh-8rem)] p-12 shadow-sm rounded-lg">
                    <DocEditor 
                        setActiveBlockId={setActiveBlockId} 
                        activeBlockId={activeBlockId} 
                        commentedBlockIds={commentedBlockIds}
                    />
                </div>
            </main>
            <CommentSidebar 
                activeBlockId={activeBlockId} 
                comments={allComments}
                onAddComment={handleAddComment}
                onCommentClick={handleCommentClick}
            />
        </div>
      </div>
    </div>
  );
}
