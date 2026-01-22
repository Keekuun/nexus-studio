import React from 'react'
import { MarkdownPrimitive } from './MarkdownPrimitive'

interface ButtonPrimitiveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'icon';
}

export const ButtonPrimitive = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonPrimitiveProps) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-lg",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded",
    ghost: "hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full",
  }

  const sizes = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    icon: "p-2",
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`} 
      {...props}
    >
      <MarkdownPrimitive inline>{children}</MarkdownPrimitive>
    </button>
  )
}
