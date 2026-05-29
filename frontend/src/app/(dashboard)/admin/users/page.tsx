/**
 * Admin Users Management Page
 * 
 * Allows admin to view, search, filter, verify, and suspend organizer accounts.
 * Features include:
 * - Search by name, email, or phone
 * - Filter by verification status
 * - Batch actions (verify/suspend selected)
 * - Individual user actions
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
} from 'lucide-react'

// shadcn/ui components
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Badge } from '@/src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Skeleton } from '@/src/components/ui/skeleton'

// Utilities
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { formatDate } from '@/src/lib/utils'

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

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  /**
   * Fetch all users from API
   */
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter users based on search term and status filter
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
  const handleVerifyUser = async (userId: string) => {
    setIsProcessing(true)
    try {
      await api.put(`/admin/users/${userId}/verify`)
      toast.success('User verified successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to verify user')
    } finally {
      setIsProcessing(false)
      setUserToVerify(null)
    }
  }

  /**
   * Suspend or unsuspend a user
   */
  const handleToggleSuspend = async (userId: string, shouldSuspend: boolean) => {
    setIsProcessing(true)
    try {
      if (shouldSuspend) {
        await api.put(`/admin/users/${userId}/suspend`)
        toast.success('User suspended')
      } else {
        await api.put(`/admin/users/${userId}/unsuspend`)
        toast.success('User restored')
      }
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    } finally {
      setIsProcessing(false)
      setUserToSuspend(null)
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
      toast.success(`${selectedUsers.size} users verified`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      toast.error('Failed to verify users')
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
      toast.success(`${selectedUsers.size} users suspended`)
      setSelectedUsers(new Set())
      fetchUsers()
    } catch (error) {
      toast.error('Failed to suspend users')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Get status badge for user
   */
  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Suspended</Badge>
    }
    if (user.isEmailVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    }
    return <Badge variant="secondary">Pending Verification</Badge>
  }

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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500 mt-1">
            Manage all organizer accounts on the platform
          </p>
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No users found</p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm('')
                              setStatusFilter('all')
                            }}
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
                              <Badge variant="outline" className="text-xs">
                                Admin
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
                                  Verify Account
                                </DropdownMenuItem>
                              )}
                              {user.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => setUserToSuspend(user)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Suspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleToggleSuspend(user.id, false)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Restore Account
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isEmailVerified && u.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Verified Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {users.filter(u => !u.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Suspended Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify User Dialog */}
      <Dialog open={!!userToVerify} onOpenChange={() => setUserToVerify(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify {userToVerify?.fullName}'s account?
              This will mark their email as verified and allow them to create events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToVerify(null)}>
              Cancel
            </Button>
            <Button onClick={() => userToVerify && handleVerifyUser(userToVerify.id)}>
              Verify Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={!!userToSuspend} onOpenChange={() => setUserToSuspend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {userToSuspend?.fullName}'s account?
              Suspended users cannot create events or access their dashboard.
              This action can be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToSuspend(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToSuspend && handleToggleSuspend(userToSuspend.id, true)}
            >
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}