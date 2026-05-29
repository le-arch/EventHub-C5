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
import { formatDate, formatCurrency } from '@/src/lib/utils'

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

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  /**
   * Fetch all transactions from API
   */
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions')
      setTransactions(response.data.transactions)
    } catch (error) {
      toast.error('Failed to load transactions')
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
  const handleRefund = async (transactionId: string) => {
    setIsProcessing(true)
    try {
      await api.post(`/admin/transactions/${transactionId}/refund`)
      toast.success('Transaction refunded successfully')
      fetchTransactions()
    } catch (error) {
      toast.error('Failed to refund transaction')
    } finally {
      setIsProcessing(false)
      setTransactionToRefund(null)
    }
  }

  /**
   * Get status badge for transaction
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return null
    }
  }

  /**
   * Get payment method badge
   */
  const getMethodBadge = (method: string) => {
    if (method === 'mtn_momo') {
      return <Badge className="bg-yellow-100 text-yellow-800">MTN Momo</Badge>
    }
    return <Badge className="bg-orange-100 text-orange-800">Orange Money</Badge>
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
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-gray-500 mt-1">
            View and manage all payment transactions on the platform
          </p>
        </div>
        <Button variant="outline" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID, attendee name, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mtn_momo">MTN Momo</SelectItem>
                <SelectItem value="orange_money">Orange Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event / Organizer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No transactions found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
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
                        <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
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
                                <XCircle className="h-4 w-4 mr-2" />
                                Refund Payment
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-gray-500">Total Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'paid').length}
              </p>
              <p className="text-sm text-gray-500">Successful Payments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {transactions.filter(t => t.paymentMethod === 'mtn_momo').length}
              </p>
              <p className="text-sm text-gray-500">MTN Momo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Dialog */}
      <Dialog open={!!transactionToRefund} onOpenChange={() => setTransactionToRefund(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment?
              <br />
              <br />
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <code className="text-sm">{transactionToRefund?.transactionId}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendee:</span>
                  <span>{transactionToRefund?.attendeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(transactionToRefund?.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span>{transactionToRefund?.eventTitle}</span>
                </div>
              </div>
              <span className="text-red-600 font-medium mt-4 block">
                This action is permanent and will mark the ticket as invalid.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionToRefund(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => transactionToRefund && handleRefund(transactionToRefund.transactionId)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}