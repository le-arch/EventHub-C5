/**
 * Admin Users Management Page
 * 
 * Allows admin to view, search, filter, verify, and suspend organizer accounts.
 * Features include:
 * - Search by name, email, or phone
 * - Filter by verification status
 * - Batch actions (verify/suspend selected)
 * - Individual user actions
 * - Pagination for large user lists
 * - Breadcrumb navigation
 * - Confirmation dialogs for actions
 * 
 * @module AdminUsersPage
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null)
  const [userToVerify, setUserToVerify] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch users on component mount or when page/pageSize changes
  useEffect(() => {
    fetchUsers()
  }, [page, pageSize])

  /**
   * Fetch all users from API with pagination
   */
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      })
      setUsers(response.data.users)
      setTotalCount(response.data.total)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter users based on search term and status filter (client-side after fetch)
   */
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    // Status filter
    let matchesStatus = true
    if (statusFilter === 'verified') {
      matchesStatus = user.isEmailVerified && user.isActive
    } else if (statusFilter === 'pending') {
      matchesStatus = !user.isEmailVerified
    } else if (statusFilter === 'suspended') {
      matchesStatus = !user.isActive
    }

    return matchesSearch && matchesStatus
  })

  /**
   * Handle select/deselect all users
   */
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  /**
   * Handle select/deselect single user
   */
  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  /**
   * Verify a user (mark email as verified)
   */
  const handleVerifyUser = async () => {
    if (!userToVerify) return
    
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userToVerify.id}/verify`)
      toast.success(`✅ ${userToVerify.fullName} verified successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('❌ Failed to verify user')
    } finally {
      setIsProcessing(false)
      setUserToVerify(null)
    }
  }

  /**
   * Suspend a user
   */
  const handleSuspendUser = async () => {
    if (!userToSuspend) return
    
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userToSuspend.id}/suspend`)
      toast.success(`⛔ ${userToSuspend.fullName} suspended successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('❌ Failed to suspend user')
    } finally {
      setIsProcessing(false)
      setUserToSuspend(null)
    }
  }

  /**
   * Restore a suspended user
   */
  const handleRestoreUser = async (userId: string) => {
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userId}/unsuspend`)
      toast.success(`✅ User restored successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('❌ Failed to restore user')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Batch verify selected users
   */
  const handleBatchVerify = async () => {
    if (selectedUsers.size === 0) return
    setIsProcessing(true)
    try {
      await api.post('/admin/users/batch-verify', { userIds: Array.from(selectedUsers) })
      toast.success(`✅ ${selectedUsers.size} users verified successfully`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      toast.error('❌ Failed to verify users')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Batch suspend selected users
   */
  const handleBatchSuspend = async () => {
    if (selectedUsers.size === 0) return
    setIsProcessing(true)
    try {
      await api.post('/admin/users/batch-suspend', { userIds: Array.from(selectedUsers) })
      toast.success(`⛔ ${selectedUsers.size} users suspended successfully`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      toast.error('❌ Failed to suspend users')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Reset search and filters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPage(1)
  }

  /**
   * Get status badge for user
   */
  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Suspended
      </Badge>
    }
    if (user.isEmailVerified) {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    }
    return <Badge variant="secondary" className="flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      Pending
    </Badge>
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
          <Skeleton className="h-10 w-64" />
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
          { label: 'User Management', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management 👥</h1>
            <p className="text-gray-500 mt-1">
              Manage all organizer accounts on the platform
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedUsers.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBatchVerify}
                disabled={isProcessing}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Selected ({selectedUsers.size})
              </Button>
              <Button
                variant="outline"
                onClick={handleBatchSuspend}
                disabled={isProcessing}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Suspend Selected ({selectedUsers.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="🔍 Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">✅ Verified Only</SelectItem>
                <SelectItem value="pending">⏳ Pending Verification</SelectItem>
                <SelectItem value="suspended">⛔ Suspended</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="ghost" onClick={handleResetFilters} className="sm:w-auto">
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Count */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Showing {filteredUsers.length} of {totalCount} user{totalCount !== 1 ? 's' : ''}
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>👤 User</TableHead>
                  <TableHead>📧 Contact</TableHead>
                  <TableHead>🎟️ Events</TableHead>
                  <TableHead>📊 Status</TableHead>
                  <TableHead>📅 Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No users found 📭</p>
                        {(searchTerm || statusFilter !== 'all') && (
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
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={!user.isActive ? 'bg-red-50/50' : ''}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300"
                          disabled={user.role === 'admin'}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            {user.role === 'admin' && (
                              <Badge variant="outline" className="text-xs bg-purple-50">
                                👑 Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.eventsCount}</span>
                        <span className="text-gray-500 text-sm ml-1">events</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!user.isEmailVerified && (
                                <DropdownMenuItem onClick={() => setUserToVerify(user)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  ✅ Verify Account
                                </DropdownMenuItem>
                              )}
                              {user.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => setUserToSuspend(user)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  ⛔ Suspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleRestoreUser(user.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  🔄 Restore Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
          pageSizeOptions={[10, 25, 50, 100]}
          totalItems={totalCount}
          showFirstLast
        />
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users 👥</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isEmailVerified && u.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Verified Users ✅</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserX className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => !u.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Suspended Users ⛔</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify User Confirmation Dialog */}
      <ConfirmationDialog
        open={!!userToVerify}
        onOpenChange={() => setUserToVerify(null)}
        onConfirm={handleVerifyUser}
        title="✅ Verify User Account"
        description={`Are you sure you want to verify ${userToVerify?.fullName}'s account?`}
        confirmText="Yes, Verify Account"
        cancelText="Cancel"
        variant="success"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Verification effects:</span>
          </div>
          <ul className="space-y-1 text-sm text-green-600">
            <li>✓ Mark email as verified</li>
            <li>✓ Allow user to create events</li>
            <li>✓ User will have full access to organizer features</li>
          </ul>
        </div>
      </ConfirmationDialog>

      {/* Suspend Confirmation Dialog */}
      <ConfirmationDialog
        open={!!userToSuspend}
        onOpenChange={() => setUserToSuspend(null)}
        onConfirm={handleSuspendUser}
        title="⛔ Suspend User Account"
        description={`Are you sure you want to suspend ${userToSuspend?.fullName}'s account?`}
        confirmText="Yes, Suspend Account"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Suspension effects:</span>
          </div>
          <ul className="space-y-1 text-sm text-red-600">
            <li>⚠️ User cannot access their dashboard</li>
            <li>⚠️ User cannot create new events</li>
            <li>⚠️ Existing events remain visible</li>
            <li>🔄 This action can be reversed</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </div>
  )
}