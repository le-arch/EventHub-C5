/**
 * AttendeeTable Component
 * 
 * Desktop table view for displaying attendees.
 * Features sorting, pagination, and row-level actions.
 * 
 * @module AttendeeTable
 */

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle, XCircle, MoreVertical, UserCheck } from 'lucide-react'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'

// Types
interface Attendee {
  id: string
  name: string
  phone: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
}

interface AttendeeTableProps {
  attendees: Attendee[]
  onCheckIn?: (attendeeId: string) => void
  onViewDetails?: (attendee: Attendee) => void
  isLoading?: boolean
}

/**
 * Get initials for avatar
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AttendeeTable({ attendees, onCheckIn, onViewDetails, isLoading = false }: AttendeeTableProps) {
  const [sortField, setSortField] = useState<keyof Attendee>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  /**
   * Handle sorting
   */
  const handleSort = (field: keyof Attendee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  /**
   * Sort attendees
   */
  const sortedAttendees = [...attendees].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal)
    }
    
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="h-12 bg-gray-100 animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-t animate-pulse bg-gray-50" />
        ))}
      </div>
    )
  }

  if (attendees.length === 0) {
    return (
      <div className="border rounded-lg text-center py-12">
        <p className="text-gray-500">No attendees found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
              Attendee {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('phone')}>
              Phone {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('ticketType')}>
              Ticket Type {sortField === 'ticketType' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-center cursor-pointer hover:bg-gray-50" onClick={() => handleSort('quantity')}>
              Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => handleSort('totalPaid')}>
              Amount Paid {sortField === 'totalPaid' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Check-in Time</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAttendees.map((attendee) => (
            <TableRow key={attendee.id} className={attendee.checkedIn ? 'bg-green-50/30' : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(attendee.name)}
                    </AvatarFallback>
                  </Avatar>
                  {attendee.name}
                </div>
              </TableCell>
              <TableCell>{attendee.phone}</TableCell>
              <TableCell>
                <Badge variant="outline">{attendee.ticketType}</Badge>
              </TableCell>
              <TableCell className="text-center">{attendee.quantity}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(attendee.totalPaid)}
              </TableCell>
              <TableCell className="text-center">
                {attendee.checkedIn ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Checked In
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Checked
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {attendee.checkedInAt ? formatTime(attendee.checkedInAt) : '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!attendee.checkedIn && onCheckIn && (
                      <DropdownMenuItem onClick={() => onCheckIn(attendee.id)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check In
                      </DropdownMenuItem>
                    )}
                    {onViewDetails && (
                      <DropdownMenuItem onClick={() => onViewDetails(attendee)}>
                        View Details
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}