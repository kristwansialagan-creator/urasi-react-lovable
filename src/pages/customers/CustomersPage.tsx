import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Eye, Edit, Trash2, Users, DollarSign, CreditCard, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCustomers } from '@/hooks'

export default function CustomersPage() {
    const { customers, loading, error, fetchCustomers, deleteCustomer, createCustomer } = useCustomers()
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (search) {
            const debounce = setTimeout(() => fetchCustomers(search), 300)
            return () => clearTimeout(debounce)
        } else {
            fetchCustomers()
        }
    }, [search, fetchCustomers])

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            await deleteCustomer(id)
        }
    }

    const handleAddCustomer = async () => {
        const firstName = prompt('Enter customer first name:')
        const lastName = prompt('Enter customer last name:')
        const email = prompt('Enter customer email:')
        const phone = prompt('Enter customer phone:')

        if (firstName) {
            await createCustomer({
                first_name: firstName,
                last_name: lastName || undefined,
                email: email || undefined,
                phone: phone || undefined
            })
        }
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

            <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="flex-1"><Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div><Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button></div></CardContent></Card>

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
                                            <td className="py-3 px-4"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]" onClick={() => handleDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button></div></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
