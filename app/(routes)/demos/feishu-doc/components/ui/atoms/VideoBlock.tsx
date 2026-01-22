import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { VideoPrimitive } from '../primitives/VideoPrimitive'

export const VideoBlock = ({ node }: any) => {
  const { src, poster, caption } = node.attrs

  return (
    <NodeViewWrapper className="video-block my-4 relative group" data-block-id={node.attrs.blockId}>
      <div className="max-w-[800px] mx-auto">
        <VideoPrimitive src={src} poster={poster} caption={caption} />
      </div>
    </NodeViewWrapper>
  )
}
