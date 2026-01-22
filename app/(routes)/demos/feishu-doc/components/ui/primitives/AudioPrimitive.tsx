import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

interface AudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  caption?: string;
}

export const AudioPrimitive = ({ src, className, caption, ...props }: AudioProps) => {
  return (
    <div className={`audio-container relative group ${className || ''}`}>
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
        </div>
        <audio 
          controls 
          className="w-full h-8"
          {...props}
        >
          <source src={src} />
          Your browser does not support the audio tag.
        </audio>
      </div>
      {caption && <div className="text-center text-sm text-gray-500 mt-1"><MarkdownPrimitive>{caption}</MarkdownPrimitive></div>}
    </div>
  )
}
