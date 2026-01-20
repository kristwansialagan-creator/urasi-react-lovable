import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Eye, Edit, Trash2, Users, DollarSign, CreditCard, Loader2, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCustomers } from '@/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function CustomersPage() {
    const { customers, loading, error, fetchCustomers, deleteCustomer, createCustomer, updateCustomer, groups, fetchGroups } = useCustomers()
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState('')
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        group_id: '',
        account_amount: 0,
        credit_limit_amount: 0
    })
    const [addFormData, setAddFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        group_id: '',
        account_amount: 0,
        credit_limit_amount: 0
    })

    useEffect(() => {
        fetchCustomers('', selectedGroup)
        fetchGroups()
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchCustomers(search, selectedGroup)
        }, 300)
        return () => clearTimeout(debounceTimer)
    }, [search, selectedGroup])

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            await deleteCustomer(id)
        }
    }

    const handleViewCustomer = (customer: any) => {
        setSelectedCustomer(customer)
        setIsViewDialogOpen(true)
    }

    const handleEditCustomer = (customer: any) => {
        setSelectedCustomer(customer)
        setEditFormData({
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            group_id: customer.group_id || '',
            account_amount: customer.account_amount || 0,
            credit_limit_amount: customer.credit_limit_amount || 0
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedCustomer) {
            await updateCustomer(selectedCustomer.id, editFormData)
            setIsEditDialogOpen(false)
        }
    }

    const handleFilter = () => {
        setIsFilterDialogOpen(true)
    }

    const clearFilter = () => {
        setSelectedGroup('')
        setSearch('')
        fetchCustomers('', '')
    }

    const handleAddCustomer = () => {
        setAddFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            group_id: '',
            account_amount: 0,
            credit_limit_amount: 0
        })
        setIsAddDialogOpen(true)
    }

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        await createCustomer(addFormData)
        setIsAddDialogOpen(false)
    }

    // Calculate stats
    const totalCustomers = customers.length
    const totalPurchases = customers.reduce((sum, c) => sum + (c.purchases_amount || 0), 0)
    const totalBalance = customers.reduce((sum, c) => sum + (c.account_amount || 0), 0)
    const vipCount = customers.filter(c => c.group?.name === 'VIP').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your customer database</p>
                </div>
                <Button className="gap-2" onClick={handleAddCustomer}><Plus className="h-4 w-4" />Add Customer</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><Users className="h-6 w-6 text-blue-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Customers</p><p className="text-2xl font-bold">{totalCustomers}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Purchases</p><p className="text-2xl font-bold">{formatCurrency(totalPurchases)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-purple-500/10"><CreditCard className="h-6 w-6 text-purple-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Account Balance</p><p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-orange-500/10"><Users className="h-6 w-6 text-orange-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">VIP Members</p><p className="text-2xl font-bold">{vipCount}</p></div></CardContent></Card>
            </div>

            <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="flex-1 relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"><Search className="h-4 w-4" /></div><Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div><Button variant="outline" className="gap-2" onClick={handleFilter}><Filter className="h-4 w-4" />Filter</Button>{selectedGroup && <Button variant="outline" className="gap-2" onClick={clearFilter}><X className="h-4 w-4" />Clear Filter</Button>}</div></CardContent></Card>

            <Card>
                <CardHeader><CardTitle>All Customers</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-[hsl(var(--destructive))]">{error}</div>
                    ) : customers.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No customers yet. Add your first customer!</div>
                    ) : (
                        <table className="w-full">
                            <thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Customer</th><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Contact</th><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Group</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Purchases</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Balance</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Actions</th></tr></thead>
                            <tbody>
                                {customers.map((customer) => {
                                    const name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'
                                    const groupName = customer.group?.name || 'Regular'
                                    return (
                                        <tr key={customer.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                            <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-semibold">{name[0]}</div><span className="font-medium">{name}</span></div></td>
                                            <td className="py-3 px-4"><p className="text-sm">{customer.email || '-'}</p><p className="text-sm text-[hsl(var(--muted-foreground))]">{customer.phone || '-'}</p></td>
                                            <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${groupName === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>{groupName}</span></td>
                                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(customer.purchases_amount || 0)}</td>
                                            <td className="py-3 px-4 text-right"><span className={(customer.account_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(customer.account_amount || 0)}</span></td>
                                            <td className="py-3 px-4"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]" onClick={() => handleDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button></div></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Add Customer Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCustomer} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input
                                    value={addFormData.first_name}
                                    onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                                    required
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={addFormData.last_name}
                                    onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={addFormData.email}
                                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={addFormData.phone}
                                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Customer Group</Label>
                            <select
                                value={addFormData.group_id}
                                onChange={(e) => setAddFormData({ ...addFormData, group_id: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">Select a group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Balance</Label>
                                <Input
                                    type="number"
                                    value={addFormData.account_amount}
                                    onChange={(e) => setAddFormData({ ...addFormData, account_amount: parseFloat(e.target.value) || 0 })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Credit Limit</Label>
                                <Input
                                    type="number"
                                    value={addFormData.credit_limit_amount}
                                    onChange={(e) => setAddFormData({ ...addFormData, credit_limit_amount: parseFloat(e.target.value) || 0 })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Customer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Customer Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">First Name</Label>
                                    <p className="font-medium">{selectedCustomer.first_name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Last Name</Label>
                                    <p className="font-medium">{selectedCustomer.last_name || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                                    <p className="font-medium">{selectedCustomer.email || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                                    <p className="font-medium">{selectedCustomer.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Group</Label>
                                    <p className="font-medium">{selectedCustomer.group?.name || 'Regular'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Account Balance</Label>
                                    <p className={`font-medium ${(selectedCustomer.account_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(selectedCustomer.account_amount || 0)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Total Purchases</Label>
                                    <p className="font-medium">{formatCurrency(selectedCustomer.purchases_amount || 0)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Credit Limit</Label>
                                    <p className="font-medium">{formatCurrency(selectedCustomer.credit_limit_amount || 0)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input
                                    value={editFormData.first_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                    required
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={editFormData.last_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Customer Group</Label>
                            <select
                                value={editFormData.group_id}
                                onChange={(e) => setEditFormData({ ...editFormData, group_id: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">Select a group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Balance</Label>
                                <Input
                                    type="number"
                                    value={editFormData.account_amount}
                                    onChange={(e) => setEditFormData({ ...editFormData, account_amount: parseFloat(e.target.value) || 0 })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Credit Limit</Label>
                                <Input
                                    type="number"
                                    value={editFormData.credit_limit_amount}
                                    onChange={(e) => setEditFormData({ ...editFormData, credit_limit_amount: parseFloat(e.target.value) || 0 })}
                                    className="bg-white border-gray-300"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Update Customer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Filter Customers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer Group</Label>
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">All Groups</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            fetchCustomers(search, selectedGroup)
                            setIsFilterDialogOpen(false)
                        }}>Apply Filter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
