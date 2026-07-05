'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Calendar, ShoppingCart, DollarSign, CheckCircle, BarChart3 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb } from '@/components/common/Breadcrumb'

import api from '@/lib/api'
import { toast } from 'sonner'

interface AnalyticsData {
  totalUsers: number
  totalEvents: number
  totalOrders: number
  grossRevenue: number
  platformFee: number
  netRevenue: number
  totalCheckedIn: number
  checkinRate: number
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics')
        setData(res.data)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
        <Skeleton className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      label: 'Total Events',
      value: data?.totalEvents ?? 0,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      label: 'Checked In',
      value: data?.totalCheckedIn ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: 'Gross Revenue',
      value: data ? `XAF ${(data.grossRevenue || 0).toLocaleString()}` : 'XAF 0',
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Platform Fees',
      value: data ? `XAF ${(data.platformFee || 0).toLocaleString()}` : 'XAF 0',
      icon: TrendingUp,
      color: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    {
      label: 'Net Revenue',
      value: data ? `XAF ${(data.netRevenue || 0).toLocaleString()}` : 'XAF 0',
      icon: DollarSign,
      color: 'bg-green-50 text-green-700 border-green-100',
    },
    {
      label: 'Check-in Rate',
      value: data ? `${(data.checkinRate || 0).toFixed(1)}%` : '0%',
      icon: BarChart3,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-900">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Analytics', href: '#', isActive: true },
        ]}
        showHome
      />

      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
        <div className="p-2.5 bg-purple-100 rounded-xl border border-purple-200 shadow-sm">
          <BarChart3 className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Platform Analytics</h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            Overview of platform-wide metrics and performance indicators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
