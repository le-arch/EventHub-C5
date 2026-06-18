/**
 * DateRangePicker Component
 * * Provides a stunning premium date range selector for filtering data.
 * Supports side-scrolling quick selects and custom canvas date fields.
 * * @module DateRangePicker
 */

'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, ChevronDown, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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

const defaultPresets: PresetOption[] = [
  { label: 'Today', getRange: () => { const d = new Date(); return { from: d, to: d } } },
  { label: 'Yesterday', getRange: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { from: d, to: d } } },
  { label: 'This Week', getRange: () => { const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay()); return { from: start, to: now } } },
  { label: 'Last 7 Days', getRange: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 7); return { from: start, to: end } } },
  { label: 'This Month', getRange: () => { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); return { from: start, to: now } } },
  { label: 'Last 30 Days', getRange: () => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 30); return { from: start, to: end } } },
  { label: 'This Year', getRange: () => { const now = new Date(); const start = new Date(now.getFullYear(), 0, 1); return { from: start, to: now } } },
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

  useEffect(() => {
    setTempRange(value)
  }, [value])

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

  const applyCustomRange = () => {
    if (tempRange.from && tempRange.to) {
      onChange(tempRange)
      setSelectedPreset('')
      setOpen(false)
    }
  }

  const clearRange = () => {
    setTempRange({ from: null, to: null })
    setSelectedPreset('')
    onChange({ from: null, to: null })
    setOpen(false)
  }

  const getDisplayText = (): string => {
    if (value.from && value.to) {
      if (value.from.toDateString() === value.to.toDateString()) {
        return format(value.from, 'MMM dd, yyyy')
      }
      return `${format(value.from, 'MMM dd, yyyy')} - ${format(value.to, 'MMM dd, yyyy')}`
    }
    if (value.from) return `From ${format(value.from, 'MMM dd, yyyy')}`
    if (value.to) return `Until ${format(value.to, 'MMM dd, yyyy')}`
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
              "h-10 justify-between text-left font-medium rounded-xl border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm hover:bg-slate-50 transition-all w-full md:w-auto min-w-[210px]",
              !hasRange && "text-slate-500 font-normal"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate text-sm text-slate-700">{getDisplayText()}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 ml-2 transition-transform duration-200 group-aria-expanded:rotate-180" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0 border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden" align="start">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* Quick Action Preset Options Toolbar */}
            <div className="p-3 bg-slate-50/60 min-w-[150px] space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Quick Select</p>
              <div className="space-y-0.5">
                {presetOptions.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs font-medium rounded-lg h-8 px-2.5 transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
                      selectedPreset === preset.label && "bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 font-semibold"
                    )}
                    onClick={() => handlePresetChange(preset.label)}
                  >
                    {preset.label}
                  </Button>
                ))}
                
                <div className="pt-2 mt-2 border-t border-slate-200/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs font-semibold rounded-lg h-8 px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50/60 gap-1.5"
                    onClick={clearRange}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Interactive Calendar Panel Grid Body */}
            <div className="p-3 bg-white">
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
                className="rounded-xl"
              />
              
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg text-xs font-medium h-8 border-slate-200"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-lg text-xs font-semibold h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/10 px-3.5"
                  onClick={applyCustomRange}
                  disabled={!tempRange.from || !tempRange.to}
                >
                  Apply Filter
                </Button>
              </div>
            </div>

          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}