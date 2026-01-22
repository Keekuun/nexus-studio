import { NodeViewWrapper } from '@tiptap/react'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export const ImageGallery = ({ node }: any) => {
  const images = node.attrs.images || []
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openGallery = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Keyboard navigation
  useEffect(() => {
      if (!isOpen) return
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length)
          if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
          if (e.key === 'Escape') setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length])

  return (
    <NodeViewWrapper className="image-gallery-block my-6" data-block-id={node.attrs.blockId}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img: any, index: number) => (
              <div 
                key={index} 
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
                onClick={() => openGallery(index)}
              >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
          ))}
      </div>

      {isOpen && createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
        >
            <div className="relative w-full h-full flex items-center justify-center p-10">
                <img 
                    src={images[currentIndex].src} 
                    alt={images[currentIndex].alt} 
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()} 
                />
                
                {/* Controls */}
                <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={prevImage}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={nextImage}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </div>,
        document.body
      )}
    </NodeViewWrapper>
  )
}
