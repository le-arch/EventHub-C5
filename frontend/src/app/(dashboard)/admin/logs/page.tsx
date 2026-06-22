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

import { useState, useEffect, useCallback } from 'react'
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

// Types
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

// Action type badges with emojis and colors
const getActionBadge = (action: string) => {
  if (action.includes('verify')) 
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">✅ Verify</Badge>
  if (action.includes('suspend')) 
    return <Badge variant="destructive" className="flex items-center gap-1">⛔ Suspend</Badge>
  if (action.includes('delete')) 
    return <Badge variant="destructive" className="flex items-center gap-1">🗑️ Delete</Badge>
  if (action.includes('refund')) 
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">🔄 Refund</Badge>
  if (action.includes('cancel')) 
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">❌ Cancel</Badge>
  if (action.includes('publish')) 
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">📢 Publish</Badge>
  if (action.includes('login')) 
    return <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 flex items-center gap-1">🔑 Login</Badge>
  if (action.includes('logout')) 
    return <Badge variant="outline" className="border-gray-300 text-gray-600 bg-gray-50 flex items-center gap-1">🚪 Logout</Badge>
  return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 flex items-center gap-1">📝 {action}</Badge>
}

// Target type badges with emojis and colors
const getTargetBadge = (targetType: string) => {
  switch (targetType) {
    case 'user':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">👤 User</Badge>
    case 'event':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">📅 Event</Badge>
    case 'order':
      return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 flex items-center gap-1">🎟️ Order</Badge>
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1">⚙️ System</Badge>
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

  const fetchLogs = useCallback(async () => {
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
      setLogs(response.data.logs || [])
      setTotalCount(response.data.total || 0)
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchTerm, actionFilter, targetFilter])

  /**
   * Filter logs based on search term and filters (client‑side after fetch)
   */
  const filteredLogs = (logs || []).filter((log) => {
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
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'System Logs', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Activity Logs 📋</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Track all admin actions and system events
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchLogs()} 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh 
          </Button>
          <Button 
            variant="outline" 
            disabled 
            className="bg-white/20 border-white/30 text-white/70 backdrop-blur-sm cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export 📥 (Soon)
          </Button>
        </div>
      </div>

      {/* Search and Filters Card with Purple Border */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
              <Input
                placeholder="🔍 Search by admin, action, or target..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Select value={actionFilter} onValueChange={(value) => {
              setActionFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-40 border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
              <SelectTrigger className="w-full sm:w-40 border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">👤 Users</SelectItem>
                <SelectItem value="event">📅 Events</SelectItem>
                <SelectItem value="order">🎟️ Orders</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || actionFilter !== 'all' || targetFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={handleResetFilters} 
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
              >
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count with Color */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Activity className="h-4 w-4 text-purple-500" />
        Showing <span className="font-semibold text-purple-700">{filteredLogs.length}</span> of <span className="font-semibold">{totalCount}</span> log entr{totalCount !== 1 ? 'ies' : 'y'}
      </div>

      {/* Logs Table Card with Blue Accent */}
      <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <TableRow>
                  <TableHead className="text-purple-800">⏰ Timestamp</TableHead>
                  <TableHead className="text-purple-800">👤 Admin</TableHead>
                  <TableHead className="text-purple-800">📋 Action</TableHead>
                  <TableHead className="text-purple-800">🎯 Target</TableHead>
                  <TableHead className="text-purple-800">📄 Details</TableHead>
                  <TableHead className="text-purple-800">🌐 IP Address</TableHead>
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
                            className="text-purple-600"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-400" />
                          <span className="text-sm font-medium">{formatDate(log.createdAt)}</span>
                          <span className="text-xs text-gray-400 ml-1">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{log.adminName}</p>
                            <p className="text-xs text-gray-500">{log.adminEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getTargetBadge(log.targetType)}
                          <p className="text-sm font-medium text-gray-700">{log.targetName}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {log.targetId.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium">
                            <Server className="h-3 w-3" />
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto max-w-xs border border-gray-200">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-purple-50 px-2 py-1 rounded font-mono text-purple-700 border border-purple-100">
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
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
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
        </div>
      )}

      {/* Stats Summary with Colorful Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{logs.length.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Total Log Entries 📊</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {new Set(logs.map(l => l.adminEmail)).size}
                </p>
                <p className="text-sm text-blue-600">Active Admins 👥</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {logs.filter(l => l.action.includes('verify')).length}
                </p>
                <p className="text-sm text-emerald-600">Verifications ✅</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {logs.filter(l => l.createdAt > new Date(Date.now() - 7 * 86400000).toISOString()).length}
                </p>
                <p className="text-sm text-amber-600">Last 7 Days 📅</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}