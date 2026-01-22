import React, { useState, useRef, useEffect } from 'react';
import { Comment } from '../page';
import { clsx } from 'clsx';

interface CommentSidebarProps {
  activeBlockId: string | null;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onCommentClick?: (blockId: string) => void;
}

export function CommentSidebar({ activeBlockId, comments, onAddComment, onCommentClick }: CommentSidebarProps) {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const activeCommentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments are added
  // Or scroll to active comment if block changes
  useEffect(() => {
    if (activeBlockId && activeCommentRef.current) {
         activeCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (commentsEndRef.current && !activeBlockId) {
        // If no active block, maybe scroll to bottom? Or keep position?
        // Let's scroll to bottom only if a new comment was just added (length check logic omitted for simplicity)
    }
  }, [activeBlockId, comments.length]);

  const handlePost = () => {
      if (newComment.trim()) {
          onAddComment(newComment);
          setNewComment('');
          // Scroll to bottom after posting
          setTimeout(() => {
              commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handlePost();
      }
  }

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full shadow-[0_0_15px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 shrink-0 relative">
      <div className="p-4 border-b font-medium flex justify-between items-center bg-white z-10">
        <span>Comments</span>
        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={activeBlockId || 'All'}>
            {activeBlockId || 'All'}
        </span>
      </div>
      
      {/* Scrollable Comment List */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="space-y-4">
            {comments.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                    No comments yet. Start the conversation!
                </div>
            ) : (
                comments.map((comment) => {
                    const isActive = comment.blockId === activeBlockId;
                    return (
                        <div 
                            key={comment.id} 
                            ref={isActive ? activeCommentRef : null}
                            onClick={() => comment.blockId && onCommentClick?.(comment.blockId)}
                            className={clsx(
                                "p-3 rounded-lg border shadow-sm transition-all duration-300 cursor-pointer",
                                isActive 
                                    ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200" 
                                    : "bg-white border-gray-200 hover:shadow-md opacity-80 hover:opacity-100"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${comment.colorClass}`}>
                                    {comment.initials}
                                </div>
                                <div className="text-xs font-semibold text-gray-700">{comment.author}</div>
                                <div className="text-[10px] text-gray-400 ml-auto">{comment.timestamp}</div>
                            </div>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                            </div>
                            {comment.blockId && (
                                <div className="mt-2 pt-2 border-t border-gray-100/50 flex justify-end">
                                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {comment.blockId}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            <div ref={commentsEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Input Area */}
      <div className={clsx(
          "p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 transition-all duration-300",
          !activeBlockId && "opacity-50 pointer-events-none grayscale"
      )}>
        <div className="relative">
            {!activeBlockId && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded shadow-sm border">
                        Select a block to comment
                    </span>
                </div>
            )}
            <textarea 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white" 
                placeholder="Write a comment..."
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!activeBlockId}
            />
            <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-400">Press Enter to post</span>
                <button 
                    onClick={handlePost}
                    disabled={!newComment.trim() || !activeBlockId}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Post
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
