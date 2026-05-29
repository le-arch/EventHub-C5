/**
 * MobileHeader Component
 * 
 * Mobile-specific header with back button, title, and menu toggle.
 * Used within the dashboard layout for mobile devices.
 * 
 * @module MobileHeader
 */

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Menu, X, MoreVertical } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  backUrl?: string
  onBack?: () => void
  onMenuClick?: () => void
  onActionClick?: () => void
  actionIcon?: React.ReactNode
  isMenuOpen?: boolean
  className?: string
}

export function MobileHeader({
  title,
  showBackButton = false,
  backUrl,
  onBack,
  onMenuClick,
  onActionClick,
  actionIcon,
  isMenuOpen = false,
  className,
}: MobileHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {onActionClick && actionIcon && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onActionClick}
          >
            {actionIcon}
          </Button>
        )}
        
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMenuClick}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </header>
  )
}