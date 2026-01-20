import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search, Filter, Eye, Check, X, Calendar as CalendarIcon, RefreshCw, Loader2, Plus } from 'lucide-react'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { useInstallments } from '@/hooks/useInstallments'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

export default function InstallmentsPage() {
    const { installments, loading, error, fetchInstallments, markAsPaid, deleteInstallment } = useInstallments()
    const { toast } = useToast()
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    
    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        paid: 'all' as 'all' | true | false,
        date: undefined as { from: Date; to: Date | undefined } | undefined
    })
    const [tempFilters, setTempFilters] = useState(appliedFilters)

    // Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [installmentToDelete, setInstallmentToDelete] = useState<string | null>(null)

    // View Detail Dialog State
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedInstallment, setSelectedInstallment] = useState<any>(null)

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchInstallments({
                paid: appliedFilters.paid === 'all' ? undefined : appliedFilters.paid,
                from_date: appliedFilters.date?.from?.toISOString(),
                to_date: appliedFilters.date?.to?.toISOString(),
                page: currentPage,
                limit: itemsPerPage
            })
        }, 300)
        return () => clearTimeout(debounce)
    }, [search, appliedFilters, fetchInstallments, currentPage, itemsPerPage])

    const handleApplyFilter = () => {
        setAppliedFilters(tempFilters)
        setIsFilterOpen(false)
    }

    const handleResetFilter = () => {
        const resetState = {
            paid: 'all' as 'all' | true | false,
            date: undefined
        }
        setTempFilters(resetState)
        setAppliedFilters(resetState)
        setIsFilterOpen(false)
    }

    const getStatusBadge = (paid: boolean) => {
        const styles = paid 
            ? 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/20' 
            : 'text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
        const label = paid ? 'Paid' : 'Unpaid'
        return <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium text-xs ${styles}`}>{label}</span>
    }

    const handleMarkAsPaid = async (id: string) => {
        const success = await markAsPaid(id)
        if (success) {
            toast({
                title: "Installment Marked as Paid",
                description: "The installment has been successfully marked as paid.",
            })
        } else {
            toast({
                title: "Operation Failed",
                description: "Failed to mark the installment as paid. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setInstallmentToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (installmentToDelete) {
            const success = await deleteInstallment(installmentToDelete)
            if (success) {
                toast({
                    title: "Installment Deleted",
                    description: "The installment has been successfully deleted.",
                })
                setIsDeleteDialogOpen(false)
                setInstallmentToDelete(null)
            } else {
                toast({
                    title: "Delete Failed",
                    description: "Failed to delete the installment. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const handleViewDetail = (installment: any) => {
        setSelectedInstallment(installment)
        setIsViewDialogOpen(true)
    }

    const handleRefresh = () => {
        fetchInstallments({
            paid: appliedFilters.paid === 'all' ? undefined : appliedFilters.paid,
            from_date: appliedFilters.date?.from?.toISOString(),
            to_date: appliedFilters.date?.to?.toISOString(),
        })
    }

    // Filter installments based on search
    const filteredInstallments = installments.filter(installment => 
        installment.order?.code?.toLowerCase().includes(search.toLowerCase()) ||
        installment.order?.customer?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        installment.order?.customer?.last_name?.toLowerCase().includes(search.toLowerCase())
    )

    // Calculate stats
    const totalInstallments = installments.length
    const paidInstallments = installments.filter(i => i.paid).length
    const unpaidInstallments = installments.filter(i => !i.paid).length
    const totalAmount = installments.reduce((sum, i) => sum + (i.amount || 0), 0)
    const paidAmount = installments.filter(i => i.paid).reduce((sum, i) => sum + (i.amount || 0), 0)

    // Check if any filter is active
    const isFilterActive = appliedFilters.paid !== 'all' || appliedFilters.date !== undefined

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Installments</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage and track all installment payments</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10"><Plus className="h-6 w-6 text-blue-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Installments</p><p className="text-2xl font-bold">{totalInstallments}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10"><Check className="h-6 w-6 text-green-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Paid</p><p className="text-2xl font-bold">{paidInstallments}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-500/10"><X className="h-6 w-6 text-red-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Unpaid</p><p className="text-2xl font-bold">{unpaidInstallments}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10"><Plus className="h-6 w-6 text-purple-500" /></div>
                        <div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Amount</p><p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><Input placeholder="Search by order code or customer..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div>
                        
                        <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>

                        <Popover open={isFilterOpen} onOpenChange={(open) => {
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
                                        <h4 className="font-medium leading-none">Filter Installments</h4>
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
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="space-y-2">
                                        <Label>Payment Status</Label>
                                        <Select value={String(tempFilters.paid)} onValueChange={(val) => setTempFilters({ ...tempFilters, paid: val === 'all' ? 'all' : val === 'true' })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg z-[60]">
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="true">Paid</SelectItem>
                                                <SelectItem value="false">Unpaid</SelectItem>
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
                <CardHeader><CardTitle>All Installments</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-[hsl(var(--destructive))]">{error}</div>
                    ) : filteredInstallments.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No installments found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b bg-[hsl(var(--muted))/30]">
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Order ID</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Customer</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Due Date</th>
                                        <th className="text-right py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Amount</th>
                                        <th className="text-center py-4 px-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))]">Status</th>
                                        <th className="text-center py-4 px-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-b-2 border-[hsl(var(--border))] w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInstallments.map((installment, index) => (
                                        <tr key={installment.id} className={`border-b hover:bg-[hsl(var(--muted))]/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[hsl(var(--muted))/5]'}`}>
                                            <td className="py-4 px-4 font-medium text-sm border-b border-[hsl(var(--border))]">
                                                <span className="font-mono text-xs bg-[hsl(var(--muted))/50] px-2 py-1 rounded">{installment.order?.code || 'N/A'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-sm border-b border-[hsl(var(--border))]">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-[hsl(var(--primary))]">
                                                            {installment.order?.customer?.first_name?.[0] || 'W'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">
                                                        {installment.order?.customer
                                                            ? `${installment.order.customer.first_name || ''} ${installment.order.customer.last_name || ''}`.trim()
                                                            : 'Walk-in'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-[hsl(var(--muted-foreground))] text-sm border-b border-[hsl(var(--border))]">
                                                <div className="text-center">
                                                    <div className="font-medium">{installment.date ? format(new Date(installment.date), 'dd MMM yyyy') : '-'}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right font-semibold text-sm border-b border-[hsl(var(--border))]">
                                                {formatCurrency(installment.amount || 0)}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm border-b border-[hsl(var(--border))]">
                                                {getStatusBadge(installment.paid)}
                                            </td>
                                            <td className="py-4 px-2 w-24 text-sm border-b border-[hsl(var(--border))]">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[hsl(var(--primary))/10]" title="View Details" onClick={() => handleViewDetail(installment)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {!installment.paid && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                            title="Mark as Paid"
                                                            onClick={() => handleMarkAsPaid(installment.id)}
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                        title="Delete"
                                                        onClick={() => handleDeleteClick(installment.id)}
                                                    >
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Installment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this installment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Detail Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Installment Details</DialogTitle>
                    </DialogHeader>
                    {selectedInstallment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Order Code</Label>
                                    <p className="font-mono text-sm">{selectedInstallment.order?.code || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedInstallment.paid)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Amount</Label>
                                    <p className="font-semibold">{formatCurrency(selectedInstallment.amount || 0)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Due Date</Label>
                                    <p>{selectedInstallment.date ? format(new Date(selectedInstallment.date), 'dd MMM yyyy') : '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Customer</Label>
                                    <p>{selectedInstallment.order?.customer
                                        ? `${selectedInstallment.order.customer.first_name || ''} ${selectedInstallment.order.customer.last_name || ''}`.trim()
                                        : 'Walk-in'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Order Total</Label>
                                    <p>{formatCurrency(selectedInstallment.order?.total || 0)}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Created</Label>
                                <p className="text-sm">{selectedInstallment.created_at ? formatDateTime(selectedInstallment.created_at) : '-'}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
