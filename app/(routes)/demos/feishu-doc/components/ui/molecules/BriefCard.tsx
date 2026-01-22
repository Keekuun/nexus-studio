import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { HeadingPrimitive } from '../primitives/HeadingPrimitive'
import { ImagePrimitive } from '../primitives/ImagePrimitive'
import { IconPrimitive } from '../primitives/IconPrimitive'
import { ButtonPrimitive } from '../primitives/ButtonPrimitive'
import { ImageViewerPrimitive } from '../primitives/ImageViewerPrimitive'
import { MarkdownPrimitive } from '../primitives/MarkdownPrimitive'

interface ReferenceItem {
    type: 'image' | 'video';
    src: string;
}

export const BriefCard = ({ node }: any) => {
  const { 
      title = 'Brief V2 Reference Picture Added',
      date = '2025-2-15 · 14:05',
      settings = {},
      requirements = {},
      references = []
  } = node.attrs
  
  const baseBlockId = node.attrs.blockId || 'brief-card';

  // State for image viewer
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter only images for the viewer, but we need to map the original index to the filtered index
  // Or simpler: just pass all items to ImageViewer and let it handle or skip non-images?
  // Current ImageViewerPrimitive assumes everything is an image. 
  // Let's create a list of just images for the viewer, and find the correct index when clicking.
  const imageReferences = references.filter((r: ReferenceItem) => r.type === 'image');
  
  const openGallery = (originalIndex: number) => {
    const item = references[originalIndex];
    if (item.type !== 'image') return; // Don't open gallery for video

    // Find the index of this image in the filtered imageReferences array
    // We need to match by reference equality or some ID. Since we don't have IDs, 
    // we can assume order is preserved.
    // Let's iterate and count images until we hit this one.
    let imgIndex = 0;
    for (let i = 0; i < originalIndex; i++) {
        if (references[i].type === 'image') imgIndex++;
    }
    
    setCurrentIndex(imgIndex)
    setIsOpen(true)
  }

  return (
    <NodeViewWrapper 
        className="brief-card-block bg-white rounded-xl border border-gray-200 my-8 shadow-sm overflow-hidden" 
        data-block-id={baseBlockId}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
              <IconPrimitive name="brief" className="w-4 h-4" />
              <span className="font-medium text-sm">Brief</span>
          </div>
          <div className="flex items-center gap-3">
              <ButtonPrimitive variant="outline" size="sm" className="gap-1.5">
                  <IconPrimitive name="batch-feedback" className="w-3.5 h-3.5" />
                  Batch Feedback
              </ButtonPrimitive>
              <ButtonPrimitive variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <IconPrimitive name="close" className="w-4 h-4" />
              </ButtonPrimitive>
          </div>
      </div>

      <div className="p-6">
          {/* Title & Info */}
          <div className="mb-6">
              <div data-block-id={`${baseBlockId}-title`}>
                <HeadingPrimitive level={2} className="mb-1">{title}</HeadingPrimitive>
              </div>
              <div data-block-id={`${baseBlockId}-date`}>
                <p className="text-xs text-gray-500">{date}</p>
              </div>
          </div>

          {/* Video Settings */}   
          <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3" data-block-id={`${baseBlockId}-header-video-settings`}>Video Settings</h3>
              <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg divide-x divide-gray-200 bg-white">
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1" data-block-id={`${baseBlockId}-label-duration`}>Duration</div>
                      <div className="text-lg font-bold text-gray-900" data-block-id={`${baseBlockId}-setting-duration`}>{settings.duration || '-'}</div>
                  </div>
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1" data-block-id={`${baseBlockId}-label-ratio`}>Aspect ratio</div>
                      <div className="text-lg font-bold text-gray-900" data-block-id={`${baseBlockId}-setting-ratio`}>{settings.ratio || '-'}</div>
                  </div>
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1" data-block-id={`${baseBlockId}-label-resolution`}>Resolution</div>
                      <div className="text-lg font-bold text-gray-900" data-block-id={`${baseBlockId}-setting-resolution`}>{settings.resolution || '-'}</div>
                  </div>
              </div>
          </div>

          {/* Content Requirements */}
          <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3" data-block-id={`${baseBlockId}-header-content-requirements`}>Content Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {Object.entries(requirements).map(([key, value]: [string, any], index) => (
                      <div key={key} className="grid grid-cols-[140px_1fr] gap-4 text-sm">
                          <div className="font-semibold text-gray-900" data-block-id={`${baseBlockId}-req-${index}-key`}>{key}</div>
                          <div className="text-gray-700 whitespace-pre-wrap" data-block-id={`${baseBlockId}-req-${index}-val`}>
                            <MarkdownPrimitive>{value}</MarkdownPrimitive>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Reference */}
          <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3" data-block-id={`${baseBlockId}-header-reference`}>Reference</h3>
              {/* Using a custom masonry-like flex approach for more control over visual gap filling */}
              <div className="flex flex-col md:flex-row gap-4">
                  {/* Column 1 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 0).map((item: ReferenceItem, index: number) => {
                          const realIndex = index * 3;
                          return (
                          <div 
                            key={`col1-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${realIndex}`}
                            onClick={() => openGallery(realIndex)}
                          >
                              <ImagePrimitive 
                                src={item.src} 
                                alt="Reference" 
                                className="w-full h-auto block" 
                                preview={false}
                              />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <IconPrimitive name="play" className="w-5 h-5" />
                                      </div>
                                  </div>
                              )}
                          </div>
                      )})}
                  </div>
                  {/* Column 2 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 1).map((item: ReferenceItem, index: number) => {
                          const realIndex = index * 3 + 1;
                          return (
                          <div 
                            key={`col2-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${realIndex}`}
                            onClick={() => openGallery(realIndex)}
                          >
                              <ImagePrimitive 
                                src={item.src} 
                                alt="Reference" 
                                className="w-full h-auto block" 
                                preview={false}
                              />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <IconPrimitive name="play" className="w-5 h-5" />
                                      </div>
                                  </div>
                              )}
                          </div>
                      )})}
                  </div>
                  {/* Column 3 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 2).map((item: ReferenceItem, index: number) => {
                          const realIndex = index * 3 + 2;
                          return (
                          <div 
                            key={`col3-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${realIndex}`}
                            onClick={() => openGallery(realIndex)}
                          >
                              <ImagePrimitive 
                                src={item.src} 
                                alt="Reference" 
                                className="w-full h-auto block" 
                                preview={false}
                              />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <IconPrimitive name="play" className="w-5 h-5" />
                                      </div>
                                  </div>
                              )}
                          </div>
                      )})}
                  </div>
              </div>
          </div>
      </div>

      <ImageViewerPrimitive 
        images={imageReferences} 
        initialIndex={currentIndex} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </NodeViewWrapper>
  )
}
