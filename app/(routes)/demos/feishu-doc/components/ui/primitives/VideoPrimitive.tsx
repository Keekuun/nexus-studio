import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  caption?: string;
}

export const VideoPrimitive = ({ src, poster, className, caption, ...props }: VideoProps) => {
  return (
    <div className={`video-container relative group ${className || ''}`}>
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
        <video 
          controls 
          className="w-full h-auto max-h-[500px] object-contain"
          poster={poster}
          {...props}
        >
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      </div>
      {caption && <div className="text-center text-sm text-gray-500 mt-1"><MarkdownPrimitive>{caption}</MarkdownPrimitive></div>}
    </div>
  )
}
