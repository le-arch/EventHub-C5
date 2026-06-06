/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin System Logs Page
 * 
 * Allows admin to view system activity logs.
 * Features include:
 * - View all admin actions
 * - Search by user or action
 * - Filter by date range
 * - Filter by action type
 * - Pagination for large log lists
 * - Breadcrumb navigation
 * - Export logs (coming soon)
 * 
 * @module AdminLogsPage
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  RefreshCw,
  AlertCircle,
  Download,
  Activity,
  Clock,
  FileText,
  Server,
  CheckCircle,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Pagination } from '@/components/common/Pagination'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'

// Type definitions
interface LogEntry {
  id: string
  adminName: string
  adminEmail: string
  action: string
  targetType: 'user' | 'event' | 'order'
  targetId: string
  targetName: string
  details: Record<string, any>
  ipAddress: string
  createdAt: string
}

// Action type badges with emojis
const getActionBadge = (action: string) => {
  if (action.includes('verify')) 
    return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">✅ Verify</Badge>
  if (action.includes('suspend')) 
    return <Badge variant="destructive" className="flex items-center gap-1">⛔ Suspend</Badge>
  if (action.includes('delete')) 
    return <Badge variant="destructive" className="flex items-center gap-1">🗑️ Delete</Badge>
  if (action.includes('refund')) 
    return <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">🔄 Refund</Badge>
  if (action.includes('cancel')) 
    return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">❌ Cancel</Badge>
  if (action.includes('publish')) 
    return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">📢 Publish</Badge>
  if (action.includes('login')) 
    return <Badge variant="outline" className="flex items-center gap-1">🔑 Login</Badge>
  if (action.includes('logout')) 
    return <Badge variant="outline" className="flex items-center gap-1">🚪 Logout</Badge>
  return <Badge variant="outline" className="flex items-center gap-1">📝 {action}</Badge>
}

// Target type badges with emojis
const getTargetBadge = (targetType: string) => {
  switch (targetType) {
    case 'user':
      return <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">👤 User</Badge>
    case 'event':
      return <Badge variant="outline" className="bg-purple-50 flex items-center gap-1">📅 Event</Badge>
    case 'order':
      return <Badge variant="outline" className="bg-cyan-50 flex items-center gap-1">🎟️ Order</Badge>
    default:
      return <Badge variant="outline" className="flex items-center gap-1">⚙️ System</Badge>
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [targetFilter, setTargetFilter] = useState<string>('all')
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch logs on component mount or when page/pageSize changes
  useEffect(() => {
    fetchLogs()
  }, [page, pageSize])

  /**
   * Fetch system logs from API with pagination
   */
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/logs', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          targetType: targetFilter !== 'all' ? targetFilter : undefined,
        },
      })
      setLogs(response.data.logs)
      setTotalCount(response.data.total)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load logs')
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

  /**
   * Reset search and filters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setTargetFilter('all')
    setPage(1)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* BreadCrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'System Logs', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Activity Logs 📋</h1>
            <p className="text-gray-500 mt-1">
              Track all admin actions and system events
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh 🔄
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export 📥 (Soon)
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="🔍 Search by admin, action, or target..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={(value) => {
              setActionFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="verify">✅ Verify</SelectItem>
                <SelectItem value="suspend">⛔ Suspend</SelectItem>
                <SelectItem value="delete">🗑️ Delete</SelectItem>
                <SelectItem value="refund">🔄 Refund</SelectItem>
                <SelectItem value="cancel">❌ Cancel</SelectItem>
                <SelectItem value="publish">📢 Publish</SelectItem>
                <SelectItem value="login">🔑 Login</SelectItem>
                <SelectItem value="logout">🚪 Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={(value) => {
              setTargetFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">👤 Users</SelectItem>
                <SelectItem value="event">📅 Events</SelectItem>
                <SelectItem value="order">🎟️ Orders</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || actionFilter !== 'all' || targetFilter !== 'all') && (
              <Button variant="ghost" onClick={handleResetFilters} className="sm:w-auto">
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Showing {filteredLogs.length} of {totalCount} log entr{totalCount !== 1 ? 'ies' : 'y'}
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>⏰ Timestamp</TableHead>
                  <TableHead>👤 Admin</TableHead>
                  <TableHead>📋 Action</TableHead>
                  <TableHead>🎯 Target</TableHead>
                  <TableHead>📄 Details</TableHead>
                  <TableHead>🌐 IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No logs found 📭</p>
                        {(searchTerm || actionFilter !== 'all' || targetFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={handleResetFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(log.createdAt)}</span>
                          <span className="text-xs text-gray-400 ml-1">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
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
                          <p className="text-sm font-medium">{log.targetName}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {log.targetId.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-primary hover:text-primary/80 flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto max-w-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          totalItems={totalCount}
          showFirstLast
        />
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{logs.length.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Log Entries 📊</p>
              </div>
              <Activity className="h-8 w-8 text-primary/60" />
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
                <p className="text-sm text-gray-500">Active Admins 👥</p>
              </div>
              <Shield className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.action.includes('verify')).length}
                </p>
                <p className="text-sm text-gray-500">Verifications ✅</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                <p className="text-sm text-gray-500">Last 7 Days 📅</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}