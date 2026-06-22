/**
 * Breadcrumb Component
 * 
 * Displays a navigation breadcrumb trail showing the user's current location.
 * Fixed: uses unique keys even when href values are duplicated.
 * 
 * @module Breadcrumb
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

/**
 * Generate breadcrumb items from current pathname
 */
const generateItemsFromPath = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean)
  
  const items: BreadcrumbItem[] = []
  let currentPath = ''
  
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    currentPath += `/${path}`
    
    // Format label: capitalize and replace hyphens with spaces
    let label = path
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
    
    // Handle special cases
    if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      label = 'Event Details'
    }
    
    items.push({
      label,
      href: currentPath,
      isActive: i === paths.length - 1,
    })
  }
  
  return items
}

export function Breadcrumb({ 
  items: propItems, 
  className,
  showHome = true,
  separator = <ChevronRight className="h-3 w-3 text-gray-400" />,
}: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Use provided items or generate from current path
  const items = propItems || generateItemsFromPath(pathname)
  
  if (items.length === 0 && !showHome) {
    return null
  }
  
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-primary transition-colors flex items-center"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
            {items.length > 0 && (
              <span className="mx-1 text-gray-400">{separator}</span>
            )}
          </li>
        )}
        
                {items.map((item, index) => {
          // Unique key: href + label (both unique even when hrefs are duplicated)
          const uniqueKey = `${item.href}-${item.label}`
          return (
            <li key={uniqueKey} className="flex items-center">
              {item.isActive ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {index < items.length - 1 && (
                <span className="mx-1 text-gray-400">{separator}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}