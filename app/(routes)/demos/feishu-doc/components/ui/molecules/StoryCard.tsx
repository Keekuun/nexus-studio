import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

interface StoryImage {
    number: string;
    title: string;
    src: string;
}

export const StoryCard = ({ node }: any) => {
  const { title, images = [] } = node.attrs
  const baseBlockId = node.attrs.blockId || 'story-card';

  return (
    <NodeViewWrapper 
        className="story-card-block bg-gray-50/80 p-8 rounded-xl border border-gray-100 my-8 shadow-sm group"
        data-block-id={baseBlockId}
    >
      {/* Main Title */}
      <div className="mb-6" data-block-id={`${baseBlockId}-title`}>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>

      {/* Rich Text Content Area (Core Creative, Outline, etc.) */}
      <div className="prose prose-slate max-w-none mb-10 prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
          <NodeViewContent />
      </div>

      {/* Image Strip / Storyboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((img: StoryImage, index: number) => (
              <div key={index} className="flex flex-col space-y-2">
                  <div className="flex flex-col">
                      <span className="text-xl font-light text-gray-900 leading-none">{img.number}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{img.title}</span>
                  </div>
                  <div 
                    className="aspect-[3/4] w-full relative overflow-hidden bg-white border border-gray-200 shadow-sm transition-transform hover:-translate-y-1 duration-300"
                    data-block-id={`${baseBlockId}-img-${index}`}
                  >
                      <img 
                        src={img.src} 
                        alt={img.title}
                        className="w-full h-full object-cover"
                      />
                  </div>
              </div>
          ))}
      </div>
    </NodeViewWrapper>
  )
}
