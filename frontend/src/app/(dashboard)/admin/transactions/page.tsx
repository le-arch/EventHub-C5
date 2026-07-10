/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin Transactions Page
 * * Allows admin to view all payment transactions across the platform.
 * Features include:
 * - Search by transaction ID, attendee name, or email
 * - Filter by payment status and method
 * - Sort by date
 * - View transaction details
 * - Manual refund (for disputes)
 * - Pagination for large transaction lists
 * - Breadcrumb navigation
 * - Confirmation dialog for refunds
 * * @module AdminTransactionsPage
 */

'use client'

import { useState, useEffect, useDeferredValue } from 'react'
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
  ShieldAlert,
  DollarSign,
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
  const [transactionToMarkPaid, setTransactionToMarkPaid] = useState<Transaction | null>(null)
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Use deferred values to naturally debounce keystrokes on server round-trips
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // Fetch from transaction pipeline whenever server criteria parameters shift
  useEffect(() => {
    fetchTransactions()
  }, [page, pageSize, deferredSearchTerm, statusFilter, methodFilter])

  /**
   * Fetch all transactions from API with pagination and search context applied
   */
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/transactions', {
        params: {
          page,
          limit: pageSize,
          search: deferredSearchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          method: methodFilter !== 'all' ? methodFilter : undefined,
        },
      })
      const data = Array.isArray(response.data) ? response.data : []
      setTransactions(data)
      setTotalCount(data.length)
      setTotalPages(Math.ceil(data.length / pageSize) || 1)
    } catch (error) {
      toast.error('Failed to pull platform transactional history ledger')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refund an audited payment lifecycle entry
   */
  const handleRefund = async () => {
    if (!transactionToRefund) return
    
    setIsProcessing(true)
    try {
      await api.post(`/admin/transactions/${transactionToRefund.transactionId}/refund`)
      toast.success(`Refund processed for ${transactionToRefund.attendeeName}`)
      fetchTransactions()
    } catch (error) {
      toast.error('Failed to void or refund ledger transaction through vendor gateways')
    } finally {
      setIsProcessing(false)
      setTransactionToRefund(null)
    }
  }

  /**
   * Mark a pending transaction as paid
   */
  const handleMarkPaid = async () => {
    if (!transactionToMarkPaid) return

    setIsMarkingPaid(true)
    try {
      const orderId = (transactionToMarkPaid as any).orderId || (transactionToMarkPaid as any).id
      await api.put(`/admin/orders/${orderId}/mark-paid`)
      toast.success(`Payment confirmed for ${transactionToMarkPaid.attendeeName}`)
      fetchTransactions()
    } catch (error) {
      toast.error('Failed to mark transaction as paid')
    } finally {
      setIsMarkingPaid(false)
      setTransactionToMarkPaid(null)
    }
  }

  /**
   * Reset filtering params back to zero parameters
   */
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMethodFilter('all')
    setPage(1)
  }

  /**
   * Get status badge for transaction with distinct text colors matching light layouts
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-semibold shadow-none flex items-center gap-1 hover:bg-emerald-50">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-none flex items-center gap-1 hover:bg-amber-50">
            <Clock className="h-3 w-3 text-amber-600" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-rose-50 text-rose-900 border border-rose-200/80 font-semibold shadow-none flex items-center gap-1 hover:bg-rose-50">
            <XCircle className="h-3 w-3 text-rose-600" />
            Failed
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-muted/30 text-foreground border border-border font-semibold shadow-none flex items-center gap-1 hover:bg-muted/30">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            Refunded
          </Badge>
        )
      default:
        return null
    }
  }

  /**
   * Render distinct mobile payment merchant identifiers natively
   */
  const getMethodBadge = (method: string) => {
    if (method === 'mtn_momo') {
      return (
        <Badge className="bg-amber-100/70 text-amber-950 border border-amber-200 font-semibold shadow-none flex items-center gap-1 hover:bg-amber-100/70">
          <Smartphone className="h-3 w-3 text-amber-600" />
          MTN MoMo
        </Badge>
      )
    }
    return (
      <Badge className="bg-orange-50 text-orange-950 border border-orange-200 font-semibold shadow-none flex items-center gap-1 hover:bg-orange-50">
        <Smartphone className="h-3 w-3 text-orange-600" />
        Orange Money
      </Badge>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 bg-muted/50/50 min-h-screen text-foreground antialiased">
      {/* Breadcrumb Engine */}
      <Breadcrumb 
        items={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Transactions', href: '#', isActive: true },
        ]}
        showHome
      />

      {/* Header Panel Layout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 p-6 rounded-2xl shadow-sm text-white border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 shadow-inner backdrop-blur-md">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              Audit operational cash flows, track system revenues, and process manual refund overrides.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTransactions}
          className="bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:text-white font-semibold h-10 px-4 rounded-xl shadow-sm backdrop-blur-sm w-full lg:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2 text-slate-300" />
          Refresh Ledger
        </Button>
      </div>

      {/* Inputs, Filters & Modifiers Container */}
      <Card className="border-border/80 bg-card shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search entries by reference hash, client name, or event title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9 pr-4 h-11 text-sm text-foreground placeholder:text-muted-foreground font-medium border-border focus-visible:border-slate-400 focus-visible:ring-0 rounded-xl bg-card shadow-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full h-11 border-border text-foreground font-medium focus:border-slate-400 focus:ring-0 bg-card rounded-xl shadow-none">
                  <div className="flex items-center gap-2 text-sm">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-border bg-card font-medium bg-white">
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="paid">Settled (Paid)</SelectItem>
                  <SelectItem value="pending">Processing (Pending)</SelectItem>
                  <SelectItem value="failed">Aborted (Failed)</SelectItem>
                  <SelectItem value="refunded">Charged-Back (Refunded)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={(value) => {
                setMethodFilter(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full h-11 border-border text-foreground font-medium focus:border-slate-400 focus:ring-0 bg-card rounded-xl shadow-none">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Payment Method" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-border bg-card font-medium bg-white">
                  <SelectItem value="all">All Gateway Channels</SelectItem>
                  <SelectItem value="mtn_momo">MTN MoMo Engine</SelectItem>
                  <SelectItem value="orange_money">Orange Money Gateway</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters} 
                  className="border-rose-200 text-rose-700 font-semibold hover:bg-rose-50 hover:text-rose-800 h-11 px-4 rounded-xl"
                >
                  Reset Pipelines
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row Quantifier Metaspace */}
      <div className="text-xs text-muted-foreground flex items-center gap-2 px-1 font-medium">
        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
        Tracking <span className="text-foreground font-semibold">{transactions.length}</span> nodes out of <span className="text-foreground font-semibold">{totalCount}</span> total pipeline hashes
      </div>

      {/* Transaction Records Structured Table Layout */}
      <Card className="border border-border/80 bg-card shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50/70 border-b border-border">
                <TableRow>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Reference Hash</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Attendee Client</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Registered Context</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Gross Settlement</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Network Provider</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Entry Timestamp</TableHead>
                  <TableHead className="text-foreground font-bold text-xs py-3.5">Gateway Status</TableHead>
                  <TableHead className="w-12 py-3.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && transactions.length === 0 ? (
                  /* Fix internal loading paths cleanly inside the table domain */
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-b border-slate-100">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <TableCell key={idx} className="py-4">
                          <Skeleton className="h-5 w-24 bg-slate-200/60 rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 bg-card">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center border border-border/60">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-bold text-base">No payments located in system registry</p>
                        <p className="text-xs text-muted-foreground font-medium max-w-sm leading-relaxed">
                          No accounting ledger rows correspond to your filter inputs. Clear keywords to resume normal activity tracking.
                        </p>
                        {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
                          <Button
                            variant="link"
                            onClick={handleResetFilters}
                            className="text-foreground text-xs font-semibold underline hover:text-foreground mt-1"
                          >
                            Flush Active Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    const txId = (transaction as any).orderId || (transaction as any).id || ''
                    const txStatus = (transaction as any).paymentStatus || (transaction as any).status || ''
                    return (
                    <TableRow key={txId} className="hover:bg-muted/50/40 border-b border-slate-100 transition-colors">
                      <TableCell className="py-3.5">
                        <code className="text-xs font-mono font-medium text-muted-foreground bg-muted/30 border border-border/60 px-1.5 py-0.5 rounded">
                          {txId ? `${txId.slice(0, 12)}...` : 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{transaction.attendeeName}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{(transaction as any).attendeePhone || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="max-w-[200px] md:max-w-xs">
                          <p className="text-sm font-semibold text-foreground truncate">{transaction.eventTitle}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">by {(transaction as any).organizerName || 'Organizer'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="font-bold text-foreground text-sm">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">{getMethodBadge((transaction as any).paymentMethod || 'mtn_momo')}</TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-muted-foreground font-medium text-xs">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">{getStatusBadge(txStatus)}</TableCell>
                      <TableCell className="py-3.5">
                        {(txStatus === 'paid' || txStatus === 'pending') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-muted/30 h-8 w-8 rounded-lg">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border border-border font-medium shadow-sm rounded-xl">
                              {txStatus === 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => setTransactionToMarkPaid(transaction)}
                                  className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer py-1.5 text-xs font-semibold"
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {txStatus === 'paid' && (
                                <DropdownMenuItem
                                  onClick={() => setTransactionToRefund(transaction)}
                                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer py-1.5 text-xs font-semibold"
                                >
                                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                  Refund Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Pagination Module Control Segment */}
      {totalPages > 1 && (
        <div className="bg-card p-3 rounded-2xl shadow-sm border border-border/80">
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

      {/* Macro Metric Summaries Block Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">{totalCount.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Total Logs</p>
            </div>
            <CreditCard className="h-6 w-6 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-emerald-800 tracking-tight">
                {transactions.filter(t => t.status === 'paid').length}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Cleared Actions</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xl font-extrabold text-foreground truncate max-w-[160px] tracking-tight">
                {formatCurrency(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Gross Yield</p>
            </div>
            <TrendingUp className="h-6 w-6 text-indigo-600 shrink-0" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {transactions.filter(t => t.paymentMethod === 'mtn_momo').length}
                <span className="text-xs font-normal text-slate-300 mx-1">/</span>
                {transactions.filter(t => t.paymentMethod === 'orange_money').length}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">MoMo / Orange</p>
            </div>
            <div className="flex flex-col gap-0.5 opacity-60 shrink-0">
              <Smartphone className="h-3.5 w-3.5 text-amber-600" />
              <Smartphone className="h-3.5 w-3.5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark as Paid Confirmation Dialog */}
      <ConfirmationDialog
        open={!!transactionToMarkPaid}
        onOpenChange={() => setTransactionToMarkPaid(null)}
        onConfirm={handleMarkPaid}
        title="Confirm Payment"
        description={`Mark the pending order from ${transactionToMarkPaid?.attendeeName} as paid? This will allow check-in.`}
        confirmText="Confirm Payment"
        cancelText="Cancel"
        variant="info"
        isLoading={isMarkingPaid}
      >
        <div className="mt-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-foreground text-sm font-medium">
          <div className="flex items-center gap-2 text-emerald-900 font-bold mb-3 text-xs uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Payment confirmation is irreversible</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/40">
              <span className="text-muted-foreground">Order:</span>
              <code className="font-mono font-semibold text-foreground bg-card border border-border px-1 py-0.5 rounded">
                {transactionToMarkPaid?.id?.slice(0, 12)}...
              </code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/40">
              <span className="text-muted-foreground">Attendee:</span>
              <span className="font-semibold text-foreground">{transactionToMarkPaid?.attendeeName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/40">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                {formatCurrency(transactionToMarkPaid?.amount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Event:</span>
              <span className="font-semibold text-foreground max-w-[180px] truncate">{transactionToMarkPaid?.eventTitle}</span>
            </div>
          </div>
        </div>
      </ConfirmationDialog>

      {/* Refund Management Portal Interstitial Dialog */}
      <ConfirmationDialog
        open={!!transactionToRefund}
        onOpenChange={() => setTransactionToRefund(null)}
        onConfirm={handleRefund}
        title="Refund Platform Transaction"
        description={`Are you absolutely sure you want to initialize a reverse-ledger execution to ${transactionToRefund?.attendeeName}?`}
        confirmText="Confirm Reversal Payment"
        cancelText="Abort Operation"
        variant="warning"
        isLoading={isProcessing}
      >
        <div className="mt-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-foreground text-sm font-medium">
          <div className="flex items-center gap-2 text-amber-900 font-bold mb-3 text-xs uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Reverse settlement loops are immutable</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-amber-200/40">
              <span className="text-muted-foreground">Reference Token:</span>
              <code className="font-mono font-semibold text-foreground bg-card border border-border px-1 py-0.5 rounded">
                {transactionToRefund?.transactionId}
              </code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-amber-200/40">
              <span className="text-muted-foreground">Recipient Account:</span>
              <span className="font-semibold text-foreground">{transactionToRefund?.attendeeName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-amber-200/40">
              <span className="text-muted-foreground">Reversal Amount:</span>
              <span className="font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                -{formatCurrency(transactionToRefund?.amount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Event Context:</span>
              <span className="font-semibold text-foreground max-w-[180px] truncate">{transactionToRefund?.eventTitle}</span>
            </div>
            <div className="border-t border-dashed border-rose-200 pt-2.5 mt-2 text-rose-900 bg-rose-50/40 p-2 rounded-lg border border-rose-100">
              <p className="font-bold mb-1">Associated Automations Lifecycle Impact:</p>
              <ul className="list-disc list-inside space-y-0.5 text-rose-900/80 font-medium">
                <li>Cryptographic validation barcodes on entry tickets instantly decay</li>
                <li>Physical attendance hardware checkpoints systematically reject access</li>
                <li>Reversal operations can never be natively re-authorized or rolled back</li>
              </ul>
            </div>
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  )
}