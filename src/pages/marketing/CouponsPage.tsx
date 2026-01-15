import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Tag, Plus, Trash2, Search, Calendar, Percent,
    DollarSign, CheckCircle, XCircle, Edit
} from 'lucide-react'
import { useCoupons } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

export default function CouponsPage() {
    const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useCoupons()

    const [search, setSearch] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<any | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'general',
        discount_value: 10,
        discount_type: 'percentage' as 'percentage' | 'flat',
        minimum_cart_value: 0,
        valid_from: '',
        valid_until: '',
        usage_limit: 0,
        active: true
    })

    const filteredCoupons = coupons.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.active).length,
        expired: coupons.filter(c => c.valid_until && new Date(c.valid_until) < new Date()).length,
        totalUsage: coupons.reduce((sum, c) => sum + c.usage_count, 0)
    }

    const handleCreate = async () => {
        if (!formData.name || !formData.code) {
            alert('Name and code are required')
            return
        }

        await createCoupon({
            ...formData,
            valid_from: formData.valid_from || null,
            valid_until: formData.valid_until || null,
            usage_limit: formData.usage_limit || null
        })

        resetForm()
        setShowCreateModal(false)
    }

    const handleUpdate = async () => {
        if (!editingCoupon) return

        await updateCoupon(editingCoupon.id, formData)
        resetForm()
        setEditingCoupon(null)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this coupon?')) {
            await deleteCoupon(id)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'general',
            discount_value: 10,
            discount_type: 'percentage',
            minimum_cart_value: 0,
            valid_from: '',
            valid_until: '',
            usage_limit: 0,
            active: true
        })
    }

    const openEditModal = (coupon: any) => {
        setFormData({
            name: coupon.name,
            code: coupon.code,
            type: coupon.type,
            discount_value: coupon.discount_value,
            discount_type: coupon.discount_type,
            minimum_cart_value: coupon.minimum_cart_value,
            valid_from: coupon.valid_from?.split('T')[0] || '',
            valid_until: coupon.valid_until?.split('T')[0] || '',
            usage_limit: coupon.usage_limit || 0,
            active: coupon.active
        })
        setEditingCoupon(coupon)
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, code })
    }

    const isExpired = (validUntil: string | null) => {
        if (!validUntil) return false
        return new Date(validUntil) < new Date()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Tag className="h-8 w-8" />
                    Coupons & Promotions
                </h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Coupon
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Expired
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(var(--primary))]">{stats.totalUsage}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <Input
                        placeholder="Search coupons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                    />
                </CardContent>
            </Card>

            {/* Coupons List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredCoupons.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            No coupons found. Create your first coupon!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCoupons.map(coupon => (
                                <Card
                                    key={coupon.id}
                                    className={`relative ${!coupon.active || isExpired(coupon.valid_until) ? 'opacity-60' : ''}`}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{coupon.name}</h3>
                                                <code className="bg-[hsl(var(--muted))] px-2 py-1 rounded text-sm font-mono">
                                                    {coupon.code}
                                                </code>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${!coupon.active ? 'bg-gray-100 text-gray-600' :
                                                isExpired(coupon.valid_until) ? 'bg-red-100 text-red-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {!coupon.active ? 'Inactive' : isExpired(coupon.valid_until) ? 'Expired' : 'Active'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <Percent className="h-4 w-4 text-[hsl(var(--primary))]" />
                                                ) : (
                                                    <DollarSign className="h-4 w-4 text-[hsl(var(--primary))]" />
                                                )}
                                                <span className="font-bold text-lg text-[hsl(var(--primary))]">
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}% OFF`
                                                        : formatCurrency(coupon.discount_value) + ' OFF'
                                                    }
                                                </span>
                                            </div>

                                            {coupon.minimum_cart_value > 0 && (
                                                <div className="text-[hsl(var(--muted-foreground))]">
                                                    Min. order: {formatCurrency(coupon.minimum_cart_value)}
                                                </div>
                                            )}

                                            {coupon.valid_until && (
                                                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                                                    <Calendar className="h-3 w-3" />
                                                    Valid until: {new Date(coupon.valid_until).toLocaleDateString()}
                                                </div>
                                            )}

                                            <div className="text-[hsl(var(--muted-foreground))]">
                                                Used: {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 pt-4 border-t">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => openEditModal(coupon)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingCoupon) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader>
                            <CardTitle>{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Summer Sale 2026"
                                />
                            </div>

                            <div>
                                <Label>Coupon Code *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="SUMMER20"
                                        className="font-mono"
                                    />
                                    <Button type="button" variant="outline" onClick={generateCode}>
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Discount Value</Label>
                                    <Input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Discount Type</Label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                        className="w-full px-3 py-2 border rounded"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label>Minimum Cart Value</Label>
                                <Input
                                    type="number"
                                    value={formData.minimum_cart_value}
                                    onChange={(e) => setFormData({ ...formData, minimum_cart_value: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Valid From</Label>
                                    <Input
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Valid Until</Label>
                                    <Input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Usage Limit (0 = unlimited)</Label>
                                <Input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    id="active"
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetForm()
                                        setShowCreateModal(false)
                                        setEditingCoupon(null)
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={editingCoupon ? handleUpdate : handleCreate}
                                    className="flex-1"
                                >
                                    {editingCoupon ? 'Update' : 'Create'} Coupon
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
