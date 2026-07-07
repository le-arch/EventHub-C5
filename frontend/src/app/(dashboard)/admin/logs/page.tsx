/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin System Logs Page
 * * Allows admin to view system activity logs.
 * Features include:
 * - View all admin actions
 * - Search by user or action
 * - Filter by date range
 * - Filter by action type
 * - Pagination for large log lists
 * - Breadcrumb navigation
 * - Export logs (coming soon)
 * * @module AdminLogsPage
 */

'use client'

import { useState, useEffect, useDeferredValue } from 'react'
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

// Action type badges with optimized light-mode readability metrics
const getActionBadge = (action: string) => {
  const normalized = action.toLowerCase()
  if (normalized.includes('verify')) 
    return <Badge className="bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 shadow-sm">✅ Verify</Badge>
  if (normalized.includes('suspend')) 
    return <Badge variant="destructive" className="bg-red-100 text-red-950 font-bold border border-red-300 shadow-sm hover:bg-red-100">⛔ Suspend</Badge>
  if (normalized.includes('delete')) 
    return <Badge variant="destructive" className="bg-rose-100 text-rose-950 font-bold border border-rose-300 shadow-sm hover:bg-rose-100">🗑️ Delete</Badge>
  if (normalized.includes('refund')) 
    return <Badge className="bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-sm">🔄 Refund</Badge>
  if (normalized.includes('cancel')) 
    return <Badge className="bg-orange-100 text-orange-950 font-bold border border-orange-300 shadow-sm">❌ Cancel</Badge>
  if (normalized.includes('publish')) 
    return <Badge className="bg-blue-100 text-blue-950 font-bold border border-blue-300 shadow-sm">📢 Publish</Badge>
  if (normalized.includes('login')) 
    return <Badge variant="outline" className="bg-muted/30 text-foreground font-bold border border-slate-300 shadow-sm">🔑 Login</Badge>
  if (normalized.includes('logout')) 
    return <Badge variant="outline" className="bg-zinc-100 text-zinc-900 font-bold border border-zinc-300 shadow-sm">🚪 Logout</Badge>
  return <Badge variant="outline" className="bg-purple-100 text-purple-950 font-bold border border-purple-300 shadow-sm">📝 {action}</Badge>
}

