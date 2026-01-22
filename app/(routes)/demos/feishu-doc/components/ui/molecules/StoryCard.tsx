import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { HeadingPrimitive } from '../primitives/HeadingPrimitive'
import { ImagePrimitive } from '../primitives/ImagePrimitive'
import { ImageViewerPrimitive } from '../primitives/ImageViewerPrimitive'

interface StoryImage {
    number: string;
    title: string;
    src: string;
}

export const StoryCard = ({ node }: any) => {
  const { title, images = [] } = node.attrs
  const baseBlockId = node.attrs.blockId || 'story-card';

  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openGallery = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  return (
    <NodeViewWrapper 
        className="story-card-block bg-gray-50/80 p-8 rounded-xl border border-gray-100 my-8 shadow-sm group"
        data-block-id={baseBlockId}
    >
      {/* Main Title */}
      <div className="mb-6" data-block-id={`${baseBlockId}-title`}>
          <HeadingPrimitive level={1} className="tracking-tight">{title}</HeadingPrimitive>
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
                    onClick={() => openGallery(index)}
                  >
                      <ImagePrimitive 
                        src={img.src} 
                        alt={img.title}
                        className="w-full h-full object-cover"
                        preview={false}
                      />
                  </div>
              </div>
          ))}
      </div>

      <ImageViewerPrimitive 
        images={images} 
        initialIndex={currentIndex} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </NodeViewWrapper>
  )
}
