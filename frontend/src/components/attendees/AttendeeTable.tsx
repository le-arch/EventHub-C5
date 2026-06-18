/**
 * AttendeeTable Component
 * * Desktop table view for displaying event attendees.
 * Features advanced sorting indicators, glassmorphic loading states, and context action vectors.
 * * @module AttendeeTable
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
import { CheckCircle, XCircle, MoreVertical, UserCheck, Eye, ChevronUp, Users } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'

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

/**
 * Custom color distribution helper matching the dashboard design
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'bg-violet-500/10 text-violet-600 border-violet-500/20',
    'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'bg-sky-500/10 text-sky-600 border-sky-500/20',
  ]
  return colors[name.length % colors.length]
}

export function AttendeeTable({ attendees, onCheckIn, onViewDetails, isLoading = false }: AttendeeTableProps) {
  const [sortField, setSortField] = useState<keyof Attendee>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: keyof Attendee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

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

  // Sort arrow element indicator
  const SortIndicator = ({ field }: { field: keyof Attendee }) => {
    if (sortField !== field) return null
    return (
      <ChevronUp className={`h-3.5 w-3.5 text-indigo-600 transition-transform stroke-[2.5] ${
        sortDirection === 'desc' ? 'rotate-180' : ''
      }`} />
    )
  }

  if (isLoading) {
    return (
      <div className="border border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="h-12 bg-slate-100/70 border-b border-slate-200/40 animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-b border-slate-100/50 animate-pulse bg-white/40" />
        ))}
      </div>
    )
  }

  if (attendees.length === 0) {
    return (
      <div className="border border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl text-center py-16 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-2">
        <Users className="h-9 w-9 text-slate-300 stroke-[1.5]" />
        <p className="text-sm font-semibold text-slate-700">No active registrations</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          When visitors purchase entry passes, their digital credentials will update live within this matrix row.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-white/40 bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="overflow-x-auto min-w-full align-middle inline-block">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="cursor-pointer text-xs font-bold text-slate-400 tracking-wider uppercase h-11 transition-colors hover:text-slate-700" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Attendee <SortIndicator field="name" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-xs font-bold text-slate-400 tracking-wider uppercase h-11 transition-colors hover:text-slate-700" onClick={() => handleSort('phone')}>
                <div className="flex items-center gap-1">Phone <SortIndicator field="phone" /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-xs font-bold text-slate-400 tracking-wider uppercase h-11 transition-colors hover:text-slate-700" onClick={() => handleSort('ticketType')}>
                <div className="flex items-center gap-1">Ticket Tier <SortIndicator field="ticketType" /></div>
              </TableHead>
              <TableHead className="text-center cursor-pointer text-xs font-bold text-slate-400 tracking-wider uppercase h-11 transition-colors hover:text-slate-700" onClick={() => handleSort('quantity')}>
                <div className="flex items-center justify-center gap-1">Qty <SortIndicator field="quantity" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer text-xs font-bold text-slate-400 tracking-wider uppercase h-11 transition-colors hover:text-slate-700" onClick={() => handleSort('totalPaid')}>
                <div className="flex items-center justify-end gap-1">Total Paid <SortIndicator field="totalPaid" /></div>
              </TableHead>
              <TableHead className="text-center text-xs font-bold text-slate-400 tracking-wider uppercase h-11">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 tracking-wider uppercase h-11">Check-In</TableHead>
              <TableHead className="w-12 h-11"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedAttendees.map((attendee) => (
              <TableRow 
                key={attendee.id} 
                className={`transition-colors border-slate-100 group ${
                  attendee.checkedIn 
                    ? 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]' 
                    : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Profile Name cell */}
                <TableCell className="font-bold text-slate-800 tracking-tight py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 shadow-sm border border-slate-100">
                      <AvatarFallback className={`text-[10px] font-bold border ${getAvatarColor(attendee.name)}`}>
                        {getInitials(attendee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[160px] group-hover:text-indigo-600 transition-colors">
                      {attendee.name}
                    </span>
                  </div>
                </TableCell>
                
                {/* Phone cell */}
                <TableCell className="text-xs font-medium text-slate-500 tracking-wide py-3.5">
                  {attendee.phone}
                </TableCell>
                
                {/* Ticket Tier cell */}
                <TableCell className="py-3.5">
                  <Badge className="bg-white hover:bg-white text-slate-600 font-semibold text-[11px] border border-slate-200 shadow-sm px-2 py-0.5 rounded-md">
                    {attendee.ticketType}
                  </Badge>
                </TableCell>
                
                {/* Quantity cell */}
                <TableCell className="text-center font-bold text-slate-700 text-xs py-3.5">
                  {attendee.quantity}
                </TableCell>
                
                {/* Amount Paid cell */}
                <TableCell className="text-right font-bold text-slate-800 text-xs py-3.5">
                  {formatCurrency(attendee.totalPaid)}
                </TableCell>
                
                {/* Check In Status tag cell */}
                <TableCell className="text-center py-3.5">
                  {attendee.checkedIn ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15 shadow-none font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md inline-flex gap-1">
                      <CheckCircle className="h-3 w-3 stroke-[2.5]" />
                      Checked In
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200/60 hover:bg-slate-150 shadow-none font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md inline-flex gap-1">
                      <XCircle className="h-3 w-3 stroke-[2.5]" />
                      Pending
                    </Badge>
                  )}
                </TableCell>
                
                {/* Logged timestamps cell */}
                <TableCell className="text-xs font-medium py-3.5">
                  {attendee.checkedInAt ? (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-500/10 font-semibold rounded-md text-[11px]">
                      {formatTime(attendee.checkedInAt)}
                    </span>
                  ) : (
                    <span className="text-slate-300 font-light">—</span>
                  )}
                </TableCell>
                
                {/* Action dropdown trigger cell */}
                <TableCell className="py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-1 min-w-[140px]">
                      {!attendee.checkedIn && onCheckIn && (
                        <DropdownMenuItem onClick={() => onCheckIn(attendee.id)} className="text-xs font-semibold text-slate-700 py-2 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                          Check In Entry
                        </DropdownMenuItem>
                      )}
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(attendee)} className="text-xs font-semibold text-slate-700 py-2 rounded-lg cursor-pointer focus:bg-slate-50 gap-2">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
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
    </div>
  )
}