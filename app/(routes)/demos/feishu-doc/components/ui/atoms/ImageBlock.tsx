import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export const ImageBlock = ({ node }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const { src, alt, caption } = node.attrs

  return (
    <NodeViewWrapper className="image-block my-4 relative group" data-block-id={node.attrs.blockId}>
      <div 
        className="rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:shadow-md transition-shadow inline-block relative"
        onClick={() => setIsOpen(true)}
      >
        <img src={src} alt={alt} className="max-w-full h-auto max-h-[500px] object-contain" />
      </div>
      {caption && <div className="text-center text-sm text-gray-500 mt-1">{caption}</div>}

      {/* Preview Modal */}
      {isOpen && createPortal(
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div className="relative max-w-[90vw] max-h-[90vh]">
                <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
                <button 
                    className="absolute -top-10 right-0 text-white hover:text-gray-300"
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </button>
                {caption && <div className="absolute -bottom-10 left-0 w-full text-center text-white/90">{caption}</div>}
            </div>
        </div>,
        document.body
      )}
    </NodeViewWrapper>
  )
}
