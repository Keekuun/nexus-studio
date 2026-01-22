import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { getExtensions } from './registry';

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
        type: 'shotTable',
        attrs: {
            blockId: 'shot-table-1',
            data: [
                {
                    id: 1,
                    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b'],
                    duration: '10s',
                    notes: 'Use deep red tones with angled volumetric light cutting through subtle haze to create a premium, mysterious focal point that enhances the product\'s material quality.'
                },
                {
                    id: 2,
                    images: [
                        'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
                        'https://images.unsplash.com/photo-1555099962-4199c345e5dd'
                    ],
                    duration: '8s',
                    notes: 'Use deep red tones with angled volumetric light cutting through subtle haze to create a premium, mysterious focal point that enhances the product\'s material quality.'
                },
                {
                    id: 3,
                    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794'],
                    duration: '7s',
                    notes: 'Reuse of brand-provided character drawing to ensure identity consistency; requires technical post-processing for transparency.'
                },
                {
                    id: 4,
                    images: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'],
                    duration: '8s',
                    notes: 'Essential prop for establishing the classic "late for school" anime trope.'
                },
                {
                    id: 5,
                    images: [
                        'https://images.unsplash.com/photo-1514565131-fce0801e5785',
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
                    ],
                    duration: '4s',
                    notes: 'Essential prop for establishing the classic "late for school" anime trope.'
                }
            ]
        }
    },
    {
        type: 'briefCard',
        attrs: {
            blockId: 'brief-1',
            title: 'Brief V2 Reference Picture Added',
            date: '2025-2-15 · 14:05',
            settings: {
                duration: '15s',
                ratio: '16:9',
                resolution: '1080p'
            },
            requirements: {
                'Product Name': 'Thank you for providing all the details',
                'Product link': 'blackhead.com/product/3082908blackhead.com/produc',
                'Primary Platform': 'TikTok, Youtube',
                'Core selling points': 'Thank you for providing all the details! I have summarized everything we\'ve discussed for your review. Please confirm that all the information is accurate.'
            },
            references: [
                { type: 'image', src: 'https://images.unsplash.com/photo-1618331835717-801e976710b2' }, // Tall 9:16
                { type: 'video', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }, // Standard 16:9 thumb
                { type: 'image', src: 'https://images.unsplash.com/photo-1600607686527-6fb886090705' }, // Square-ish
                { type: 'image', src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b' }, // Landscape
                { type: 'image', src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },  // Portrait
                { type: 'image', src: 'https://images.unsplash.com/photo-1618331835717-801e976710b2' }, // Tall again
                { type: 'image', src: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1' }, // Tech wide
                { type: 'video', src: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb' }  // Action shot
            ]
        }
    },
    {
        type: 'creativePlanning',
        attrs: {
            blockId: 'creative-1',
            title: 'V2 - Creative Confirmation',
            date: '2025-2-15 · 14:05',
            tabs: [
                { label: 'Concept 1', tag: 'Product-First', color: 'blue', active: true },
                { label: 'Concept 2', tag: 'Story-Driven', color: 'orange', active: false },
                { label: 'Concept 3', tag: 'High-Impact', color: 'yellow', active: false },
            ]
        },
        content: [
            // Reusing StoryCard 1
            {
                type: 'storyCard',
                attrs: {
                    blockId: 'creative-story-1',
                    title: 'The Morning Miracle',
                    images: [
                        { number: '01', title: 'CITY DUSK', src: 'https://images.unsplash.com/photo-1514565131-fce0801e5785' },
                        { number: '02', title: 'WARM ENTRANCE', src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
                        { number: '03', title: 'MOONLIT REFLECTION', src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b' },
                        { number: '04', title: 'SERENE PORTRAIT', src: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd' },
                        { number: '05', title: 'NIGHT RITUAL', src: 'https://images.unsplash.com/photo-1512820790803-83ca734da794' }
                    ]
                },
                content: [
                    {
                        type: 'heading',
                        attrs: { level: 3, blockId: 'creative-h1' },
                        content: [{ type: 'text', text: 'Core Creative' }]
                    },
                    {
                        type: 'paragraph',
                        attrs: { blockId: 'creative-p1' },
                        content: [{ type: 'text', text: 'An organic construction of silver filaments in a white void that solidifies into body architecture on a cold, confident model.' }]
                    },
                    {
                        type: 'heading',
                        attrs: { level: 3, blockId: 'creative-h2' },
                        content: [{ type: 'text', text: 'Outline' }]
                    },
                    {
                        type: 'bulletList',
                        attrs: { blockId: 'creative-list-1' },
                        content: [
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-1' }, content: [{ type: 'text', text: 'Mascot walks along a sunny school path holding a slice of toast in its mouth.' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-2' }, content: [{ type: 'text', text: 'Mascot stops as a magical golden swirl of energy envelops its body in a bright flash.' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-3' }, content: [{ type: 'text', text: 'Sailor Moon Mascot strikes a signature heroic pose in front of a glowing crescent moon backdrop.' }] }] }
                        ]
                    }
                ]
            },
            // Another StoryCard for "The 9-to-5 & Beyond"
            {
                type: 'storyCard',
                attrs: {
                    blockId: 'creative-story-2',
                    title: 'The "9-to-5 & Beyond"',
                    images: [
                        { number: '01', title: 'Celestial Bag', src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa' },
                        { number: '02', title: 'Quilted Detail', src: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
                        { number: '03', title: 'Golden Chain', src: 'https://images.unsplash.com/photo-1591561954557-26941169b49e' },
                        { number: '04', title: 'Night Style', src: 'https://images.unsplash.com/photo-1575296093822-98cbf4f0353c' }
                    ]
                },
                content: [
                    {
                        type: 'heading',
                        attrs: { level: 3, blockId: 'creative-h3' },
                        content: [{ type: 'text', text: 'Core Creative' }]
                    },
                    {
                        type: 'paragraph',
                        attrs: { blockId: 'creative-p2' },
                        content: [{ type: 'text', text: 'A seamless transition from day to night, highlighting the versatility of the accessory collection.' }]
                    },
                    {
                        type: 'heading',
                        attrs: { level: 3, blockId: 'creative-h4' },
                        content: [{ type: 'text', text: 'Outline' }]
                    },
                    {
                        type: 'bulletList',
                        attrs: { blockId: 'creative-list-2' },
                        content: [
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-4' }, content: [{ type: 'text', text: 'Office setting: Sharp focus on the bag\'s structure and practicality.' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-5' }, content: [{ type: 'text', text: 'Quick cut transition: The same bag styled for an evening event.' }] }] },
                            { type: 'listItem', content: [{ type: 'paragraph', attrs: { blockId: 'creative-li-6' }, content: [{ type: 'text', text: 'Close-up on hardware details shimmering under city lights.' }] }] }
                        ]
                    }
                ]
            }
        ]
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
      content: [
          { type: 'text', text: 'Status: ' },
          { type: 'tag', attrs: { label: 'In Progress', color: 'blue' } },
          { type: 'text', text: ' Priority: ' },
          { type: 'tag', attrs: { label: 'High', color: 'red' } }
      ],
    },
    {
        type: 'imageBlock',
        attrs: {
            blockId: 'img-1',
            src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
            alt: 'Tech Stack',
            caption: 'Figure 1: Modern Tech Stack Architecture'
        }
    },
    {
        type: 'imageGallery',
        attrs: {
            blockId: 'gallery-1',
            images: [
                { src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', alt: 'Tech 1' },
                { src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', alt: 'Tech 2' },
                { src: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd', alt: 'Tech 3' }
            ]
        }
    },
    {
        type: 'videoBlock',
        attrs: {
            blockId: 'video-1',
            src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
            poster: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb',
            caption: 'Video Demo: Big Buck Bunny'
        }
    },
    {
        type: 'audioBlock',
        attrs: {
            blockId: 'audio-1',
            src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            caption: 'Audio Demo: SoundHelix Song 1'
        }
    },
    {
        type: 'cardBlock',
        attrs: { blockId: 'card-1', title: 'Action Items' },
        content: [
            {
                type: 'paragraph',
                attrs: { blockId: 'card-p-1' },
                content: [{ type: 'text', text: '1. Review API specifications' }]
            },
            {
                type: 'paragraph',
                attrs: { blockId: 'card-p-2' },
                content: [{ type: 'text', text: '2. Setup CI/CD pipeline' }]
            }
        ]
    },
    {
        type: 'tableBlock',
        attrs: {
            blockId: 'table-1',
            data: [
                ['Feature', 'Status', 'Owner'],
                ['Auth', 'Done', 'Alex'],
                ['Database', 'In Progress', 'Sam'],
                ['UI', 'Pending', 'Jordan']
            ]
        }
    },
    {
        type: 'storyCard',
        attrs: {
            blockId: 'story-1',
            title: 'The Morning Miracle',
            images: [
                { number: '01', title: 'CITY DUSK', src: 'https://images.unsplash.com/photo-1514565131-fce0801e5785' },
                { number: '02', title: 'WARM ENTRANCE', src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
                { number: '03', title: 'MOONLIT REFLECTION', src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b' },
                { number: '04', title: 'SERENE PORTRAIT', src: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd' },
                { number: '05', title: 'NIGHT RITUAL', src: 'https://images.unsplash.com/photo-1512820790803-83ca734da794' }
            ]
        },
        content: [
            {
                type: 'heading',
                attrs: { level: 3, blockId: 'story-h1' },
                content: [{ type: 'text', text: 'Core Creative' }]
            },
            {
                type: 'paragraph',
                attrs: { blockId: 'story-p1' },
                content: [{ type: 'text', text: 'An organic construction of silver filaments in a white void that solidifies into body architecture on a cold, confident model.' }]
            },
            {
                type: 'heading',
                attrs: { level: 3, blockId: 'story-h2' },
                content: [{ type: 'text', text: 'Outline' }]
            },
            {
                type: 'bulletList',
                attrs: { blockId: 'story-list' },
                content: [
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', attrs: { blockId: 'story-li-1' }, content: [{ type: 'text', text: 'Mascot walks along a sunny school path holding a slice of toast in its mouth.' }] }]
                    },
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', attrs: { blockId: 'story-li-2' }, content: [{ type: 'text', text: 'Mascot stops as a magical golden swirl of energy envelops its body in a bright flash.' }] }]
                    },
                    {
                        type: 'listItem',
                        content: [{ type: 'paragraph', attrs: { blockId: 'story-li-3' }, content: [{ type: 'text', text: 'Sailor Moon Mascot strikes a signature heroic pose in front of a glowing crescent moon backdrop.' }] }]
                    }
                ]
            }
        ]
    },
    {
      type: 'paragraph',
      attrs: { blockId: 'block-end' },
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
    extensions: getExtensions(),
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
          // But re-calculate it to ensure it's up to date
          const el = document.querySelector(`[data-block-id="${hoveredBlockId}"]`);
          if (el) {
              setClickRect(el.getBoundingClientRect());
          }
      } else {
          setActiveBlockId(null);
          setClickRect(null);
      }
  }, [hoveredBlockId, setActiveBlockId]);

  // Calculate Rects for overlays
  const calculateRects = useCallback(() => {
     // 1. Active Block
     if (activeBlockId) {
         const el = document.querySelector(`[data-block-id="${activeBlockId}"]`);
         if (el) {
             setClickRect(el.getBoundingClientRect());
         }
     }

     // 2. Hovered Block (Re-calc to sync with scroll)
     if (hoveredBlockId) {
         const el = document.querySelector(`[data-block-id="${hoveredBlockId}"]`);
         if (el) {
             setHoverRect(el.getBoundingClientRect());
         }
     }

     // 3. Commented Blocks (Background Highlights)
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

  }, [activeBlockId, hoveredBlockId, commentedBlockIds]);

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
