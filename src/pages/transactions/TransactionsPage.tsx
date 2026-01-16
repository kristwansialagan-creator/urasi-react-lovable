import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet, Plus, Trash2, Play, Search, TrendingUp, TrendingDown, Edit } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'

export default function TransactionsPage() {
    const { transactions, accounts, history, loading, createTransaction, updateTransaction, deleteTransaction, executeTransaction, createAccount, deleteAccount } = useTransactions()

    const [activeTab, setActiveTab] = useState<'transactions' | 'accounts' | 'history'>('transactions')
    const [search, setSearch] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showAccountModal, setShowAccountModal] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)

    const [formData, setFormData] = useState({
        name: '', type: 'income' as 'income' | 'expense', value: 0, description: '', account_id: '', recurring: false, active: true
    })

    const [accountForm, setAccountForm] = useState({ name: '', account: '', operation: 'credit' as 'debit' | 'credit', description: '' })

    const filteredTransactions = transactions.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

    const stats = {
        total: transactions.length,
        income: transactions.filter(t => t.type === 'income').length,
        expense: transactions.filter(t => t.type === 'expense').length,
        totalValue: history.reduce((sum, h) => sum + (h.operation === 'credit' ? (h.value || 0) : -(h.value || 0)), 0)
    }

    const handleCreate = async () => {
        if (!formData.name) return alert('Name required')
        const success = editingTransaction ? await updateTransaction(editingTransaction.id, formData) : await createTransaction(formData)
        if (success) { resetForm(); setShowCreateModal(false); setEditingTransaction(null) }
    }

    const handleCreateAccount = async () => {
        if (!accountForm.name) return alert('Name required')
        const success = await createAccount(accountForm)
        if (success) { setAccountForm({ name: '', account: '', operation: 'credit', description: '' }); setShowAccountModal(false) }
    }

    const handleExecute = async (id: string) => {
        if (confirm('Execute this transaction?')) await executeTransaction(id)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this transaction?')) await deleteTransaction(id)
    }

    const resetForm = () => setFormData({ name: '', type: 'income', value: 0, description: '', account_id: '', recurring: false, active: true })

    const openEdit = (t: any) => {
        setFormData({ name: t.name, type: t.type, value: t.value, description: t.description || '', account_id: t.account_id || '', recurring: t.recurring, active: t.active })
        setEditingTransaction(t); setShowCreateModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Wallet className="h-8 w-8" />Transactions</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAccountModal(true)}><Plus className="h-4 w-4 mr-2" />New Account</Button>
                    <Button onClick={() => { resetForm(); setShowCreateModal(true) }}><Plus className="h-4 w-4 mr-2" />New Transaction</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Transactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Income</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.income}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" />Expense</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.expense}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Net Balance</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${stats.totalValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.totalValue)}</div></CardContent></Card>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
                    {(['transactions', 'accounts', 'history'] as const).map(tab => (
                        <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)} className="capitalize">{tab}</Button>
                    ))}
                </div>
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} className="max-w-sm" />
            </CardContent></Card>

            {activeTab === 'transactions' && (
                <Card><CardHeader><CardTitle>All Transactions</CardTitle></CardHeader><CardContent>
                    {loading ? <div className="text-center py-8">Loading...</div> : (
                        <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Type</th><th className="text-right p-3">Value</th><th className="text-left p-3">Account</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th></tr></thead>
                            <tbody>{filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                    <td className="p-3 font-medium">{t.name}</td>
                                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span></td>
                                    <td className={`p-3 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.value || 0)}</td>
                                    <td className="p-3 text-sm">{t.account?.name || '-'}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="p-3"><div className="flex gap-1 justify-center">
                                        <Button size="sm" variant="ghost" onClick={() => handleExecute(t.id)} title="Execute"><Play className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </div></td>
                                </tr>
                            ))}</tbody></table>
                    )}
                </CardContent></Card>
            )}

            {activeTab === 'accounts' && (
                <Card><CardHeader><CardTitle>Transaction Accounts</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {accounts.map(a => (
                            <Card key={a.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div><div className="font-bold">{a.name}</div><div className="text-sm text-[hsl(var(--muted-foreground))]">{a.account}</div></div>
                                    <Button size="sm" variant="ghost" onClick={() => deleteAccount(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                                <span className={`mt-2 inline-block px-2 py-1 rounded text-xs ${a.operation === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.operation}</span>
                            </Card>
                        ))}
                    </div>
                </CardContent></Card>
            )}

            {activeTab === 'history' && (
                <Card><CardHeader><CardTitle>Transaction History</CardTitle></CardHeader><CardContent>
                    <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Date</th><th className="text-left p-3">Name</th><th className="text-left p-3">Operation</th><th className="text-right p-3">Value</th><th className="text-left p-3">Status</th></tr></thead>
                        <tbody>{history.slice(0, 100).map(h => (
                            <tr key={h.id} className="border-b">
                                <td className="p-3 text-sm">{new Date(h.created_at || '').toLocaleString()}</td>
                                <td className="p-3 font-medium">{h.name}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${h.operation === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.operation}</span></td>
                                <td className={`p-3 text-right font-bold ${h.operation === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{h.operation === 'credit' ? '+' : '-'}{formatCurrency(h.value || 0)}</td>
                                <td className="p-3 text-sm">{h.status}</td>
                            </tr>
                        ))}</tbody></table>
                </CardContent></Card>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg"><CardHeader><CardTitle>{editingTransaction ? 'Edit' : 'New'} Transaction</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Monthly Rent" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Type</Label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 border rounded"><option value="income">Income</option><option value="expense">Expense</option></select></div>
                            <div><Label>Value</Label><Input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} /></div>
                        </div>
                        <div><Label>Account</Label><select value={formData.account_id} onChange={e => setFormData({ ...formData, account_id: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="">No Account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                        <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.recurring} onChange={e => setFormData({ ...formData, recurring: e.target.checked })} />Recurring</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />Active</label>
                        </div>
                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingTransaction(null) }} className="flex-1">Cancel</Button><Button onClick={handleCreate} className="flex-1">{editingTransaction ? 'Update' : 'Create'}</Button></div>
                    </CardContent></Card>
                </div>
            )}

            {/* Account Modal */}
            {showAccountModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md"><CardHeader><CardTitle>New Account</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Name *</Label><Input value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} placeholder="Bank Account" /></div>
                        <div><Label>Account Number</Label><Input value={accountForm.account} onChange={e => setAccountForm({ ...accountForm, account: e.target.value })} /></div>
                        <div><Label>Default Operation</Label><select value={accountForm.operation} onChange={e => setAccountForm({ ...accountForm, operation: e.target.value as any })} className="w-full px-3 py-2 border rounded"><option value="credit">Credit</option><option value="debit">Debit</option></select></div>
                        <div><Label>Description</Label><Input value={accountForm.description} onChange={e => setAccountForm({ ...accountForm, description: e.target.value })} /></div>
                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => setShowAccountModal(false)} className="flex-1">Cancel</Button><Button onClick={handleCreateAccount} className="flex-1">Create</Button></div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    )
}
