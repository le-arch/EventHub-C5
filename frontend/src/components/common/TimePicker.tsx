/**
 * TimePicker Component
 * 
 * Time picker with hour/minute selection and 12/24 hour format support.
 * Includes quick preset options and validation.
 * 
 * @module TimePicker
 */

'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  use24Hour?: boolean
}

const generateHourOptions = (use24Hour: boolean) => {
  if (use24Hour) {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  }
  return Array.from({ length: 12 }, (_, i) => (i + 1).toString())
}

const generateMinuteOptions = () => {
  return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  use24Hour = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState<string>('')
  const [minute, setMinute] = useState<string>('')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [timePart, periodPart] = value.split(' ')
      if (timePart) {
        const [h, m] = timePart.split(':')
        setHour(h || '')
        setMinute(m || '')
        if (periodPart && !use24Hour) {
          setPeriod(periodPart as 'AM' | 'PM')
        } else if (!use24Hour && parseInt(h) >= 12) {
          setPeriod('PM')
          setHour((parseInt(h) % 12 || 12).toString())
        }
      }
    }
  }, [value, use24Hour])

  const hourOptions = generateHourOptions(use24Hour)
  const minuteOptions = generateMinuteOptions()

  const handleHourSelect = (h: string) => {
    setHour(h)
  }

  const handleMinuteSelect = (m: string) => {
    setMinute(m)
  }

  const handlePeriodToggle = () => {
    setPeriod(prev => prev === 'AM' ? 'PM' : 'AM')
  }

  const handleApply = () => {
    if (hour && minute) {
      let formattedHour = hour
      if (!use24Hour) {
        let hourNum = parseInt(hour)
        if (period === 'PM' && hourNum !== 12) {
          hourNum += 12
        } else if (period === 'AM' && hourNum === 12) {
          hourNum = 0
        }
        formattedHour = hourNum.toString().padStart(2, '0')
      }
      const timeString = use24Hour 
        ? `${formattedHour}:${minute}`
        : `${hour}:${minute} ${period}`
      onChange?.(timeString)
      setOpen(false)
    }
  }

  const displayValue = value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {/* Hours */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Hour</p>
              <div className="h-48 overflow-y-auto border rounded-md p-1">
                {hourOptions.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHourSelect(h)}
                    className={cn(
                      "w-12 py-2 text-center hover:bg-gray-100 rounded transition-colors",
                      hour === h && "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Minute</p>
              <div className="h-48 overflow-y-auto border rounded-md p-1">
                {minuteOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMinuteSelect(m)}
                    className={cn(
                      "w-12 py-2 text-center hover:bg-gray-100 rounded transition-colors",
                      minute === m && "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM (only for 12-hour format) */}
            {!use24Hour && (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Period</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setPeriod('AM')}
                    className={cn(
                      "w-12 py-2 text-center border rounded-md transition-colors",
                      period === 'AM' && "bg-primary text-white border-primary"
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setPeriod('PM')}
                    className={cn(
                      "w-12 py-2 text-center border rounded-md transition-colors",
                      period === 'PM' && "bg-primary text-white border-primary"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleApply} className="w-full" disabled={!hour || !minute}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}