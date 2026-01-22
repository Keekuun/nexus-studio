import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { ImagePrimitive } from '../primitives/ImagePrimitive'

export const ImageBlock = ({ node }: any) => {
  const { src, alt, caption } = node.attrs

  return (
    <NodeViewWrapper className="image-block my-4 relative group" data-block-id={node.attrs.blockId}>
      <div className="rounded-lg overflow-hidden border border-gray-200 inline-block relative">
        <ImagePrimitive src={src} alt={alt} className="max-w-full h-auto max-h-[500px] object-contain" />
      </div>
      {caption && <div className="text-center text-sm text-gray-500 mt-1">{caption}</div>}
    </NodeViewWrapper>
  )
}
