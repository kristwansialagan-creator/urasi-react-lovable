import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, FileText, Check, X, Calendar } from 'lucide-react'
import { useJournalEntries, JournalEntry, JournalLine } from '@/hooks/useJournalEntries'
import { useTransactionAccounts } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function JournalEntriesPage() {
    const { entries, loading, error, fetchEntries, createEntry, deleteEntry, validateBalance } = useJournalEntries()
    const { accounts, fetchAccounts } = useTransactionAccounts()
    const { toast } = useToast()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        lines: [] as JournalLine[]
    })

    useEffect(() => {
        fetchEntries()
        fetchAccounts()
    }, [])

    const handleOpenDialog = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            reference: '',
            description: '',
            lines: [
                { account_id: '', debit: 0, credit: 0, description: '' },
                { account_id: '', debit: 0, credit: 0, description: '' }
            ]
        })
        setIsDialogOpen(true)
    }

    const handleAddLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { account_id: '', debit: 0, credit: 0, description: '' }]
        }))
    }

    const handleRemoveLine = (index: number) => {
        if (formData.lines.length <= 2) {
            toast({ title: 'Error', description: 'Journal entry requires at least 2 lines', variant: 'destructive' })
            return
        }
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.filter((_, i) => i !== index)
        }))
    }

    const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.map((line, i) =>
                i === index ? { ...line, [field]: value } : line
            )
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate
        const balance = validateBalance(formData.lines)
        if (!balance.valid) {
            toast({
                title: 'Balance Error',
                description: `Debits ($${balance.totalDebit.toFixed(2)}) must equal Credits ($${balance.totalCredit.toFixed(2)})`,
                variant: 'destructive'
            })
            return
        }

        // Filter empty lines
        const validLines = formData.lines.filter(l => l.account_id && (l.debit > 0 || l.credit > 0))
        if (validLines.length < 2) {
            toast({ title: 'Error', description: 'At least 2 valid lines required', variant: 'destructive' })
            return
        }

        const result = await createEntry({ ...formData, lines: validLines })
        if (result) {
            toast({ title: 'Success', description: 'Journal entry created' })
            setIsDialogOpen(false)
        } else if (error) {
            toast({ title: 'Error', description: error, variant: 'destructive' })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this journal entry?')) return
        const success = await deleteEntry(id)
        if (success) {
            toast({ title: 'Success', description: 'Journal entry deleted' })
        }
    }

    const handleFilter = () => {
        fetchEntries(dateFrom || undefined, dateTo || undefined)
    }

    const balance = validateBalance(formData.lines)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Double-entry bookkeeping transactions</p>
                </div>
                <Button onClick={handleOpenDialog}>
                    <Plus className="mr-2 h-4 w-4" /> New Journal Entry
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                        <Button onClick={handleFilter}>Filter</Button>
                        <Button variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); fetchEntries(); }}>
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Entries List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">Loading...</div>
            ) : entries.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <FileText className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                        <p className="text-[hsl(var(--muted-foreground))]">No journal entries found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <Card key={entry.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(entry.date).toLocaleDateString()}
                                            {entry.reference && <span className="text-sm text-[hsl(var(--muted-foreground))]">#{entry.reference}</span>}
                                        </CardTitle>
                                        {entry.description && (
                                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{entry.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Account</th>
                                            <th className="text-right py-2 w-32">Debit</th>
                                            <th className="text-right py-2 w-32">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.lines.map((line, idx) => (
                                            <tr key={`${entry.id}-${idx}`} className="border-b last:border-0">
                                                <td className="py-2">
                                                    {line.account_code && <span className="text-[hsl(var(--muted-foreground))] mr-2">[{line.account_code}]</span>}
                                                    {line.account_name}
                                                </td>
                                                <td className="text-right py-2">{line.debit > 0 ? formatCurrency(line.debit) : ''}</td>
                                                <td className="text-right py-2">{line.credit > 0 ? formatCurrency(line.credit) : ''}</td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold bg-[hsl(var(--muted))]/30">
                                            <td className="py-2">Total</td>
                                            <td className="text-right py-2">{formatCurrency(entry.total_debit)}</td>
                                            <td className="text-right py-2">{formatCurrency(entry.total_credit)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Journal Entry</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Reference</Label>
                                <Input
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="JE-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Entry description"
                                />
                            </div>
                        </div>

                        {/* Lines */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Lines</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Line
                                </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-[hsl(var(--muted))]">
                                        <tr>
                                            <th className="text-left p-2">Account</th>
                                            <th className="text-right p-2 w-32">Debit</th>
                                            <th className="text-right p-2 w-32">Credit</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.lines.map((line, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-2">
                                                    <Select
                                                        value={line.account_id}
                                                        onValueChange={(val) => handleLineChange(idx, 'account_id', val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {accounts.map((acc) => (
                                                                <SelectItem key={acc.id} value={acc.id}>
                                                                    {acc.code && `[${acc.code}] `}{acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={line.debit || ''}
                                                        onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                                                        className="text-right"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={line.credit || ''}
                                                        onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                                                        className="text-right"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveLine(idx)}
                                                    >
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="border-t bg-[hsl(var(--muted))]/50 font-bold">
                                            <td className="p-2">Total</td>
                                            <td className="p-2 text-right">{formatCurrency(balance.totalDebit)}</td>
                                            <td className="p-2 text-right">{formatCurrency(balance.totalCredit)}</td>
                                            <td className="p-2 text-center">
                                                {balance.valid ? (
                                                    <Check className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <X className="h-5 w-5 text-red-500" />
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {!balance.valid && (
                                <p className="text-sm text-red-500">
                                    Difference: {formatCurrency(balance.difference)} - Entry must be balanced
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!balance.valid}>
                                Create Entry
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
