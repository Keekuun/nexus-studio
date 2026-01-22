import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes, Extension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

// --- Extensions ---

// 1. BlockID Extension (Simplified)
const BlockId = Extension.create({
  name: 'blockId',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'image', 'blockquote', 'section', 'bulletList', 'orderedList'],
        attributes: {
          blockId: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-block-id'),
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.blockId) {
                return {}
              }
              return {
                'data-block-id': attributes.blockId,
              }
            },
          },
        },
      },
    ];
  },
});

// 2. Section Node (Container)
const Section = Node.create({
  name: 'section',
  group: 'block',
  content: 'block+',
  draggable: true,
  
  addAttributes() {
    return {
      blockId: {
        default: null,
      },
      class: {
        default: 'section-block',
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="section"]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'section', class: 'section-block border-2 border-transparent hover:border-gray-100 transition-colors p-6 rounded-xl my-4 bg-gray-50/30' }), 0]
  },
});

// --- Mock Data ---
const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1, blockId: 'block-1' },
      content: [{ type: 'text', text: 'Project Phoenix Specification' }],
    },
    {
      type: 'paragraph',
      attrs: { blockId: 'block-2' },
      content: [{ type: 'text', text: 'This document outlines the core requirements for the new architecture. Hover over blocks to see the "Feishu-like" interaction.' }],
    },
    {
      type: 'section',
      attrs: { blockId: 'section-1' },
      content: [
        {
          type: 'heading',
          attrs: { level: 2, blockId: 'block-3' },
          content: [{ type: 'text', text: '1. Overview (Container Block)' }],
        },
        {
          type: 'paragraph',
          attrs: { blockId: 'block-4' },
          content: [{ type: 'text', text: 'This entire section is a container. Try hovering near the border of the grey box.' }],
        },
        {
            type: 'paragraph',
            attrs: { blockId: 'block-5' },
            content: [{ type: 'text', text: 'The module should support hot-swapping.'}]
        }
      ],
    },
    {
        type: 'section',
        attrs: { blockId: 'section-2' },
        content: [
             {
                type: 'heading',
                attrs: { level: 2, blockId: 'block-6' },
                content: [{ type: 'text', text: '2. Key Metrics (Container Block)' }],
             },
             {
                type: 'bulletList',
                attrs: { blockId: 'list-1' },
                content: [
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', attrs: { blockId: 'li-1' }, content: [{ type: 'text', text: 'Latency < 50ms' }] }]
                    },
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', attrs: { blockId: 'li-2' }, content: [{ type: 'text', text: 'Availability > 99.99%' }] }]
                    }
                ]
             }
        ]
    },
    {
      type: 'paragraph',
      attrs: { blockId: 'block-7' },
      content: [{ type: 'text', text: 'End of document.' }],
    },
  ],
};

interface DocEditorProps {
    setActiveBlockId: (id: string | null) => void;
    activeBlockId: string | null;
    commentedBlockIds?: string[];
}

