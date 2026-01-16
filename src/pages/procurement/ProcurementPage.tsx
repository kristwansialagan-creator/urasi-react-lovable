import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Truck, Plus, Package, DollarSign, Search,
    CheckCircle, Clock, XCircle, Eye
} from 'lucide-react'
import { useProcurement } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

export default function ProcurementPage() {
    const {
        procurements, providers, loading,
        createProcurement, receiveProcurement,
        createProvider
    } = useProcurement()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showProviderModal, setShowProviderModal] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    // Create procurement form
    const [selectedProvider, setSelectedProvider] = useState('')
    const [procurementProducts, setProcurementProducts] = useState<{
        product_id: string
        name: string
        quantity: number
        purchase_price: number
    }[]>([])

    // New provider form
    const [newProvider, setNewProvider] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })

    const filteredProcurements = procurements.filter((p: any) => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.provider?.name?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: procurements.length,
        pending: procurements.filter((p: any) => p.status === 'pending').length,
        completed: procurements.filter((p: any) => p.status === 'completed').length,
        totalValue: procurements.reduce((sum: any, p: any) => sum + p.total_price, 0)
    }

    const handleCreateProcurement = async () => {
        if (!selectedProvider || procurementProducts.length === 0) {
            alert('Please select provider and add products')
            return
        }

        await createProcurement({
            provider_id: selectedProvider,
            products: procurementProducts.map(p => ({
                product_id: p.product_id,
                quantity: p.quantity,
                purchase_price: p.purchase_price
            }))
        })

        setShowCreateModal(false)
        setSelectedProvider('')
        setProcurementProducts([])
    }

    const handleCreateProvider = async () => {
        if (!newProvider.name) {
            alert('Provider name is required')
            return
        }

        await createProvider(newProvider)
        setShowProviderModal(false)
        setNewProvider({ name: '', email: '', phone: '', address: '' })
    }

    const handleReceive = async (id: string) => {
        if (confirm('Receive this procurement? Stock will be updated automatically.')) {
            await receiveProcurement(id)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Truck className="h-8 w-8" />
                    Procurement
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowProviderModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Provider
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Procurement
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(stats.totalValue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search procurements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border rounded"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Procurements Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredProcurements.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            No procurements found
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">ID</th>
                                    <th className="text-left p-3">Provider</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Payment</th>
                                    <th className="text-left p-3">Delivery</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-center p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProcurements.map((p: any) => (
                                    <tr key={p.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                        <td className="p-3 font-mono text-sm">{p.id.slice(0, 8)}</td>
                                        <td className="p-3 font-medium">{p.provider?.name || '-'}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(p.status)}`}>
                                                {getStatusIcon(p.status)}
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {p.payment_status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {p.delivery_status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(p.total_price)}</td>
                                        <td className="p-3 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {p.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReceive(p.id)}
                                                    >
                                                        Receive
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Providers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Providers / Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {providers.map((p: any) => (
                            <Card key={p.id} className="p-4">
                                <div className="font-bold">{p.name}</div>
                                <div className="text-sm text-[hsl(var(--muted-foreground))]">{p.email || 'No email'}</div>
                                <div className="text-sm">{p.phone || 'No phone'}</div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Create Procurement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>New Procurement Order</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Provider</Label>
                                <select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    className="w-full px-3 py-2 border rounded mt-1"
                                >
                                    <option value="">Select provider...</option>
                                    {providers.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Products ({procurementProducts.length})</Label>
                                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                                    Add products via database or extend this form
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateProcurement} className="flex-1">
                                    Create Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Create Provider Modal */}
            {showProviderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg mx-4">
                        <CardHeader>
                            <CardTitle>New Provider</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={newProvider.name}
                                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                    placeholder="Provider name"
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newProvider.email}
                                    onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                                    placeholder="provider@example.com"
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={newProvider.phone}
                                    onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                                    placeholder="+62..."
                                />
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input
                                    value={newProvider.address}
                                    onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
                                    placeholder="Full address"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowProviderModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateProvider} className="flex-1">
                                    Create Provider
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
