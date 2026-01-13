import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Eye, Edit, Trash2, Users, DollarSign, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const customersData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '081234567890', group: 'Regular', purchases: 2500000, balance: 0 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '081234567891', group: 'VIP', purchases: 8500000, balance: 150000 },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '081234567892', group: 'Regular', purchases: 1200000, balance: -50000 },
    { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', phone: '081234567893', group: 'VIP', purchases: 15000000, balance: 500000 },
    { id: '5', name: 'David Brown', email: 'david@example.com', phone: '081234567894', group: 'Regular', purchases: 750000, balance: 0 },
]

export default function CustomersPage() {
    const [search, setSearch] = useState('')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your customer database</p>
                </div>
                <Button className="gap-2"><Plus className="h-4 w-4" />Add Customer</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><Users className="h-6 w-6 text-blue-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Customers</p><p className="text-2xl font-bold">1,234</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><DollarSign className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Purchases</p><p className="text-2xl font-bold">{formatCurrency(125000000)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-purple-500/10"><CreditCard className="h-6 w-6 text-purple-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Credit Balance</p><p className="text-2xl font-bold">{formatCurrency(2500000)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-orange-500/10"><Users className="h-6 w-6 text-orange-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">VIP Members</p><p className="text-2xl font-bold">156</p></div></CardContent></Card>
            </div>

            <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="flex-1"><Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} /></div><Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filter</Button></div></CardContent></Card>

            <Card>
                <CardHeader><CardTitle>All Customers</CardTitle></CardHeader>
                <CardContent>
                    <table className="w-full">
                        <thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Customer</th><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Contact</th><th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Group</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Purchases</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Balance</th><th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))]">Actions</th></tr></thead>
                        <tbody>
                            {customersData.map((customer) => (
                                <tr key={customer.id} className="border-b hover:bg-[hsl(var(--muted))]/50">
                                    <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-semibold">{customer.name[0]}</div><span className="font-medium">{customer.name}</span></div></td>
                                    <td className="py-3 px-4"><p className="text-sm">{customer.email}</p><p className="text-sm text-[hsl(var(--muted-foreground))]">{customer.phone}</p></td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.group === 'VIP' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{customer.group}</span></td>
                                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(customer.purchases)}</td>
                                    <td className="py-3 px-4 text-right"><span className={customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(customer.balance)}</span></td>
                                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]"><Trash2 className="h-4 w-4" /></Button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
