/**
 * DateRangePicker Component
 * 
 * Provides a date range selector for filtering analytics data.
 * Supports preset ranges (Today, This Week, This Month, etc.)
 * and custom date selection.
 * 
 * @module DateRangePicker
 */

'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Types
interface DateRange {
  from: Date | null
  to: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
  presetOptions?: PresetOption[]
}

interface PresetOption {
  label: string
  getRange: () => DateRange
}

// Default preset options
const defaultPresets: PresetOption[] = [
  {
    label: 'Today',
    getRange: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    label: 'Yesterday',
    getRange: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return { from: yesterday, to: yesterday }
    },
  },
  {
    label: 'This Week',
    getRange: () => {
      const now = new Date()
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      return { from: start, to: now }
    },
  },
  {
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)
      return { from: start, to: end }
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: start, to: now }
    },
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 30)
      return { from: start, to: end }
    },
  },
  {
    label: 'This Year',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      return { from: start, to: now }
    },
  },
]

export function DateRangePicker({
  value,
  onChange,
  className,
  presetOptions = defaultPresets,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [tempRange, setTempRange] = useState<DateRange>(value)

  // Update temp range when value changes externally
  useEffect(() => {
    setTempRange(value)
  }, [value])

  /**
   * Handle preset selection
   */
  const handlePresetChange = (presetLabel: string) => {
    const preset = presetOptions.find(p => p.label === presetLabel)
    if (preset) {
      const newRange = preset.getRange()
      setTempRange(newRange)
      setSelectedPreset(presetLabel)
      onChange(newRange)
      setOpen(false)
    }
  }

  /**
   * Apply custom date range
   */
  const applyCustomRange = () => {
    if (tempRange.from && tempRange.to) {
      onChange(tempRange)
      setSelectedPreset('')
      setOpen(false)
    }
  }

  /**
   * Clear date range filter
   */
  const clearRange = () => {
    setTempRange({ from: null, to: null })
    setSelectedPreset('')
    onChange({ from: null, to: null })
    setOpen(false)
  }

  /**
   * Format display text for the button
   */
  const getDisplayText = (): string => {
    if (value.from && value.to) {
      if (value.from.toDateString() === value.to.toDateString()) {
        return format(value.from, 'MMM dd, yyyy')
      }
      return `${format(value.from, 'MMM dd, yyyy')} - ${format(value.to, 'MMM dd, yyyy')}`
    }
    if (value.from) {
      return `From ${format(value.from, 'MMM dd, yyyy')}`
    }
    if (value.to) {
      return `Until ${format(value.to, 'MMM dd, yyyy')}`
    }
    return 'Select date range'
  }

  const hasRange = value.from || value.to

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full md:w-auto",
              !hasRange && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col md:flex-row">
            {/* Preset Options */}
            <div className="border-b md:border-b-0 md:border-r p-2 min-w-36">
              <p className="text-xs font-medium text-gray-500 mb-2 px-2">Quick Select</p>
              <div className="space-y-1">
                {presetOptions.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm",
                      selectedPreset === preset.label && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handlePresetChange(preset.label)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={clearRange}
                >
                  Clear Range
                </Button>
              </div>
            </div>

            {/* Calendar Selector */}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: tempRange.from || undefined,
                  to: tempRange.to || undefined,
                }}
                onSelect={(range) => {
                  setTempRange({
                    from: range?.from || null,
                    to: range?.to || null,
                  })
                  setSelectedPreset('')
                }}
                numberOfMonths={1}
                className="rounded-md"
              />
              <div className="flex justify-between gap-2 mt-3 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={applyCustomRange}
                  disabled={!tempRange.from || !tempRange.to}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}