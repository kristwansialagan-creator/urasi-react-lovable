import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search, Filter, Eye, Printer, RotateCcw, Receipt, DollarSign, Loader2, Calendar as CalendarIcon, X, RefreshCw, Minus, Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { useOrders, useReceiptPrinter } from '@/hooks'
import { useInstallments } from '@/hooks/useInstallments'
import { useOrderBatches, OrderProductBatch } from '@/hooks/useOrderBatches'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

export default function OrdersPage() {
    const navigate = useNavigate()
    const { orders, totalCount, loading, error, fetchOrders, voidOrder, paymentTypes, getOrderStats } = useOrders()
    const { installments, getInstallmentsByOrder, createInstallment, markAsPaid } = useInstallments()
    const { printReceipt } = useReceiptPrinter()
    const { toast } = useToast()
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [orderStats, setOrderStats] = useState({
        total_orders: 0,
        total_sales: 0,
        paid_orders: 0,
        unpaid_orders: 0,
        partial_orders: 0
    })

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        payment_status: 'all',
        process_status: 'all',
        payment_method_id: 'all',
        has_installments: 'all' as 'all' | true | false,
        date: undefined as { from: Date; to: Date | undefined } | undefined
    })
    const [tempFilters, setTempFilters] = useState(appliedFilters)

    // Table Font Size State
    const fontSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl']
    const [fontSizeIndex, setFontSizeIndex] = useState(1) // Default to text-sm
    const currentFontSize = fontSizes[fontSizeIndex]

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOrders({
                search,
                payment_status: appliedFilters.payment_status === 'all' ? undefined : appliedFilters.payment_status,
                process_status: appliedFilters.process_status === 'all' ? undefined : appliedFilters.process_status,
                payment_method_id: appliedFilters.payment_method_id === 'all' ? undefined : appliedFilters.payment_method_id,
                has_installments: appliedFilters.has_installments === 'all' ? undefined : appliedFilters.has_installments,
                from_date: appliedFilters.date?.from?.toISOString(),
                to_date: appliedFilters.date?.to?.toISOString(),
                page: currentPage,
                limit: itemsPerPage
            })
        }, 300)
        return () => clearTimeout(debounce)
    }, [search, appliedFilters, fetchOrders, currentPage, itemsPerPage])

    // Fetch order stats separately to get all-time statistics
    useEffect(() => {
        const fetchStats = async () => {
            const stats = await getOrderStats()
            setOrderStats(stats)
        }
        fetchStats()
    }, [getOrderStats])

    const handleApplyFilter = () => {
        setAppliedFilters(tempFilters)
        setIsFilterOpen(false)
    }

    const handleResetFilter = () => {
        const resetState = {
            payment_status: 'all',
            process_status: 'all',
            payment_method_id: 'all',
            has_installments: 'all' as 'all' | true | false,
            date: undefined
        }
        setTempFilters(resetState)
        setAppliedFilters(resetState)
        setIsFilterOpen(false)
    }


    const getPaymentStatusBadge = (status: string | null) => {
        const s = status || 'unpaid'
        const styles: Record<string, string> = {
            paid: 'text-green-800 dark:text-green-400',
            unpaid: 'text-red-800 dark:text-red-400',
            partially_paid: 'text-yellow-800 dark:text-yellow-400',
            void: 'text-gray-800 dark:text-gray-400',
        }
        const labels: Record<string, string> = { paid: 'Paid', unpaid: 'Unpaid', partially_paid: 'Partial', void: 'Void' }
        return <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${currentFontSize} ${styles[s] || styles.unpaid}`}>{labels[s] || s}</span>
    }

    const getInstallmentBadge = (installments?: any[]) => {
        if (!installments || installments.length === 0) {
            return null
        }
        const unpaidCount = installments.filter(i => !i.paid).length
        const paidCount = installments.filter(i => i.paid).length

        return (
            <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full font-medium text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                    {installments.length} Installment{installments.length > 1 ? 's' : ''}
                </span>
                {unpaidCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full font-medium text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                        {unpaidCount} Due
                    </span>
                )}
            </div>
        )
    }

    // View Detail Dialog State
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [orderInstallments, setOrderInstallments] = useState<any[]>([])
    const [productBatches, setProductBatches] = useState<Record<string, OrderProductBatch[]>>({})
    const { fetchBatchesByOrderProduct } = useOrderBatches()

    // Installment Dialog State
    const [isInstallmentDialogOpen, setIsInstallmentDialogOpen] = useState(false)
    const [installmentForm, setInstallmentForm] = useState({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd')
    })

    // Void Dialog State
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
    const [orderToVoid, setOrderToVoid] = useState<string | null>(null)
    const [voidReason, setVoidReason] = useState('')

    const handleViewDetail = async (order: any) => {
        setSelectedOrder(order)
        const installments = await getInstallmentsByOrder(order.id)
        setOrderInstallments(installments)

        // Fetch batch deductions for each product
        const batchMap: Record<string, OrderProductBatch[]> = {}
        if (order.products && order.products.length > 0) {
            for (const product of order.products) {
                const batches = await fetchBatchesByOrderProduct(product.id)
                if (batches.length > 0) {
                    batchMap[product.id] = batches
                }
            }
        }
        setProductBatches(batchMap)
        setIsViewDialogOpen(true)
    }

    const handleVoidClick = (id: string) => {
        setOrderToVoid(id)
        setVoidReason('')
        setIsVoidDialogOpen(true)
    }

    const handleConfirmVoid = async () => {
        if (orderToVoid && voidReason.trim()) {
            const success = await voidOrder(orderToVoid, voidReason)
            if (success) {
                toast({
                    title: "Order Voided",
                    description: "The order has been successfully voided.",
                })
                setIsVoidDialogOpen(false)
                setOrderToVoid(null)
                setVoidReason('')
                // Refresh stats after voiding
                getOrderStats().then(setOrderStats)
            } else {
                toast({
                    title: "Void Failed",
                    description: "Failed to void the order. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const handleRefresh = () => {
        fetchOrders({
            search,
            payment_status: appliedFilters.payment_status === 'all' ? undefined : appliedFilters.payment_status,
            process_status: appliedFilters.process_status === 'all' ? undefined : appliedFilters.process_status,
            payment_method_id: appliedFilters.payment_method_id === 'all' ? undefined : appliedFilters.payment_method_id,
            has_installments: appliedFilters.has_installments === 'all' ? undefined : appliedFilters.has_installments,
            from_date: appliedFilters.date?.from?.toISOString(),
            to_date: appliedFilters.date?.to?.toISOString(),
        })
        // Also refresh stats
        getOrderStats().then(setOrderStats)
    }

    const handlePrint = (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (!order) return

        const items = order.products?.map(p => ({
            name: p.name || 'Unknown Item',
            quantity: p.quantity,
            total_price: p.total_price
        })) || []

        const subtotal = order.subtotal || 0
        const discount = (order.total_coupons || 0) + (order.discount || 0)
        const total = order.total || 0
        const paid = order.payments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0
        const change = order.change || 0

        printReceipt(order.code, items, subtotal, discount, total, paid, change, order.created_at || undefined)
    }

    const handleOpenInstallmentDialog = (order: any) => {
        setSelectedOrder(order)
        setInstallmentForm({
            amount: '',
            date: format(new Date(), 'yyyy-MM-dd')
        })
        setIsInstallmentDialogOpen(true)
    }

    const handleCreateInstallment = async () => {
        if (!selectedOrder || !installmentForm.amount || !installmentForm.date) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            return
        }

        const success = await createInstallment({
            order_id: selectedOrder.id,
            amount: parseFloat(installmentForm.amount),
            date: installmentForm.date
        })

        if (success) {
            toast({
                title: "Installment Created",
                description: "The installment has been successfully created.",
            })
            setIsInstallmentDialogOpen(false)
            setInstallmentForm({ amount: '', date: format(new Date(), 'yyyy-MM-dd') })
            // Refresh installments for this order
            if (selectedOrder) {
                const installments = await getInstallmentsByOrder(selectedOrder.id)
                setOrderInstallments(installments)
            }
        } else {
            toast({
                title: "Creation Failed",
                description: "Failed to create the installment. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleMarkInstallmentAsPaid = async (installmentId: string) => {
        const success = await markAsPaid(installmentId)
        if (success) {
            toast({
                title: "Installment Marked as Paid",
                description: "The installment has been successfully marked as paid.",
            })
            // Refresh installments for this order
            if (selectedOrder) {
                const installments = await getInstallmentsByOrder(selectedOrder.id)
                setOrderInstallments(installments)
            }
        } else {
            toast({
                title: "Operation Failed",
                description: "Failed to mark the installment as paid. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Calculate stats using orderStats from API (all-time data)
    const totalOrders = orderStats.total_orders
    const paidOrders = orderStats.paid_orders
    const partialOrders = orderStats.partial_orders
    const unpaidOrders = orderStats.unpaid_orders

    // Check if any filter is active
    const isFilterActive = appliedFilters.payment_status !== 'all' ||
        appliedFilters.process_status !== 'all' ||
        appliedFilters.payment_method_id !== 'all' ||
        appliedFilters.has_installments !== 'all' ||
        appliedFilters.date !== undefined

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage and track all orders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10"><Receipt className="h-6 w-6 text-blue-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Paid</p><p className="text-2xl font-bold">{paidOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10"><Receipt className="h-6 w-6 text-yellow-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Partial</p><p className="text-2xl font-bold">{partialOrders}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-500/10"><Receipt className="h-6 w-6 text-red-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Unpaid</p><p className="text-2xl font-bold">{unpaidOrders}</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><Input placeholder="Search orders by code..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div>

                        {/* Items Per Page Dropdown */}
                        <Select value={String(itemsPerPage)} onValueChange={(v) => {
                            setItemsPerPage(Number(v))
                            setCurrentPage(1) // Reset to first page when changing items per page
                        }}>
                            <SelectTrigger className="h-10 w-[130px]">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh Orders">
                            <RefreshCw className="h-4 w-4" />
                        </Button>

                        {/* Font Size Control */}
                        <div className="flex items-center gap-1 border rounded-md p-1 bg-background">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFontSizeIndex(Math.max(0, fontSizeIndex - 1))}
                                disabled={fontSizeIndex === 0}
                                title="Decrease Font Size"
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-medium w-6 text-center text-muted-foreground">Aa</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFontSizeIndex(Math.min(fontSizes.length - 1, fontSizeIndex + 1))}
                                disabled={fontSizeIndex === fontSizes.length - 1}
                                title="Increase Font Size"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        <Popover open={isFilterOpen} onOpenChange={(open) => {
                            // Only close if explicitly requested, not on outside click
                            if (!open && !isFilterOpen) return
                            setIsFilterOpen(open)
                            if (open) setTempFilters(appliedFilters)
                        }}>
                            <PopoverTrigger asChild>
                                <Button variant={isFilterActive ? "secondary" : "outline"} className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {isFilterActive && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-xl z-50" align="end" sideOffset={5} onInteractOutside={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium leading-none">Filter Orders</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => setIsFilterOpen(false)}
                                            title="Close filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Date Range */}
                                    <div className="space-y-2">
                                        <Label>Date Range</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !tempFilters.date && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {tempFilters.date?.from ? (
                                                        tempFilters.date.to ? (
                                                            <>
                                                                {format(tempFilters.date.from, "LLL dd, y")} -{" "}
                                                                {format(tempFilters.date.to, "LLL dd, y")}
                                                            </>
                                                        ) : (
                                                            format(tempFilters.date.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date range</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-xl z-50" align="start">
                                                <div className="p-3">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={tempFilters.date?.from}
                                                        selected={tempFilters.date}
                                                        onSelect={(range) => {
                                                            if (range?.from) {
                                                                setTempFilters({ ...tempFilters, date: { from: range.from, to: range.to } })
                                                            } else {
                                                                setTempFilters({ ...tempFilters, date: undefined })
                                                            }
                                                        }}
                                                        numberOfMonths={2}
                                                    />
                                                </div>
                                                <div className="p-3 border-t border-[hsl(var(--border))]">
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => {
                                                            // Close calendar by removing focus from calendar
                                                            const calendarElement = document.querySelector('[role="grid"]')
                                                            if (calendarElement) {
                                                                (calendarElement as HTMLElement).blur()
                                                            }
                                                            // Alternative: trigger escape key
                                                            const escapeEvent = new KeyboardEvent('keydown', {
                                                                key: 'Escape',
                                                                code: 'Escape',
                                                                bubbles: true
                                                            })
                                                            document.dispatchEvent(escapeEvent)
                                                        }}
                                                    >
                                                        Submit Date Range
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select value={tempFilters.payment_method_id} onValueChange={(val) => setTempFilters({ ...tempFilters, payment_method_id: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Methods" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                <SelectItem value="all">All Methods</SelectItem>
                                                {paymentTypes.map((pt) => (
                                                    <SelectItem key={pt.id} value={pt.id}>{pt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="space-y-2">
                                        <Label>Payment Status</Label>
                                        <Select value={tempFilters.payment_status} onValueChange={(val) => setTempFilters({ ...tempFilters, payment_status: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                                <SelectItem value="void">Void</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Has Installments */}
                                    <div className="space-y-2">
                                        <Label>Has Installments</Label>
                                        <Select value={String(tempFilters.has_installments)} onValueChange={(val) => setTempFilters({ ...tempFilters, has_installments: val === 'all' ? 'all' : val === 'true' })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Orders" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                <SelectItem value="all">All Orders</SelectItem>
                                                <SelectItem value="true">Has Installments</SelectItem>
                                                <SelectItem value="false">No Installments</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Process Status */}
                                    <div className="space-y-2">
                                        <Label>Process Status</Label>
                                        <Select value={tempFilters.process_status} onValueChange={(val) => setTempFilters({ ...tempFilters, process_status: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-between pt-2 gap-2">
                                        {isFilterActive && (
                                            <Button variant="outline" size="sm" onClick={handleResetFilter}>
                                                Clear All
                                            </Button>
                                        )}
                                        <div className="flex gap-2 ml-auto">
                                            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleApplyFilter}>
                                                Apply Filter
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-[hsl(var(--destructive))]">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No orders yet. Start selling from the POS!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b bg-[hsl(var(--muted))/30]">
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Order ID</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Customer</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Date</th>
                                        <th className="text-right py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Total</th>
                                        <th className="text-right py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Paid</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Status</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Installments</th>
                                        <th className="text-center py-4 px-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))] w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order.id} className={`border-b hover:bg-[hsl(var(--muted))]/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[hsl(var(--muted))/5]'}`}>
                                            <td className={`py-4 px-4 font-medium ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                <span className="font-mono text-xs bg-[hsl(var(--muted))/50] px-2 py-1 rounded">{order.code}</span>
                                            </td>
                                            <td className={`py-4 px-4 ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-[hsl(var(--primary))]">
                                                            {order.customer ? order.customer.first_name?.[0] || 'W' : 'W'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">
                                                        {order.customer
                                                            ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
                                                            : 'Walk-in'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`py-4 px-4 text-[hsl(var(--muted-foreground))] ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                <div className="text-center">
                                                    <div className="font-medium">{order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy') : '-'}</div>
                                                    <div className="text-xs">{order.created_at ? format(new Date(order.created_at), 'HH:mm') : '-'}</div>
                                                </div>
                                            </td>
                                            <td className={`py-4 px-4 text-right font-semibold ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                {formatCurrency(order.total || 0)}
                                            </td>
                                            <td className={`py-4 px-4 text-right font-semibold text-blue-600 dark:text-blue-400 ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                {formatCurrency(order.payments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0)}
                                            </td>
                                            <td className={`py-4 px-4 text-center ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                {getPaymentStatusBadge(order.payment_status)}
                                            </td>
                                            <td className={`py-4 px-4 text-center ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                {getInstallmentBadge(order.installments)}
                                            </td>
                                            <td className={`py-4 px-2 w-24 ${currentFontSize} border-b border-[hsl(var(--border))]`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(var(--primary))/10]" title="View Details" onClick={() => handleViewDetail(order)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(var(--primary))/10]" title="Print Options">
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                            <DropdownMenuItem onClick={() => handlePrint(order.id)} className="cursor-pointer">
                                                                <Receipt className="h-4 w-4 mr-2" />
                                                                Print Receipt
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/invoice`)} className="cursor-pointer">
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                View Invoice
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30" title="Manage Installments" onClick={() => handleOpenInstallmentDialog(order)}>
                                                        <CalendarIcon className="h-4 w-4 text-purple-500" />
                                                    </Button>
                                                    {order.payment_status !== 'void' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            title="Void"
                                                            onClick={() => handleVoidClick(order.id)}
                                                        >
                                                            <RotateCcw className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {totalCount > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalCount) : 0} to {Math.min(currentPage * itemsPerPage, totalCount || 0)} of {totalCount || 0} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {currentPage} of {Math.ceil(totalCount / itemsPerPage) || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
                                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage) || loading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="bg-[hsl(var(--background))] sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Complete information for order {selectedOrder?.code}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Order Code</Label>
                                    <div className="font-mono text-sm bg-[hsl(var(--muted))/50] px-2 py-1 rounded mt-1">
                                        {selectedOrder.code}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Date & Time</Label>
                                    <div className="mt-1">
                                        <div className="font-medium">
                                            {selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'dd MMMM yyyy') : '-'}
                                        </div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'HH:mm:ss') : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Customer</Label>
                                <div className="flex items-center gap-3 mt-2 p-3 bg-[hsl(var(--muted))/20] rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                                        <span className="text-sm font-semibold text-[hsl(var(--primary))]">
                                            {selectedOrder.customer ? selectedOrder.customer.first_name?.[0] || 'W' : 'W'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {selectedOrder.customer
                                                ? `${selectedOrder.customer.first_name || ''} ${selectedOrder.customer.last_name || ''}`.trim()
                                                : 'Walk-in Customer'}
                                        </div>
                                        {selectedOrder.customer?.email && (
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOrder.customer.email}</div>
                                        )}
                                        {selectedOrder.customer?.phone && (
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOrder.customer.phone}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Order Items</Label>
                                <div className="space-y-2 mt-2">
                                    {selectedOrder.products?.map((p: any, i: number) => (
                                        <div key={i} className="p-3 bg-[hsl(var(--muted))/20] rounded-lg">
                                            <div className="flex justify-between items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        Quantity: {p.quantity} × {formatCurrency(p.unit_price || 0)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-lg">{formatCurrency(p.total_price || 0)}</div>
                                                </div>
                                            </div>
                                            {/* Batch Deductions */}
                                            {productBatches[p.id] && productBatches[p.id].length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-[hsl(var(--border))]">
                                                    <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Batch Deductions (FEFO):</div>
                                                    <div className="space-y-1">
                                                        {productBatches[p.id].map((batch, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-xs bg-[hsl(var(--muted))/30] px-2 py-1 rounded">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                                        {batch.batch_number}
                                                                    </span>
                                                                    {batch.expiry_date && (
                                                                        <span className="text-orange-600 dark:text-orange-400">
                                                                            Exp: {format(new Date(batch.expiry_date), 'dd/MM/yyyy')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">Qty: {batch.quantity_deducted}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedOrder.products || selectedOrder.products.length === 0) &&
                                        <div className="text-center text-[hsl(var(--muted-foreground))] py-4">No items in this order</div>
                                    }
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div>
                                <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Payment Methods</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedOrder.payments && selectedOrder.payments.length > 0
                                        ? [...new Set(selectedOrder.payments.map((p: any) => {
                                            const type = paymentTypes.find((pt: any) => pt.id === p.payment_type_id)
                                            return type ? type.label : p.payment_type_id?.slice(0, 8)
                                        }))].map((method: any, i: number) => (
                                            <span key={i} className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-3 py-1 rounded-full text-sm">
                                                {method as string}
                                            </span>
                                        ))
                                        : <span className="text-[hsl(var(--muted-foreground))]">No payment methods</span>
                                    }
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Coupon/Discount</Label>
                                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold mt-1">
                                        {((selectedOrder.total_coupons || 0) + (selectedOrder.discount || 0)) > 0 ?
                                            formatCurrency((selectedOrder.total_coupons || 0) + (selectedOrder.discount || 0)) :
                                            'No discount'
                                        }
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Payment Status</Label>
                                    <div className="mt-1">
                                        {getPaymentStatusBadge(selectedOrder.payment_status)}
                                    </div>
                                </div>
                            </div>

                            {/* Total Summary */}
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[hsl(var(--muted-foreground))]">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[hsl(var(--muted-foreground))]">Total:</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                                            {formatCurrency(selectedOrder.total || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[hsl(var(--muted-foreground))]">Paid:</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                                            {formatCurrency(selectedOrder.payments?.reduce((sum: number, p: any) => sum + (p.value || 0), 0) || 0)}
                                        </span>
                                    </div>
                                    {selectedOrder.change !== undefined && selectedOrder.change > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-[hsl(var(--muted-foreground))]">Change:</span>
                                            <span className="font-medium">
                                                {formatCurrency(selectedOrder.change)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Installments */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Installments</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenInstallmentDialog(selectedOrder)}
                                        className="h-8 text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Installment
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {orderInstallments.map((installment: any) => (
                                        <div key={installment.id} className="flex justify-between items-center gap-4 p-3 bg-[hsl(var(--muted))/20] rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{formatCurrency(installment.amount || 0)}</span>
                                                    {installment.paid ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full font-medium text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">Paid</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full font-medium text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">Unpaid</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    Due: {installment.date ? format(new Date(installment.date), 'dd MMM yyyy') : '-'}
                                                </div>
                                            </div>
                                            {!installment.paid && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkInstallmentAsPaid(installment.id)}
                                                    className="h-8 text-xs"
                                                >
                                                    Mark as Paid
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {orderInstallments.length === 0 &&
                                        <div className="text-center text-[hsl(var(--muted-foreground))] py-4 text-sm">No installments for this order</div>
                                    }
                                </div>
                            </div>

                            {/* Note */}
                            {selectedOrder.note && (
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Order Note</Label>
                                    <div className="mt-1 p-3 bg-[hsl(var(--muted))/20] rounded-lg">
                                        {selectedOrder.note as string}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            if (selectedOrder) {
                                handlePrint(selectedOrder.id)
                                setIsViewDialogOpen(false)
                            }
                        }}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
                <DialogContent className="bg-[hsl(var(--background))] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Void Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to void this order? This action cannot be undone.
                            Please provide a reason for voiding.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="void-reason" className="mb-2 block">Reason</Label>
                        <Textarea
                            id="void-reason"
                            placeholder="Enter reason..."
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVoidDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmVoid} disabled={!voidReason.trim()}>Confirm Void</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isInstallmentDialogOpen} onOpenChange={setIsInstallmentDialogOpen}>
                <DialogContent className="bg-[hsl(var(--background))] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Installment</DialogTitle>
                        <DialogDescription>
                            Create a new installment for order {selectedOrder?.code}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="installment-amount">Amount</Label>
                            <Input
                                id="installment-amount"
                                type="number"
                                step="0.01"
                                placeholder="Enter amount..."
                                value={installmentForm.amount}
                                onChange={(e) => setInstallmentForm({ ...installmentForm, amount: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="installment-date">Due Date</Label>
                            <Input
                                id="installment-date"
                                type="date"
                                value={installmentForm.date}
                                onChange={(e) => setInstallmentForm({ ...installmentForm, date: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        {selectedOrder && (
                            <div className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))/20] p-3 rounded-lg">
                                <div>Order Total: {formatCurrency(selectedOrder.total || 0)}</div>
                                <div>Pending Amount: {formatCurrency((selectedOrder.total || 0) - (selectedOrder.payments?.reduce((sum: number, p: any) => sum + (p.value || 0), 0) || 0))}</div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInstallmentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateInstallment} disabled={!installmentForm.amount || !installmentForm.date}>Create Installment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
