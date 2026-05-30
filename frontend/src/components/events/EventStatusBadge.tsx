/**
 * EventStatusBadge Component
 * 
 * Displays the status of an event with appropriate colors and icons.
 * Supports draft, published, cancelled, and completed statuses.
 * 
 * @module EventStatusBadge
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Eye, FileText, XCircle, CheckCircle, Clock } from 'lucide-react'

interface EventStatusBadgeProps {
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  size?: 'sm' | 'default'
  showIcon?: boolean
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileText,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  published: {
    label: 'Published',
    icon: Eye,
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
}

export function EventStatusBadge({ status, size = 'default', showIcon = true }: EventStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && <Icon className={cn("mr-1", size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {config.label}
    </Badge>
  )
}