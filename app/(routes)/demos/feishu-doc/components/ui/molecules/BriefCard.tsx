import { NodeViewWrapper } from '@tiptap/react'
import React from 'react'

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

  return (
    <NodeViewWrapper 
        className="brief-card-block bg-white rounded-xl border border-gray-200 my-8 shadow-sm overflow-hidden" 
        data-block-id={baseBlockId}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-sm">Brief</span>
          </div>
          <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Batch Feedback
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          </div>
      </div>

      <div className="p-6">
          {/* Title & Info */}
          <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
              <p className="text-xs text-gray-500">{date}</p>
          </div>

          {/* Video Settings */}
          <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Video Settings</h3>
              <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded-lg divide-x divide-gray-200 bg-white">
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1">Duration</div>
                      <div className="text-lg font-bold text-gray-900">{settings.duration || '-'}</div>
                  </div>
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1">Aspect ratio</div>
                      <div className="text-lg font-bold text-gray-900">{settings.ratio || '-'}</div>
                  </div>
                  <div className="p-4 text-center">
                      <div className="text-xs text-gray-500 mb-1">Resolution</div>
                      <div className="text-lg font-bold text-gray-900">{settings.resolution || '-'}</div>
                  </div>
              </div>
          </div>

          {/* Content Requirements */}
          <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Content Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {Object.entries(requirements).map(([key, value]: [string, any]) => (
                      <div key={key} className="grid grid-cols-[140px_1fr] gap-4 text-sm">
                          <div className="font-semibold text-gray-900">{key}</div>
                          <div className="text-gray-700 whitespace-pre-wrap">{value}</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Reference */}
          <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Reference</h3>
              {/* Using a custom masonry-like flex approach for more control over visual gap filling */}
              <div className="flex flex-col md:flex-row gap-4">
                  {/* Column 1 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 0).map((item: ReferenceItem, index: number) => (
                          <div 
                            key={`col1-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${index * 3}`}
                          >
                              <img src={item.src} alt="Reference" className="w-full h-auto block" />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z" />
                                          </svg>
                                      </div>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
                  {/* Column 2 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 1).map((item: ReferenceItem, index: number) => (
                          <div 
                            key={`col2-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${index * 3 + 1}`}
                          >
                              <img src={item.src} alt="Reference" className="w-full h-auto block" />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z" />
                                          </svg>
                                      </div>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
                  {/* Column 3 */}
                  <div className="flex flex-col gap-4 flex-1">
                      {references.filter((_: ReferenceItem, i: number) => i % 3 === 2).map((item: ReferenceItem, index: number) => (
                          <div 
                            key={`col3-${index}`} 
                            className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                            data-block-id={`${baseBlockId}-ref-${index * 3 + 2}`}
                          >
                              <img src={item.src} alt="Reference" className="w-full h-auto block" />
                              {item.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z" />
                                          </svg>
                                      </div>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </NodeViewWrapper>
  )
}
