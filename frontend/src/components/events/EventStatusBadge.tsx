/**
 * EventStatusBadge Component
 * 
 * Displays the status of an event with appropriate colors and icons.
 * Supports draft, published, cancelled, suspended, and archived statuses.
 * 
 * @module EventStatusBadge
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils';
import { Eye, FileText, XCircle, Clock, Archive } from 'lucide-react'

interface EventStatusBadgeProps {
  status: 'draft' | 'published' | 'cancelled' | 'suspended' | 'archived'
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
  suspended: {
    label: 'Suspended',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
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