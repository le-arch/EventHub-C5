/**
 * EmptyState Component
 * 
 * Displays a friendly empty state message with optional illustration,
 * title, description, and action button.
 * Used for empty lists, no search results, etc.
 * 
 * @module EmptyState
 */

'use client'

import { ReactNode } from 'react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  illustration?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: {
    iconSize: 'w-12 h-12',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm',
  },
  md: {
    iconSize: 'w-16 h-16',
    titleSize: 'text-xl',
    descriptionSize: 'text-sm',
  },
  lg: {
    iconSize: 'w-24 h-24',
    titleSize: 'text-2xl',
    descriptionSize: 'text-base',
  },
}

export function EmptyState({
  title,
  description,
  icon,
  illustration,
  actionLabel,
  onAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = sizeConfig[size]

  return (
    <div className={cn("text-center py-12", className)}>
      {/* Icon or Illustration */}
      {illustration ? (
        <img
          src={illustration}
          alt={title}
          className={cn("mx-auto mb-6", sizes.iconSize)}
        />
      ) : icon ? (
        <div className={cn("mx-auto mb-6 text-gray-400", sizes.iconSize)}>
          {icon}
        </div>
      ) : null}

      {/* Title */}
      <h3 className={cn("font-semibold text-gray-900 mb-2", sizes.titleSize)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn("text-gray-500 max-w-sm mx-auto", sizes.descriptionSize)}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}