export function DocEditor({ setActiveBlockId, activeBlockId, commentedBlockIds = [] }: DocEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [clickRect, setClickRect] = useState<DOMRect | null>(null);
  const [commentedRects, setCommentedRects] = useState<Array<{ id: string, rect: DOMRect }>>([]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Type something...' }),
      Image,
      BlockId,
      Section,
    ],
    content: initialContent,
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none min-h-[500px]',
        },
    },
  });

  // Handle Mouse Interaction
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!editorRef.current) return;

    // Get all elements at the cursor position
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    
    // Find all elements that are blocks (have data-block-id)
    const blockElements = elements.filter(el => el.hasAttribute('data-block-id'));

    if (blockElements.length === 0) {
        setHoveredBlockId(null);
        setHoverRect(null);
        return;
    }

    // Logic to distinguish Inner vs Outer blocks
    // 1. Get the innermost block (first in the list usually)
    let targetBlock = blockElements[0] as HTMLElement;
    
    // 2. Check if we should prefer a parent "container" block
    const CONTAINER_EDGE_THRESHOLD = 20; // px - Area to trigger container selection

    for (const el of blockElements) {
        const element = el as HTMLElement;
        const isSection = element.getAttribute('data-type') === 'section' || element.classList.contains('section-block');
        
        if (isSection) {
            const rect = element.getBoundingClientRect();
            // Check distance from edges
            const distLeft = e.clientX - rect.left;
            const distRight = rect.right - e.clientX;
            const distTop = e.clientY - rect.top;
            const distBottom = rect.bottom - e.clientY;

            // If we are close to the edge of this container, prefer it over the inner content
            if (
                distLeft < CONTAINER_EDGE_THRESHOLD || 
                distRight < CONTAINER_EDGE_THRESHOLD || 
                distTop < CONTAINER_EDGE_THRESHOLD || 
                distBottom < CONTAINER_EDGE_THRESHOLD
            ) {
                targetBlock = element;
                break; // Found the container preference, stop looking
            }
        }
    }

    const blockId = targetBlock.getAttribute('data-block-id');
    if (blockId) {
        setHoveredBlockId(blockId);
        setHoverRect(targetBlock.getBoundingClientRect());
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
      if (hoveredBlockId) {
          setActiveBlockId(hoveredBlockId);
          // Also update the click rect to match the current hover rect
          if (hoverRect) {
              setClickRect(hoverRect);
          }
      } else {
          setActiveBlockId(null);
          setClickRect(null);
      }
  }, [hoveredBlockId, hoverRect, setActiveBlockId]);

  // Calculate Rects for overlays
  const calculateRects = useCallback(() => {
     // 1. Active Block
     if (activeBlockId) {
         const el = document.querySelector(`[data-block-id="${activeBlockId}"]`);
         if (el) {
             setClickRect(el.getBoundingClientRect());
         }
     }

     // 2. Commented Blocks (Background Highlights)
     const newCommentedRects: Array<{ id: string, rect: DOMRect }> = [];
     commentedBlockIds.forEach(id => {
         // Skip active block to avoid double overlay (or handle via z-index)
         if (id === activeBlockId) return;

         const el = document.querySelector(`[data-block-id="${id}"]`);
         if (el) {
             newCommentedRects.push({
                 id,
                 rect: el.getBoundingClientRect()
             });
         }
     });
     setCommentedRects(newCommentedRects);

  }, [activeBlockId, commentedBlockIds]);

  // Recalculate click rect if window resizes or scroll happens
  useEffect(() => {
     if (!editor) return;

     // Force calculation after a brief delay to ensure DOM is ready
     const timeoutId = setTimeout(calculateRects, 100);

     // Subscribe to editor updates
     editor.on('update', calculateRects);
     editor.on('selectionUpdate', calculateRects);
     editor.on('transaction', calculateRects);

     calculateRects();
     window.addEventListener('scroll', calculateRects, true);
     window.addEventListener('resize', calculateRects);
     return () => {
         clearTimeout(timeoutId);
         editor.off('update', calculateRects);
         editor.off('selectionUpdate', calculateRects);
         editor.off('transaction', calculateRects);
         window.removeEventListener('scroll', calculateRects, true);
         window.removeEventListener('resize', calculateRects);
     }
  }, [calculateRects, editor]);


  if (!editor) return null;

  return (
    <div 
        ref={editorRef} 
        className="relative min-h-full" 
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => {
            setHoveredBlockId(null);
            setHoverRect(null);
        }}
    >
      <EditorContent editor={editor} />

      {/* Commented Blocks Overlay (Yellow/Orange Highlight) */}
      {commentedRects.map(({ id, rect }) => (
          <div
            key={id}
            className="fixed pointer-events-none bg-yellow-400/20 border-b-2 border-yellow-500/60 transition-all duration-300 z-0"
            style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            }}
          />
      ))}

      {/* Hover Overlay */}
      {hoverRect && hoveredBlockId !== activeBlockId && (
          <div 
            className="fixed pointer-events-none border border-blue-400 bg-blue-400/5 rounded transition-all duration-75 ease-out z-50"
            style={{
                top: hoverRect.top,
                left: hoverRect.left,
                width: hoverRect.width,
                height: hoverRect.height,
            }}
          >
             {/* Small handle or indicator */}
            <div className="absolute -left-[1px] -top-[1px] w-1 h-full bg-blue-400 opacity-50"></div>
          </div>
      )}

      {/* Active/Click Overlay */}
      {activeBlockId && clickRect && (
          <div 
            className="fixed pointer-events-none border-2 border-blue-600 rounded transition-all duration-200 z-50 shadow-sm bg-blue-600/5"
            style={{
                top: clickRect.top,
                left: clickRect.left,
                width: clickRect.width,
                height: clickRect.height,
            }}
          >
             {/* Anchor for comment line */}
             <div className="absolute top-0 right-0 h-full w-0.5 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
          </div>
      )}
    </div>
  );
}
