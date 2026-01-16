import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Search, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export interface Customer {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
}

interface POSCustomerPopupProps {
    open: boolean
    onClose: () => void
    onSelect: (customer: Customer | null) => void
}

export default function POSCustomerPopup({ open, onClose, onSelect }: POSCustomerPopupProps) {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchCustomers()
        }
    }, [open])

    useEffect(() => {
        if (search) {
            const searchLower = search.toLowerCase()
            setFilteredCustomers(
                customers.filter(c =>
                    c.first_name?.toLowerCase().includes(searchLower) ||
                    c.last_name?.toLowerCase().includes(searchLower) ||
                    c.email?.toLowerCase().includes(searchLower) ||
                    c.phone?.includes(search)
                )
            )
        } else {
            setFilteredCustomers(customers)
        }
    }, [search, customers])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('customers')
                .select('id, first_name, last_name, email, phone')
                .limit(50)

            if (error) throw error
            setCustomers(data || [])
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectCustomer = (customer: Customer) => {
        onSelect(customer)
        onClose()
    }

    const handleWalkIn = () => {
        onSelect(null)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Select Customer
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Walk-in Customer Button */}
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleWalkIn}
                    >
                        <User className="h-4 w-4 mr-2" />
                        Walk-in Customer (No customer info)
                    </Button>

                    {/* Customer List */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                    Loading customers...
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-[hsl(var(--muted-foreground))] mb-4">
                                        {search ? 'No customers found' : 'No customers yet'}
                                    </p>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add New Customer
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="w-full p-4 hover:bg-[hsl(var(--muted))]/50 text-left transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {customer.first_name} {customer.last_name}
                                                    </p>
                                                    <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-1 mt-1">
                                                        {customer.email && <p>{customer.email}</p>}
                                                        {customer.phone && <p>{customer.phone}</p>}
                                                    </div>
                                                </div>
                                                <User className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
