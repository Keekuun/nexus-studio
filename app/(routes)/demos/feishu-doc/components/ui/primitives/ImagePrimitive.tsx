import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { IconPrimitive } from './IconPrimitive'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  preview?: boolean;
}

export const ImagePrimitive = ({ src, alt, className, preview = true, ...props }: ImageProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (preview) {
        e.stopPropagation();
        setIsOpen(true);
    }
    props.onClick?.(e);
  }

  return (
    <>
      <img 
        src={src} 
        alt={alt} 
        className={`${className || ''} ${preview ? 'cursor-zoom-in' : ''}`}
        onClick={handleClick}
        {...props}
      />
      {isOpen && createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div className="relative max-w-[90vw] max-h-[90vh]">
                <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
                <button 
                    className="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={() => setIsOpen(false)}
                >
                    <IconPrimitive name="close" className="w-6 h-6" />
                </button>
            </div>
        </div>,
        document.body
      )}
    </>
  )
}