// Target type badges with high contrast foreground shades
const getTargetBadge = (targetType: string) => {
  switch (targetType) {
    case 'user':
      return <Badge variant="outline" className="bg-blue-100 text-blue-950 font-bold border border-blue-300 shadow-sm">👤 User</Badge>
    case 'event':
      return <Badge variant="outline" className="bg-purple-100 text-purple-950 font-bold border border-purple-300 shadow-sm">📅 Event</Badge>
    case 'order':
      return <Badge variant="outline" className="bg-cyan-100 text-cyan-950 font-bold border border-cyan-300 shadow-sm">🎟️ Order</Badge>
    default:
      return <Badge variant="outline" className="bg-muted/30 text-foreground font-bold border border-slate-300 shadow-sm">⚙️ System</Badge>
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

  // Use deferred value for API filtering search optimization
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // Sync server side requests when UI state variables scale or shift parameters
  useEffect(() => {
    fetchLogs()
  }, [page, pageSize, deferredSearchTerm, actionFilter, targetFilter])

  /**
   * Fetch system logs from API with server side filters applied
   */
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/logs', {
        params: {
          page,
          limit: pageSize,
          search: deferredSearchTerm || undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          targetType: targetFilter !== 'all' ? targetFilter : undefined,
        },
      })
      setLogs(response.data.logs || [])
      setTotalCount(response.data.total || 0)
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize) || 1)
    } catch (error) {
      toast.error('❌ Failed to load infrastructure logs pipeline')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset search and filter configurations back to factory parameters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setTargetFilter('all')
    setPage(1)
  }

  // Loading skeleton configuration
  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 bg-[#fcfaff] min-h-screen">
        <Skeleton className="h-6 w-64 bg-purple-200/50" />
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2 bg-purple-200/50" />
            <Skeleton className="h-4 w-64 bg-purple-200/50" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 bg-purple-200/50" />
            <Skeleton className="h-10 w-32 bg-purple-200/50" />
          </div>
        </div>
        <Skeleton className="h-12 w-full bg-purple-200/50" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-purple-200/50" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md mx-auto bg-purple-200/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 bg-[#fcfaff] min-h-screen text-foreground">
      {/* BreadCrumb Shell */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'System Logs', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Hero Header Control Layout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-slate-800 via-indigo-950 to-purple-900 p-6 rounded-2xl shadow-md text-white border border-slate-950">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl border border-white/20 shadow-inner backdrop-blur-md">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">System Activity Logs <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" > 📋</span> </h1>
            <p className="text-purple-200/90 text-sm font-medium mt-0.5">
              Comprehensive trace logs detailing cryptographic actions, account adjustments, and system mutations.
            </p>
          </div>
        </div>
        <div className="flex sm:items-center gap-3 w-full lg:w-auto shrink-0">
          <Button 
            variant="outline" 
            onClick={fetchLogs}
            className="bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:text-white font-bold py-5 px-4 rounded-xl shadow-sm backdrop-blur-sm flex-1 sm:flex-initial"
          >
            <RefreshCw className="h-4 w-4 mr-2 text-foreground" />
            Refresh Log 
          </Button>
          <Button 
            variant="outline" 
            disabled 
            className="bg-slate-800/40 text-muted-foreground border border-slate-800 font-bold py-5 px-4 rounded-xl flex-1 sm:flex-initial"
          >
            <Download className="h-4 w-4 mr-2 text-brown-700" />
            Export CSV 
          </Button>
        </div>
      </div>

      {/* Search and Filters Architecture Block */}
      <Card className="border-2 border-purple-100 bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-600 z-10" />
              <Input
                placeholder="🔍 Search entries by administrator signature, action code, or target details..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-11 pr-4 py-6 text-foreground placeholder:text-muted-foreground font-medium border-2 border-purple-100 focus-visible:border-purple-500 focus-visible:ring-purple-500 rounded-xl shadow-sm bg-card"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={actionFilter} onValueChange={(value) => {
                setActionFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full py-6 border-2 border-purple-100 text-foreground font-bold focus:border-purple-500 focus:ring-purple-500 bg-card rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-purple-600" />
                    <SelectValue placeholder="Action Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-2 border-purple-100 bg-card font-semibold bg-white">
                  <SelectItem value="all" className="text-foreground">All Operations</SelectItem>
                  <SelectItem value="verify" className="text-emerald-950"> Verify actions</SelectItem>
                  <SelectItem value="suspend" className="text-red-950"> Suspend actions</SelectItem>
                  <SelectItem value="delete" className="text-rose-950"> Delete actions</SelectItem>
                  <SelectItem value="refund" className="text-amber-950"> Refund actions</SelectItem>
                  <SelectItem value="cancel" className="text-orange-950"> Cancel actions</SelectItem>
                  <SelectItem value="publish" className="text-blue-950"> Publish actions</SelectItem>
                  <SelectItem value="login" className="text-foreground"> Logins</SelectItem>
                  <SelectItem value="logout" className="text-zinc-900"> Logouts</SelectItem>
                </SelectContent>
              </Select>

              <Select value={targetFilter} onValueChange={(value) => {
                setTargetFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full py-6 border-2 border-purple-100 text-foreground font-bold focus:border-purple-500 focus:ring-purple-500 bg-card rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <SelectValue placeholder="Target Type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-2 border-purple-100 bg-card font-semibold bg-white">
                  <SelectItem value="all" className="text-foreground">All Data Classes</SelectItem>
                  <SelectItem value="user" className="text-blue-950"> User Targets</SelectItem>
                  <SelectItem value="event" className="text-purple-950"> Event Targets</SelectItem>
                  <SelectItem value="order" className="text-cyan-950"> Order Targets</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || actionFilter !== 'all' || targetFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters} 
                  className="border-2 border-red-200 text-red-700 font-bold hover:bg-red-50 hover:text-red-800 py-6 px-4 rounded-xl shadow-sm"
                >
                  Clear Filters ✕
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracker Status Metatag */}
      <div className="text-sm text-foreground flex items-center gap-2 px-1 font-semibold">
        <Activity className="h-4 w-4 text-purple-600 animate-pulse" />
        Rendered payload stream maps <span className="text-purple-700 font-black">{logs.length}</span> nodes out of <span className="text-foreground font-black">{totalCount}</span> total pipeline index entries
      </div>

      {/* Infrastructure Core Logs Grid Spread Table */}
      <Card className="border-l-4 border-purple-100 bg-card shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-purple-100/60 border-b border-purple-200">
                <TableRow>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >⏰</span> Production Timestamp</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >👤</span> Signed Admin Agent</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >📋</span> Mutator Action</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >🎯</span> Target Reference</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >📄</span> Metadata JSON</TableHead>
                  <TableHead className="text-purple-950 font-black text-sm py-4"><span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" >🌐</span> Handshake IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 bg-card">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-100">
                          <AlertCircle className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-foreground font-black text-lg">No audit entries match parameters 📭</p>
                        <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
                          Your filtration parameters returned zero transaction hashes. Clear query fields to monitor active clusters.
                        </p>
                        {(searchTerm || actionFilter !== 'all' || targetFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={handleResetFilters}
                            className="text-purple-700 font-bold underline decoration-2 hover:text-purple-900 mt-1"
                          >
                            Reset filters pipeline 
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-purple-50/50 border-b border-purple-100/60 transition-colors">
                      <TableCell className="whitespace-nowrap py-4">
                        <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span>{formatDate(log.createdAt)}</span>
                          <span className="text-xs font-semibold text-purple-900/60 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none">{log.adminName}</p>
                            <p className="text-xs font-semibold text-muted-foreground mt-1">{log.adminEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{getActionBadge(log.action)}</TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          {getTargetBadge(log.targetType)}
                          <p className="text-sm font-bold text-foreground leading-tight">{log.targetName}</p>
                          <code className="block text-xs text-purple-700 font-mono font-bold bg-purple-50/50 border border-purple-100/60 rounded px-1 w-max">
                            ID: {log.targetId ? log.targetId.slice(0, 8) : 'N/A'}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <details className="text-xs group">
                          <summary className="cursor-pointer text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 list-none bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded-lg w-max transition-all shadow-sm">
                            <Server className="h-3.5 w-3.5" />
                            <span>Inspect Payload</span>
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-w-xs md:max-w-md border border-slate-950 shadow-inner">
                            {JSON.stringify(log.details || {}, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell className="py-4">
                        <code className="text-xs bg-muted/30 text-foreground border border-border font-black px-2.5 py-1 rounded-lg font-mono shadow-inner shadow-muted/50">
                          {log.ipAddress || '127.0.0.1'}
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

      {/* Pagination Module Row */}
      {totalPages > 1 && (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-purple-100">
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

      {/* Aggregate Stats Analytics Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200 bg-card shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-foreground tracking-tight">{totalCount.toLocaleString()}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Entries </p>
              </div>
              <Activity className="h-8 w-8 text-purple-700 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-indigo-200 bg-card shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-indigo-9ived tracking-tight">
                  {new Set(logs.map(l => l.adminEmail)).size}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Active Clusters </p>
              </div>
              <Shield className="h-8 w-8 text-indigo-700 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-300 bg-card shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-emerald-800 tracking-tight">
                  {logs.filter(l => l.action.toLowerCase().includes('verify')).length}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Verifications </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-200 bg-card shadow-sm rounded-xl">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-amber-900 tracking-tight">
                  {logs.filter(l => l.createdAt > new Date(Date.now() - 7 * 86400000).toISOString()).length}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Rolling 7-Day Cycle </p>
              </div>
              <Calendar className="h-8 w-8 text-amber-700 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}