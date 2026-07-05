/**
 * ExportButton Component
 * 
 * Provides CSV export functionality for attendee lists.
 * Formats data with proper columns and localized date/currency formatting.
 * 
 * @module ExportButton
 */

'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

// Types
interface Attendee {
  id: string
  name: string
  phone: string
  email?: string
  ticketType: string
  quantity: number
  unitPrice: number
  totalPaid: number
  checkedIn: boolean
  checkedInAt: string | null
  purchasedAt: string
}

interface ExportButtonProps {
  attendees: Attendee[]
  eventName: string
  onExport?: (format: 'csv' | 'excel') => void
  isLoading?: boolean
}

export function ExportButton({ 
  attendees, 
  eventName, 
  onExport, 
  isLoading = false 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Convert attendees to CSV format
   */
  const convertToCSV = (data: Attendee[]): string => {
    const headers = [
      'Name',
      'Phone Number',
      'Email',
      'Ticket Type',
      'Quantity',
      'Unit Price (XAF)',
      'Total Paid (XAF)',
      'Check-in Status',
      'Check-in Time',
      'Purchase Date',
    ]

    const rows = data.map(attendee => [
      attendee.name,
      attendee.phone,
      attendee.email || '',
      attendee.ticketType,
      attendee.quantity,
      attendee.unitPrice,
      attendee.totalPaid,
      attendee.checkedIn ? 'Checked In' : 'Not Checked In',
      attendee.checkedInAt ? formatTime(attendee.checkedInAt) : '',
      formatDate(attendee.purchasedAt),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Add BOM for proper UTF-8 encoding (handles special characters)
    return '\uFEFF' + csvContent
  }

  /**
   * Download CSV file
   */
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Handle export to CSV
   */
  const handleExportCSV = async () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export')
      return
    }

    setIsExporting(true)
    
    try {
      // Call API for enhanced export if needed
      if (onExport) {
        await onExport('csv')
      }
      
      // Generate filename with event name and date
      const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `${sanitizedEventName}_attendees_${dateStr}.csv`
      
      const csv = convertToCSV(attendees)
      downloadCSV(csv, filename)
      
      toast.success(`Exported ${attendees.length} attendees to CSV`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export attendees')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Handle export to Excel (XLSX format using CSV fallback)
   */
  const handleExportExcel = async () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export')
      return
    }

    setIsExporting(true)
    
    try {
      if (onExport) {
        await onExport('excel')
      }
      
      // For MVP, export as CSV with .xlsx extension
      // (Users can open in Excel)
      const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `${sanitizedEventName}_attendees_${dateStr}.xlsx`
      
      const csv = convertToCSV(attendees)
      downloadCSV(csv, filename)
      
      toast.success(`Exported ${attendees.length} attendees to Excel-compatible format`)
    } catch (error) {
      toast.error('Failed to export attendees')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Get summary text for tooltip
   */
  const getSummaryText = (): string => {
    const checkedIn = attendees.filter(a => a.checkedIn).length
    const total = attendees.length
    return `${checkedIn} of ${total} checked in`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || attendees.length === 0}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
          {attendees.length > 0 && (
            <span className="ml-1 text-xs text-gray-500">
              ({attendees.length})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
          <span className="ml-2 text-xs text-gray-400">(Excel compatible)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}