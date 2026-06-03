/**
 * Container Component
 * 
 * A responsive container component that centers content with appropriate
 * padding and max-width at different breakpoints.
 * 
 * @module Container
 */

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'default' | 'lg' | 'full'
  as?: keyof JSX.IntrinsicElements
}

const sizeConfig = {
  sm: 'max-w-3xl',
  default: 'max-w-7xl',
  lg: 'max-w-[90rem]',
  full: 'max-w-full',
}

export function Container({
  children,
  className,
  size = 'default',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 w-full",
        sizeConfig[size],
        className
      )}
    >
      {children}
    </Component>
  )
}