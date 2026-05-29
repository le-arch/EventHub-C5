/**
 * Admin System Logs Page
 * 
 * Allows admin to view system activity logs.
 * Features include:
 * - View all admin actions
 * - Search by user or action
 * - Filter by date range
 * - Filter by action type
 * - Export logs (coming soon)
 * 
 * @module AdminLogsPage
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Calendar,
  User,
  Shield,
  RefreshCw,
  AlertCircle,
  Download,
  Activity,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate } from '@/src/lib/utils'

// Type definitions
interface LogEntry {
  id: string
  adminName: string
  adminEmail: string
  action: string
  targetType: 'user' | 'event' | 'order'
  targetId: string
  targetName: string
  details: Record<string, unknown>
  ipAddress: string
  createdAt: string
}

// Action type colors
const getActionBadge = (action: string) => {
  if (action.includes('verify')) return <Badge className="bg-green-100 text-green-800">Verify</Badge>
  if (action.includes('suspend')) return <Badge variant="destructive">Suspend</Badge>
  if (action.includes('delete')) return <Badge variant="destructive">Delete</Badge>
  if (action.includes('refund')) return <Badge className="bg-amber-100 text-amber-800">Refund</Badge>
  if (action.includes('cancel')) return <Badge className="bg-orange-100 text-orange-800">Cancel</Badge>
  return <Badge variant="outline">{action}</Badge>
}

// Target type colors
const getTargetBadge = (targetType: string) => {
  switch (targetType) {
    case 'user':
      return <Badge variant="outline" className="bg-blue-50">User</Badge>
    case 'event':
      return <Badge variant="outline" className="bg-purple-50">Event</Badge>
    case 'order':
      return <Badge variant="outline" className="bg-cyan-50">Order</Badge>
    default:
      return <Badge variant="outline">System</Badge>
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [targetFilter, setTargetFilter] = useState<string>('all')

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs()
  }, [])

  /**
   * Fetch system logs from API
   */
  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs')
      setLogs(response.data.logs)
    } catch (error) {
      toast.error('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter logs based on search term and filters
   */
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
    const matchesTarget = targetFilter === 'all' || log.targetType === targetFilter
    
    return matchesSearch && matchesAction && matchesTarget
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Activity Logs</h1>
          <p className="text-gray-500 mt-1">
            Track all admin actions and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by admin, action, or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="verify">Verify</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(log.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{log.adminName}</p>
                            <p className="text-xs text-gray-500">{log.adminEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getTargetBadge(log.targetType)}
                          <p className="text-sm">{log.targetName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-gray-500">Total Log Entries</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logs.map(l => l.adminEmail)).size}
                </p>
                <p className="text-sm text-gray-500">Active Admins</p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.createdAt > new Date(Date.now() - 7 * 86400000).toISOString()).length}
                </p>
                <p className="text-sm text-gray-500">Last 7 Days</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}