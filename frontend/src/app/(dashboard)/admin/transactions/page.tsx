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

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Download,
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
  const fetchTransactions = async () => {
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
      setTransactions(response.data.transactions)
      setTotalCount(response.data.total)
      setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize))
    } catch (error) {
      toast.error('❌ Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter transactions based on search term and filters
   */
  const filteredTransactions = transactions.filter((transaction) => {
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
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid ✅
        </Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending ⏳
        </Badge>
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed ❌
        </Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
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
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Smartphone className="h-3 w-3" />
        MTN Momo 💛
      </Badge>
    }
    return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Transaction History 💰</h1>
            <p className="text-gray-500 mt-1">
              View and manage all payment transactions on the platform
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh 🔄
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="🔍 Search by transaction ID, attendee name, or event..."
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status 📊" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment Method 💳" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mtn_momo">💛 MTN Momo</SelectItem>
                <SelectItem value="orange_money">🧡 Orange Money</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
              <Button variant="ghost" onClick={handleResetFilters} className="sm:w-auto">
                Reset Filters ✕
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Count */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Showing {filteredTransactions.length} of {totalCount} transaction{totalCount !== 1 ? 's' : ''}
      </div>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>🔑 Transaction ID</TableHead>
                  <TableHead>👤 Attendee</TableHead>
                  <TableHead>📋 Event / Organizer</TableHead>
                  <TableHead>💰 Amount</TableHead>
                  <TableHead>💳 Method</TableHead>
                  <TableHead>📅 Date</TableHead>
                  <TableHead>📊 Status</TableHead>
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
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {transaction.transactionId.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.attendeeName}</p>
                          <p className="text-xs text-gray-500">{transaction.attendeePhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{transaction.eventTitle}</p>
                          <p className="text-xs text-gray-500">by {transaction.organizerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getMethodBadge(transaction.paymentMethod)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.status === 'paid' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setTransactionToRefund(transaction)}
                                className="text-red-600"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-gray-500">Total Transactions 📊</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'paid').length}
              </p>
              <p className="text-sm text-gray-500">Successful Payments ✅</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Revenue 💰</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">+</span>
                <Smartphone className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {transactions.filter(t => t.paymentMethod === 'mtn_momo').length}
                <span className="text-sm text-gray-500 mx-1">/</span>
                {transactions.filter(t => t.paymentMethod === 'orange_money').length}
              </p>
              <p className="text-sm text-gray-500">MTN Momo / Orange Money 💛🧡</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Confirmation Dialog */}
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
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Warning! This action is permanent.</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Transaction ID:</span>
              <code className="text-xs font-mono">{transactionToRefund?.transactionId}</code>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Attendee:</span>
              <span>{transactionToRefund?.attendeeName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-red-600">{formatCurrency(transactionToRefund?.amount || 0)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Event:</span>
              <span>{transactionToRefund?.eventTitle}</span>
            </div>
            <div className="border-t pt-2 mt-2 text-red-600">
              <p>⚠️ Refunding will:</p>
              <ul className="list-disc list-inside ml-2 text-xs">
                <li>Mark the ticket as invalid</li>
                <li>Prevent check-in access</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  )
}