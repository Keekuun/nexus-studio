import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'
import { ImagePrimitive } from '../primitives/ImagePrimitive'
import { ImageViewerPrimitive } from '../primitives/ImageViewerPrimitive'

interface ShotData {
    id: number;
    images: string[];
    duration: string;
    notes: string;
}

export const ShotTable = ({ node }: any) => {
  const { data = [] } = node.attrs
  const baseBlockId = node.attrs.blockId || 'shot-table';

  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Flatten all images into a single array for the viewer
  // We need to store them as { src: string } objects to match ImageViewer interface
  // Also need a way to map from (rowIndex, imgIndex) to flattenedIndex
  
  const allImages: { src: string }[] = [];
  // Map to store starting index for each row to easily calculate global index
  const rowStartIndices: number[] = [];

  data.forEach((row: ShotData) => {
      rowStartIndices.push(allImages.length);
      row.images.forEach(img => {
          allImages.push({ src: img });
      });
  });

  const openGallery = (rowIndex: number, imgIndex: number) => {
      const globalIndex = rowStartIndices[rowIndex] + imgIndex;
      setCurrentIndex(globalIndex);
      setIsOpen(true);
  }

  return (
    <NodeViewWrapper 
        className="shot-table-block my-8 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white" 
        data-block-id={baseBlockId}
    >
      <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                      Shot
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shot Notes
                  </th>
              </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row: ShotData, rowIndex: number) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                          {row.id}
                      </td>
                      <td className="px-6 py-4 align-top">
                          <div className="flex gap-2">
                              {row.images.map((img, imgIndex) => (
                                  <div 
                                    key={imgIndex} 
                                    className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                    data-block-id={`${baseBlockId}-row-${rowIndex}-img-${imgIndex}`}
                                    onClick={() => openGallery(rowIndex, imgIndex)}
                                  >
                                      <ImagePrimitive 
                                        src={img} 
                                        alt={`Shot ${row.id}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        preview={false}
                                      />
                                  </div>
                              ))}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                          {row.duration}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 align-top leading-relaxed">
                          {row.notes}
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>

      <ImageViewerPrimitive 
        images={allImages} 
        initialIndex={currentIndex} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </NodeViewWrapper>
  )
}
