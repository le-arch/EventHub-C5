/**
 * AttendeeFilters Component
 * 
 * Provides filter controls for the attendee list.
 * Allows filtering by ticket type, check-in status, and date range.
 * 
 * @module AttendeeFilters
 */

'use client'

import { useState } from 'react'
import { Filter, X, Ticket, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/src/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Label } from '@/src/components/ui/label'
import { Separator } from '@/src/components/ui/separator'
import { Badge } from '@/src/components/ui/badge'

// Types
interface FilterOptions {
  ticketType: string
  checkInStatus: 'all' | 'checked_in' | 'not_checked'
  dateFrom: string
  dateTo: string
}

interface AttendeeFiltersProps {
  ticketTypes: string[]
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  activeFilterCount: number
}

export function AttendeeFilters({
  ticketTypes,
  filters,
  onFiltersChange,
  activeFilterCount,
}: AttendeeFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  /**
   * Apply filters and close sheet
   */
  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  /**
   * Reset all filters to default
   */
  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      ticketType: 'all',
      checkInStatus: 'all',
      dateFrom: '',
      dateTo: '',
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  /**
   * Check if filters have changed from original
   */
  const hasChanges = () => {
    return (
      localFilters.ticketType !== filters.ticketType ||
      localFilters.checkInStatus !== filters.checkInStatus ||
      localFilters.dateFrom !== filters.dateFrom ||
      localFilters.dateTo !== filters.dateTo
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filter Attendees</SheetTitle>
          <SheetDescription>
            Narrow down the attendee list by applying filters
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-6 space-y-6">
          {/* Ticket Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Ticket Type
            </Label>
            <Select
              value={localFilters.ticketType}
              onValueChange={(value) => setLocalFilters({ ...localFilters, ticketType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All ticket types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ticket types</SelectItem>
                {ticketTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Check-in Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Check-in Status
            </Label>
            <Select
              value={localFilters.checkInStatus}
              onValueChange={(value: 'all' | 'checked_in' | 'not_checked') => 
                setLocalFilters({ ...localFilters, checkInStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All attendees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All attendees</SelectItem>
                <SelectItem value="checked_in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Checked in only
                  </div>
                </SelectItem>
                <SelectItem value="not_checked">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-red-600" />
                    Not checked in only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Purchase Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Purchase Date
            </Label>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-500">From</Label>
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">To</Label>
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={resetFilters}>
            Reset All
          </Button>
          <SheetClose asChild>
            <Button onClick={applyFilters} disabled={!hasChanges()}>
              Apply Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}