import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { ImagePrimitive } from '../primitives/ImagePrimitive'
import { ImageViewerPrimitive } from '../primitives/ImageViewerPrimitive'
import { IconPrimitive } from '../primitives/IconPrimitive'

export const ImageGallery = ({ node }: any) => {
  const images = node.attrs.images || []
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openGallery = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  return (
    <NodeViewWrapper className="image-gallery-block my-6" data-block-id={node.attrs.blockId}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img: any, index: number) => (
              <div 
                key={index} 
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
                onClick={() => openGallery(index)}
              >
                  <ImagePrimitive 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover" 
                    preview={false}
                  />
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
