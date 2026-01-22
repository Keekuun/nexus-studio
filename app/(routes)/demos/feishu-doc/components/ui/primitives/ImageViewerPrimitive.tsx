import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconPrimitive } from './IconPrimitive'

interface ImageViewerImage {
  src: string;
  alt?: string;
  type?: 'image' | 'video'; // Optional support for video if needed later
}

interface ImageViewerProps {
  images: ImageViewerImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewerPrimitive = ({ images, initialIndex, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Sync internal state with prop changes if needed, but mainly we use initialIndex when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length, onClose])

  if (!isOpen) return null

  const currentImg = images[currentIndex]

  return createPortal(
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={onClose}
    >
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
            <img 
                src={currentImg.src} 
                alt={currentImg.alt || ''} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                onClick={(e) => e.stopPropagation()} 
            />
            
            {/* Close Button */}
            <button 
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
                <IconPrimitive name="close" className="w-6 h-6" />
            </button>

            {/* Navigation Controls - Only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <button 
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={prevImage}
                >
                    <IconPrimitive name="arrow-left" className="w-6 h-6" />
                </button>
                <button 
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={nextImage}
                >
                    <IconPrimitive name="arrow-right" className="w-6 h-6" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
        </div>
    </div>,
    document.body
  )
}
