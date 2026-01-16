import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransactionAccounts, TransactionAccount } from '@/hooks'
import { Trash2, Edit, Plus, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'

export default function TransactionAccountsPage() {
    const { accounts, createAccount, updateAccount, deleteAccount } = useTransactionAccounts()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentAccount, setCurrentAccount] = useState<TransactionAccount | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'expense' as TransactionAccount['type'],
        balance: 0,
        description: ''
    })

    const handleOpenDialog = (account?: TransactionAccount) => {
        if (account) {
            setCurrentAccount(account)
            setFormData({
                name: account.name,
                code: account.code || '',
                type: (account.type as any) || 'expense',
                balance: account.balance || 0,
                description: account.description || ''
            })
        } else {
            setCurrentAccount(null)
            setFormData({ name: '', code: '', type: 'expense', balance: 0, description: '' })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentAccount) {
            await updateAccount(currentAccount.id, formData)
        } else {
            await createAccount(formData)
        }
        setIsDialogOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this account?')) {
            await deleteAccount(id)
        }
    }

    const getIconForType = (type: string | null) => {
        switch (type) {
            case 'asset': return <Wallet className="text-green-500" />
            case 'liability': return <Wallet className="text-red-500" />
            case 'revenue': return <ArrowDownLeft className="text-green-500" />
            case 'expense': return <ArrowUpRight className="text-red-500" />
            default: return <Wallet />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage chart of accounts and balances.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <Card key={account.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {account.code && <span className="mr-2 text-[hsl(var(--muted-foreground))]">[{account.code}]</span>}
                                {account.name}
                            </CardTitle>
                            {getIconForType(account.type || '')}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(account.balance || 0)}</div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 capitalize">
                                {account.type} Account
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(account)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(account.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Code</Label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asset">Asset (Bank/Cash)</SelectItem>
                                        <SelectItem value="liability">Liability (Debt)</SelectItem>
                                        <SelectItem value="equity">Equity</SelectItem>
                                        <SelectItem value="revenue">Revenue (Sales)</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Initial Balance</Label>
                                <Input
                                    type="number"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{currentAccount ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
