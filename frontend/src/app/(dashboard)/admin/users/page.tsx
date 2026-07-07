/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Admin Users Management Page
 * Allows admin to view, search, filter, verify, and suspend organizer accounts safely.
 * @module AdminUsersPage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Phone,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  RotateCcw,
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

// Custom components
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { Pagination } from '@/components/common/Pagination'

// Utilities
import api from '@/lib/api'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

// Type definitions
interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: 'organizer' | 'admin'
  isEmailVerified: boolean
  isActive: boolean
  eventsCount: number
  createdAt: string
}

interface SystemStats {
  total: number
  verified: number
  suspended: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null)
  const [userToVerify, setUserToVerify] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Batch processing confirmation guards
  const [showBatchVerifyDialog, setShowBatchVerifyDialog] = useState(false)
  const [showBatchSuspendDialog, setShowBatchSuspendDialog] = useState(false)

  // System-wide Global Counters (instead of local array filtering)
  const [stats, setStats] = useState<SystemStats>({ total: 0, verified: 0, suspended: 0 })
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce search term input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset page back to index head on query manipulation
    }, 400)

    return () => clearTimeout(handler)
  }, [searchTerm])

  /**
   * Fetch users from API with pagination parameters and search vectors
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', {
        params: {
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      })
      
      if (Array.isArray(response.data)) {
        setUsers(response.data)
        setTotalPages(Math.ceil((response.data.length || 0) / pageSize) || 1)
        setStats({
          total: response.data.length,
          verified: response.data.filter((u: any) => u.isEmailVerified).length,
          suspended: response.data.filter((u: any) => !u.isActive).length,
        })
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('❌ Request failed: Admin records could not be fetched')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearch, statusFilter])

  // Clear tracking matrices across selection mutations to prevent state reference drifting
  useEffect(() => {
    setSelectedUsers(new Set())
  }, [page, pageSize, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filterableUsers = users.filter((user) => user.role !== 'admin')

  const handleSelectAll = () => {
    if (selectedUsers.size === filterableUsers.length && filterableUsers.length > 0) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filterableUsers.map((u) => u.id)))
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleVerifyUser = async () => {
    if (!userToVerify) return
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userToVerify.id}/verify`)
      toast.success(`✅ Profile for ${userToVerify.fullName} verified successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Failed to verify user:', error)
      toast.error('❌ Request failed: Target identity verification update rejected')
    } finally {
      setIsProcessing(false)
      setUserToVerify(null)
    }
  }

  const handleSuspendUser = async () => {
    if (!userToSuspend) return
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userToSuspend.id}/suspend`)
      toast.success(`⛔ Access context for ${userToSuspend.fullName} suspended successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Failed to suspend user:', error)
      toast.error('❌ Request failed: Context suspension command dropped')
    } finally {
      setIsProcessing(false)
      setUserToSuspend(null)
    }
  }

  const handleRestoreUser = async (userId: string) => {
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userId}/unsuspend`)
      toast.success(`✅ Account permission levels cleared and active access restored`)
      fetchUsers()
    } catch (error) {
      console.error('Failed to restore user:', error)
      toast.error('❌ Request failed: Target active structural reset failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchVerify = async () => {
    if (selectedUsers.size === 0) return
    setIsProcessing(true)
    try {
      await api.post('/admin/users/batch-verify', { user_ids: Array.from(selectedUsers) })
      toast.success(`✅ Parameters verified for ${selectedUsers.size} accounts`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      console.error('Failed to batch verify users:', error)
      toast.error('❌ Request failed: Batch execution sequence tracking error')
    } finally {
      setIsProcessing(false)
      setShowBatchVerifyDialog(false)
    }
  }

  const handleBatchSuspend = async () => {
    if (selectedUsers.size === 0) return
    setIsProcessing(true)
    try {
      await api.post('/admin/users/batch-suspend', { user_ids: Array.from(selectedUsers) })
      toast.success(`⛔ Access constraints configured successfully across ${selectedUsers.size} records`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      console.error('Failed to batch suspend users:', error)
      toast.error('❌ Request failed: Mass modification script failure state')
    } finally {
      setIsProcessing(false)
      setShowBatchSuspendDialog(false)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1.5 font-bold tracking-wide rounded-md px-2.5 py-0.5">
          <XCircle className="h-3 w-3 shrink-0" />
          Suspended
        </Badge>
      )
    }
    if (user.isEmailVerified) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-50 flex items-center gap-1.5 font-bold tracking-wide rounded-md px-2.5 py-0.5">
          <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
          Verified
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5 font-bold text-foreground tracking-wide rounded-md px-2.5 py-0.5">
        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
        Pending
      </Badge>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
        <Skeleton className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-slate-200 rounded-lg" />
            <Skeleton className="h-4 w-80 bg-slate-200 rounded-md" />
          </div>
          <Skeleton className="h-10 w-40 bg-slate-200 rounded-xl" />
        </div>
        <Skeleton className="h-20 w-full bg-slate-200 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-foreground">
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'User Management', href: '#', isActive: true },
        ]}
        showHome
      />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5 bg-gradient-br from-blue-500 via-indigo-500 to-purple-500">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-300 rounded-xl border border-purple-400 shadow-sm">
            <Shield className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">User Management 👥</h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              Overview operational matrices and configurations across systemic platform organizers.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          {selectedUsers.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowBatchVerifyDialog(true)}
                disabled={isProcessing}
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold rounded-xl shadow-sm transition-colors text-xs"
              >
                <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-600" />
                Verify Targets ({selectedUsers.size})
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBatchSuspendDialog(true)}
                disabled={isProcessing}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-bold rounded-xl shadow-sm transition-colors text-xs"
              >
                <XCircle className="h-4 w-4 mr-1.5 text-red-600" />
                Suspend Targets ({selectedUsers.size})
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border border-border rounded-2xl shadow-sm overflow-hidden bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-3.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="🔍 Track fields by specific profile names, emails, routing contact links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/50 border-border text-sm font-medium placeholder:text-muted-foreground focus-visible:bg-card"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-52 h-11 border-border bg-muted/50 rounded-xl text-sm font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card bg-whte">
                  <SelectItem value="all" className="font-medium text-foreground">All System Accounts</SelectItem>
                  <SelectItem value="verified" className="font-medium text-foreground"> Verified Profiles Only</SelectItem>
                  <SelectItem value="pending" className="font-medium text-foreground"> Pending Validations</SelectItem>
                  <SelectItem value="suspended" className="font-medium text-foreground"> Suspended Segments</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  onClick={handleResetFilters} 
                  className="h-11 rounded-xl text-xs font-bold text-muted-foreground border border-border hover:bg-muted/50 px-4 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset Configuration Options
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground font-bold tracking-wide uppercase flex items-center gap-1.5 px-1">
        <Users className="h-4 w-4 text-purple-600" />
        Evaluation Space Includes: {users.length} Mapped Page Nodes of {stats.total} Profile Records Total
      </div>

      <Card className="border border-border rounded-2xl shadow-sm overflow-hidden bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50/70 border-b border-slate-100">
                <TableRow>
                  <TableHead className="w-12 px-4 py-3.5">
                    <div className="flex items-center h-5">
                      <Checkbox
                        id="select-all-checkbox"
                        checked={selectedUsers.size === filterableUsers.length && filterableUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                        disabled={filterableUsers.length === 0}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-3.5">👤 Operator Identity Details</TableHead>
                  <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-3.5">📧 Communication Routing Channels</TableHead>
                  <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-3.5">🎟️ Associated Events</TableHead>
                  <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-3.5">📊 Verified Matrix State</TableHead>
                  <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-3.5">📅 Origin Date Index</TableHead>
                  <TableHead className="w-12 py-3.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 bg-muted/50/20">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="p-3 bg-muted/30 rounded-full border border-border">
                          <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-foreground font-bold text-sm">No Active User Matches Found 📭</p>
                          <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                            Your criteria returned an empty index configuration.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isSuspendedUser = !user.isActive
                    const isAdminUser = user.role === 'admin'
                    
                    return (
                      <TableRow 
                        key={user.id} 
                        className={`transition-colors border-b border-slate-100 hover:bg-muted/50/50 ${
                          isSuspendedUser ? 'bg-muted/50/70 opacity-90' : ''
                        }`}
                      >
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center h-5">
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={() => handleSelectUser(user.id)}
                              disabled={isAdminUser}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border ${
                              isAdminUser 
                                ? 'bg-purple-100 border-purple-200 text-purple-700' 
                                : 'bg-muted/30 border-border text-muted-foreground'
                            }`}>
                              <Shield className="h-4 w-4 shrink-0" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-950 text-sm tracking-tight">{user.fullName}</p>
                              {isAdminUser && (
                                <Badge variant="outline" className="text-[10px] font-black tracking-wider uppercase bg-purple-50 text-purple-700 border-purple-200 rounded-md px-1.5">
                                   System Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1 font-medium text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[180px]">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{user.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-baseline text-foreground font-black text-sm">
                            {user.eventsCount}
                            <span className="text-muted-foreground font-medium text-xs ml-1">listings</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(user)}</TableCell>
                        <TableCell className="py-4 text-xs font-semibold text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-4">
                          {!isAdminUser ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/30 text-muted-foreground">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl min-w-[160px] p-1 shadow-md border border-slate-100">
                                {!user.isEmailVerified && (
                                  <DropdownMenuItem 
                                    onClick={() => setUserToVerify(user)}
                                    className="rounded-lg text-xs font-bold text-foreground focus:bg-muted/50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                    Verify Profile Credentials
                                  </DropdownMenuItem>
                                )}
                                {user.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => setUserToSuspend(user)}
                                    className="rounded-lg text-xs font-bold text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    Suspend Workspace Access
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleRestoreUser(user.id)}
                                    className="rounded-lg text-xs font-bold text-foreground focus:bg-muted/50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                                    Restore Authorization Permissions
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="w-8 h-8" />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="border border-border rounded-2xl bg-card p-3 shadow-sm">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            totalItems={stats.total}
            showFirstLast
          />
        </div>
      )}

      {/* Analytics System Cards using Global state updates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <Card className="border border-border rounded-2xl shadow-sm bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-950">{stats.total}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Active Pool Nodes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-2xl shadow-sm bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-emerald-700">{stats.verified}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verified Segment Bounds</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-2xl shadow-sm bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-700">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-red-600">{stats.suspended}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suspended Isolation Groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Action Confirmation Panels */}
      <ConfirmationDialog
        open={!!userToVerify}
        onOpenChange={() => setUserToVerify(null)}
        onConfirm={handleVerifyUser}
        title="✅ Verify User Account"
        description={`Are you sure you want to verify ${userToVerify?.fullName}'s identity context parameters?`}
        confirmText="Confirm Verification"
        cancelText="Abort"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationDialog
        open={!!userToSuspend}
        onOpenChange={() => setUserToSuspend(null)}
        onConfirm={handleSuspendUser}
        title="⛔ Suspend User Account"
        description={`Are you sure you want to restrict platform orchestration access for ${userToSuspend?.fullName}?`}
        confirmText="Execute Restriction Routine"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Batch Processing Safety Dialogs */}
      <ConfirmationDialog
        open={showBatchVerifyDialog}
        onOpenChange={() => setShowBatchVerifyDialog(false)}
        onConfirm={handleBatchVerify}
        title="⚠️ Batch Verify User Accounts"
        description={`Are you sure you want to bulk verify all ${selectedUsers.size} selected accounts simultaneously?`}
        confirmText="Execute Mass Verification"
        cancelText="Abort Batch"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationDialog
        open={showBatchSuspendDialog}
        onOpenChange={() => setShowBatchSuspendDialog(false)}
        onConfirm={handleBatchSuspend}
        title="🚨 Bulk Critical Suspension Action"
        description={`WARNING: You are about to terminate workspace orchestration access for ${selectedUsers.size} user entities. This operation propagates instantly.`}
        confirmText="Confirm Global Suspension"
        cancelText="Abort Batch Action"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  )
}