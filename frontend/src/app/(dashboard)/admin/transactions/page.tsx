/**
 * Admin Transactions Page
 * 
 * Allows admin to view all payment transactions across the platform.
 * Features include:
 * - Search by transaction ID, attendee name, or email
 * - Filter by payment status and method
 * - Sort by date
 * - View transaction details
 * - Manual refund (for disputes)
 * - Pagination for large transaction lists
 * - Breadcrumb navigation
 * - Confirmation dialog for refunds
 * 
 * @module AdminTransactionsPage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Wallet,
  CreditCard,
  Smartphone,
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
import { formatDate, formatCurrency } from '@/lib/utils'

// Type definitions
interface Transaction {
  id: string
  transactionId: string
  orderId: string
  attendeeName: string
  attendeePhone: string
  eventTitle: string
  organizerName: string
  amount: number
  paymentMethod: 'mtn_momo' | 'orange_money'
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  paidAt: string | null
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [transactionToRefund, setTransactionToRefund] = useState<Transaction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch transactions on component mount or when page/pageSize changes
  useEffect(() => {
    fetchTransactions()
  }, [page, pageSize])

  /**
   * Fetch all transactions from API with pagination
   */
  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/transactions', {
        params: {
          page,
          limit: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          method: methodFilter !== 'all' ? methodFilter : undefined,
        },
      })
      setTransactions(response.data.transactions || [])
      setTotalCount(response.data.total || 0)
      setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchTerm, statusFilter, methodFilter])

  /**
   * Filter transactions based on search term and filters (client-side after fetch)
   */
  const filteredTransactions = (transactions || []).filter((transaction) => {
    const matchesSearch =
      searchTerm === '' ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesMethod = methodFilter === 'all' || transaction.paymentMethod === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  /**
   * Refund a transaction
   */
  const handleRefund = async () => {
    if (!transactionToRefund) return
    
    setIsProcessing(true)
    try {
      await api.post(`/admin/transactions/${transactionToRefund.transactionId}/refund`)
      toast.success(`✅ Refund processed for ${transactionToRefund.attendeeName}`)
      fetchTransactions()
    } catch (error) {
      toast.error('❌ Failed to refund transaction')
    } finally {
      setIsProcessing(false)
      setTransactionToRefund(null)
    }
  }

  /**
   * Reset search and filters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMethodFilter('all')
    setPage(1)
  }

  /**
   * Get status badge for transaction with icon
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid ✅
        </Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending ⏳
        </Badge>
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed ❌
        </Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Refunded 🔄
        </Badge>
      default:
        return null
    }
  }

  /**
   * Get payment method badge with emoji
   */
  const getMethodBadge = (method: string) => {
    if (method === 'mtn_momo') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
        <Smartphone className="h-3 w-3" />
        MTN Momo 💛
      </Badge>
    }
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
      <Smartphone className="h-3 w-3" />
      Orange Money 🧡
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
          <Skeleton className="h-10 w-32" />
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
          { label: 'Transactions', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header with Purple/Blue Gradient */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Transaction History 💰</h1>
            <p className="text-white/80 text-sm mt-0.5">
              View and manage all payment transactions on the platform
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchTransactions()} 
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh 🔄
        </Button>
      </div>

      {/* Search and Filters Card with Purple Border */}
      <Card className="border-l-4 border-l-purple-500 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
              <Input
                placeholder="🔍 Search by transaction ID, attendee name, or event..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-40 border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Status 📊" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">✅ Paid</SelectItem>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="failed">❌ Failed</SelectItem>
                <SelectItem value="refunded">🔄 Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={(value) => {
              setMethodFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-40 border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Payment Method 💳" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mtn_momo">💛 MTN Momo</SelectItem>
                <SelectItem value="orange_money">🧡 Orange Money</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
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
        <CreditCard className="h-4 w-4 text-purple-500" />
        Showing <span className="font-semibold text-purple-700">{filteredTransactions.length}</span> of <span className="font-semibold">{totalCount}</span> transaction{totalCount !== 1 ? 's' : ''}
      </div>

      {/* Transactions Table Card with Blue Accent */}
      <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <TableRow>
                  <TableHead className="text-purple-800">🔑 Transaction ID</TableHead>
                  <TableHead className="text-purple-800">👤 Attendee</TableHead>
                  <TableHead className="text-purple-800">📋 Event / Organizer</TableHead>
                  <TableHead className="text-purple-800">💰 Amount</TableHead>
                  <TableHead className="text-purple-800">💳 Method</TableHead>
                  <TableHead className="text-purple-800">📅 Date</TableHead>
                  <TableHead className="text-purple-800">📊 Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No transactions found 📭</p>
                        {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
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
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell>
                        <code className="text-xs bg-purple-50 px-2 py-1 rounded font-mono text-purple-700 border border-purple-100">
                          {transaction.transactionId.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-800">{transaction.attendeeName}</p>
                          <p className="text-xs text-gray-500">{transaction.attendeePhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{transaction.eventTitle}</p>
                          <p className="text-xs text-gray-500">by {transaction.organizerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getMethodBadge(transaction.paymentMethod)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-400" />
                          <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.status === 'paid' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-purple-500 hover:text-purple-700 hover:bg-purple-50">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-purple-200">
                              <DropdownMenuItem
                                onClick={() => setTransactionToRefund(transaction)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refund Payment 🔄
                              </DropdownMenuItem>
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
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
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
        </div>
      )}

      {/* Stats Summary with Colorful Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <CreditCard className="h-7 w-7 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{transactions.length}</p>
              <p className="text-sm text-purple-600">Total Transactions 📊</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-7 w-7 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">
                {transactions.filter(t => t.status === 'paid').length}
              </p>
              <p className="text-sm text-emerald-600">Successful Payments ✅</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-7 w-7 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-sm text-blue-600">Total Revenue 💰</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-400">+</span>
                <Smartphone className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {transactions.filter(t => t.paymentMethod === 'mtn_momo').length}
                <span className="text-sm text-gray-500 mx-1">/</span>
                {transactions.filter(t => t.paymentMethod === 'orange_money').length}
              </p>
              <p className="text-sm text-amber-600">MTN Momo / Orange Money 💛🧡</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Confirmation Dialog with Warning Styling */}
      <ConfirmationDialog
        open={!!transactionToRefund}
        onOpenChange={() => setTransactionToRefund(null)}
        onConfirm={handleRefund}
        title="🔄 Refund Payment"
        description={`Are you sure you want to refund this payment to ${transactionToRefund?.attendeeName}?`}
        confirmText="Yes, Refund Payment"
        cancelText="Cancel"
        variant="warning"
        isLoading={isProcessing}
      >
        <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Warning! This action is permanent.</span>
          </div>
          <div className="space-y-2 text-sm bg-white/60 p-3 rounded-lg">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID:</span>
              <code className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {transactionToRefund?.transactionId}
              </code>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Attendee:</span>
              <span className="font-medium">{transactionToRefund?.attendeeName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-red-600">{formatCurrency(transactionToRefund?.amount || 0)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{transactionToRefund?.eventTitle}</span>
            </div>
          </div>
          <div className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-100">
            <p className="font-medium">⚠️ Refunding will:</p>
            <ul className="list-disc list-inside ml-2 text-xs space-y-0.5 mt-1">
              <li>Mark the ticket as invalid</li>
              <li>Prevent check-in access</li>
              <li>This action cannot be reversed</li>
            </ul>
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  )
}