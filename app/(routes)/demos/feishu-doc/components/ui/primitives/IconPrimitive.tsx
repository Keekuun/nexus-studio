import React from 'react'

export type IconName = 
  | 'brief' 
  | 'creative' 
  | 'batch-feedback' 
  | 'close' 
  | 'play' 
  | 'arrow-left' 
  | 'arrow-right'
  | 'audio';

interface IconPrimitiveProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

export const IconPrimitive = ({ name, className, ...props }: IconPrimitiveProps) => {
  const icons: Record<IconName, React.ReactNode> = {
    brief: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    creative: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
    'batch-feedback': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    ),
    close: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
    play: (
      <path d="M8 5v14l11-7z" />
    ),
    'arrow-left': (
      <path d="M15 18l-6-6 6-6"/>
    ),
    'arrow-right': (
      <path d="M9 18l6-6-6-6"/>
    ),
    audio: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )
  }

  // Default viewbox is 0 0 24 24 for most icons, but some might need adjustment if they were different.
  // The provided icons in the molecules all seemed to use 24 24.
  // 'play' icon in BriefCard used <path fill="current" ...> so we should handle fill vs stroke.
  // The 'play' icon provided path is simple, usually filled.
  
  const isFillIcon = name === 'play';

  return (
    <svg 
      className={className} 
      fill={isFillIcon ? "currentColor" : "none"} 
      viewBox="0 0 24 24" 
      stroke={isFillIcon ? "none" : "currentColor"}
      {...props}
    >
      {icons[name]}
    </svg>
  )
}
