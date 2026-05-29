/**
 * RevenueSummary Component
 * 
 * Displays revenue metrics in summary cards.
 * Shows total revenue, average ticket price, and revenue trends.
 * 
 * @module RevenueSummary
 */

'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Ticket, Users } from 'lucide-react'
import { formatCurrency } from '@/src/lib/utils'

// Types
interface RevenueSummaryProps {
  totalRevenue: number
  totalTickets: number
  previousRevenue?: number
  averageTicketPrice?: number
  isLoading?: boolean
}

export function RevenueSummary({
  totalRevenue,
  totalTickets,
  previousRevenue,
  averageTicketPrice,
  isLoading = false,
}: RevenueSummaryProps) {
  // Calculate revenue change percentage
  const revenueChange = previousRevenue 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : null
  
  const isPositiveChange = revenueChange && revenueChange > 0
  const averagePrice = averageTicketPrice || (totalTickets > 0 ? totalRevenue / totalTickets : 0)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-32 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Revenue Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          {revenueChange !== null && (
            <div className="mt-3 flex items-center gap-1">
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(revenueChange).toFixed(1)}% from previous period
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Sold Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tickets Sold</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalTickets.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Total ticket sales
          </p>
        </CardContent>
      </Card>

      {/* Average Ticket Price Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Ticket Price</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(averagePrice)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Based on {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} sold
          </p>
        </CardContent>
      </Card>
    </div>
  )
}