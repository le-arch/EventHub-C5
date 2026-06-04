/**
 * LoadingSpinner Component
 * 
 * Various loading spinner variants for different use cases:
 * - Full page loading
 * - Inline loading
 * - Overlay loading
 * - Skeleton loading
 * 
 * @module LoadingSpinner
 */

'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  fullPage?: boolean
  label?: string
  className?: string
}

const sizeConfig = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  fullPage = false,
  label,
  className,
}: LoadingSpinnerProps) {
  const spinnerSize = sizeConfig[size]

  const content = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "animate-spin rounded-full border-primary border-t-transparent",
                spinnerSize,
                className
              )}
            />
            {label && <p className="text-sm text-gray-500">{label}</p>}
          </div>
        )
      
      case 'dots':
        return (
          <div className="flex gap-2">
            <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-3 w-3 bg-primary rounded-full animate-bounce" />
          </div>
        )
      
      case 'pulse':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className={cn("bg-primary/20 rounded-full animate-pulse", spinnerSize)} />
            {label && <p className="text-sm text-gray-500">{label}</p>}
          </div>
        )
      
      case 'skeleton':
        return (
          <div className="space-y-3 w-full">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          </div>
        )
      
      default:
        return null
    }
  }

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content()}
      </div>
    )
  }

  return content()
}