'use client';

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidPrimitiveProps {
  chart: string;
}

export const MermaidPrimitive = ({ chart }: MermaidPrimitiveProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        mermaid.initialize({ 
            startOnLoad: true, 
            theme: 'default',
            securityLevel: 'loose', // Allow styles
        });
        
        // Ensure chart is valid string
        if (!chart) return;

        // Generate a unique ID that is a valid HTML ID (start with letter, no spaces)
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        mermaid.render(id, chart).then(({ svg }) => {
            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
            }
        }).catch((error) => {
            console.error('Mermaid render error:', error);
            // Don't show error text to user in a disruptive way, maybe log it
            if (containerRef.current) {
                // Keep original text if render fails, or show friendly error
                containerRef.current.innerHTML = `<pre class="text-red-500 text-xs overflow-auto p-2 bg-red-50 rounded">${error.message || 'Syntax error in graph'}</pre>`;
            }
        });
      } catch (e) {
          console.error('Mermaid init error:', e);
      }
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid-chart my-4 flex justify-center bg-white p-4 rounded border border-gray-100" />;
}
