import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Plus, Trash2, Star, Edit } from 'lucide-react'
import { useRewards } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

export default function RewardsPage() {
    const { rewards, transactions, loading, createReward, updateReward, deleteReward } = useRewards()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingReward, setEditingReward] = useState<{ id: string } | null>(null)
    const [formData, setFormData] = useState({
        name: '', target: 100, discount_type: 'flat' as 'flat' | 'percentage', discount_value: 10, min_points: 100, active: true
    })

    const stats = {
        totalRewards: rewards.length,
        activeRewards: rewards.filter((r: any) => r.active).length,
        totalTransactions: transactions.length,
        pointsAwarded: transactions.filter((t: any) => t.type === 'earn').reduce((sum: number, t: any) => sum + (t.points || 0), 0),
        pointsRedeemed: transactions.filter((t: any) => t.type === 'redeem').reduce((sum: number, t: any) => sum + Math.abs(t.points || 0), 0)
    }

    const handleCreate = async () => {
        if (!formData.name) return alert('Name required')
        const success = editingReward ? await updateReward(editingReward.id, formData) : await createReward(formData)
        if (success) { resetForm(); setShowCreateModal(false); setEditingReward(null) }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this reward?')) await deleteReward(id)
    }

    const resetForm = () => setFormData({ name: '', target: 100, discount_type: 'flat', discount_value: 10, min_points: 100, active: true })

    const openEdit = (r: any) => {
        setFormData({ name: r.name, target: r.target || 0, discount_type: (r.discount_type as any) || 'flat', discount_value: r.discount_value || 0, min_points: r.min_points || 0, active: !!r.active })
        setEditingReward(r); setShowCreateModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Gift className="h-8 w-8 text-purple-500" />Rewards System</h1>
                <Button onClick={() => { resetForm(); setShowCreateModal(true) }}><Plus className="h-4 w-4 mr-2" />New Reward</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gift className="h-4 w-4" />Total Rewards</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalRewards}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.activeRewards}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />Points Awarded</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{stats.pointsAwarded.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Points Redeemed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.pointsRedeemed.toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Transactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalTransactions}</div></CardContent></Card>
            </div>

            <Card><CardHeader><CardTitle>Reward Rules</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-8">Loading...</div> : rewards.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No rewards configured. Create your first reward!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.map((r: any) => (
                            <Card key={r.id} className={`relative ${!r.active ? 'opacity-60' : ''}`}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            <h3 className="font-bold">{r.name}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Target Points:</span><span className="font-bold">{r.target}</span></div>
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Min. Points:</span><span>{r.min_points}</span></div>
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Discount:</span><span className="font-bold text-[hsl(var(--primary))]">{r.discount_type === 'percentage' ? `${r.discount_value}%` : formatCurrency(r.discount_value || 0)}</span></div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Button size="sm" variant="outline" onClick={() => openEdit(r)} className="flex-1"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Recent Point Transactions</CardTitle></CardHeader><CardContent>
                <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Type</th><th className="text-right p-3">Points</th><th className="text-left p-3">Description</th></tr></thead>
                    <tbody>{transactions.slice(0, 20).map((t: any) => (
                        <tr key={t.id} className="border-b">
                            <td className="p-3 text-sm">{new Date(t.created_at || '').toLocaleString()}</td>
                            <td className="p-3 font-medium">{t.customer ? `${t.customer.first_name || ''} ${t.customer.last_name || ''}` : 'Unknown'}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${t.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{t.type}</span></td>
                            <td className={`p-3 text-right font-bold ${t.type === 'earn' ? 'text-green-600' : 'text-orange-600'}`}>{t.type === 'earn' ? '+' : ''}{t.points}</td>
                            <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">{t.description || '-'}</td>
                        </tr>
                    ))}</tbody></table>
            </CardContent></Card>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md"><CardHeader><CardTitle>{editingReward ? 'Edit' : 'New'} Reward</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Gold Member Discount" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Target Points</Label><Input type="number" value={formData.target} onChange={e => setFormData({ ...formData, target: Number(e.target.value) })} /></div>
                            <div><Label>Min Points to Redeem</Label><Input type="number" value={formData.min_points} onChange={e => setFormData({ ...formData, min_points: Number(e.target.value) })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Discount Type</Label><select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value as 'flat' | 'percentage' })} className="w-full px-3 py-2 border rounded"><option value="flat">Flat Amount</option><option value="percentage">Percentage</option></select></div>
                            <div><Label>Discount Value</Label><Input type="number" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })} /></div>
                        </div>
                        <div className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} id="active" /><Label htmlFor="active">Active</Label></div>
                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingReward(null) }} className="flex-1">Cancel</Button><Button onClick={handleCreate} className="flex-1">{editingReward ? 'Update' : 'Create'}</Button></div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    )
}
