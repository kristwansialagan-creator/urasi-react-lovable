import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Check, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface Instalment {
    id: string; order_id: string; amount: number; due_date: string; paid: boolean; paid_date: string | null
    order?: { id: string; code: string; total: number; customer?: { first_name: string; last_name: string } }
}

export default function InstalmentsPage() {
    const [instalments, setInstalments] = useState<Instalment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

    useEffect(() => { fetchInstalments() }, [])

    const fetchInstalments = async () => {
        setLoading(true)
        const { data } = await supabase.from('orders_instalments').select('*, order:orders(id, code, total, customer:customers(first_name, last_name))').order('due_date')
        setInstalments(data || [])
        setLoading(false)
    }

    const markAsPaid = async (id: string) => {
        await supabase.from('orders_instalments').update({ paid: true, paid_date: new Date().toISOString() } as never).eq('id', id)
        fetchInstalments()
    }

    const today = new Date().toISOString().split('T')[0]
    const filtered = instalments.filter(i => {
        if (filter === 'pending') return !i.paid
        if (filter === 'paid') return i.paid
        if (filter === 'overdue') return !i.paid && i.due_date < today
        return true
    })

    const stats = {
        total: instalments.length,
        pending: instalments.filter(i => !i.paid).length,
        paid: instalments.filter(i => i.paid).length,
        overdue: instalments.filter(i => !i.paid && i.due_date < today).length,
        totalPending: instalments.filter(i => !i.paid).reduce((sum, i) => sum + i.amount, 0),
        totalPaid: instalments.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0)
    }

    const getStatusIcon = (instalment: Instalment) => {
        if (instalment.paid) return <Check className="h-4 w-4 text-green-500" />
        if (instalment.due_date < today) return <AlertCircle className="h-4 w-4 text-red-500" />
        return <Clock className="h-4 w-4 text-yellow-500" />
    }

    const getStatusClass = (instalment: Instalment) => {
        if (instalment.paid) return 'bg-green-100 text-green-700'
        if (instalment.due_date < today) return 'bg-red-100 text-red-700'
        return 'bg-yellow-100 text-yellow-700'
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8" />Instalment Payments</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Instalments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
                <Card className="border-yellow-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" />Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><div className="text-sm text-[hsl(var(--muted-foreground))]">{formatCurrency(stats.totalPending)}</div></CardContent></Card>
                <Card className="border-green-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />Paid</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.paid}</div><div className="text-sm text-[hsl(var(--muted-foreground))]">{formatCurrency(stats.totalPaid)}</div></CardContent></Card>
                <Card className="border-red-500"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" />Overdue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.overdue}</div></CardContent></Card>
            </div>

            <Card><CardContent className="pt-6">
                <div className="flex gap-2">
                    {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
                        <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">{f} {f === 'overdue' && stats.overdue > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded text-xs">{stats.overdue}</span>}</Button>
                    ))}
                </div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>All Instalments</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No instalments found</div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Due Date</th><th className="text-center p-3">Status</th><th className="text-center p-3">Actions</th></tr></thead>
                        <tbody>{filtered.map(i => (
                            <tr key={i.id} className={`border-b hover:bg-[hsl(var(--muted))] ${!i.paid && i.due_date < today ? 'bg-red-50' : ''}`}>
                                <td className="p-3"><div className="font-mono text-sm">#{i.order?.code || i.order_id.slice(0, 8)}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">Total: {formatCurrency(i.order?.total || 0)}</div></td>
                                <td className="p-3 font-medium">{i.order?.customer ? `${i.order.customer.first_name} ${i.order.customer.last_name}` : 'Guest'}</td>
                                <td className="p-3 text-right font-bold text-[hsl(var(--primary))]">{formatCurrency(i.amount)}</td>
                                <td className="p-3"><div className={i.due_date < today && !i.paid ? 'text-red-600 font-bold' : ''}>{new Date(i.due_date).toLocaleDateString()}</div>{i.paid_date && <div className="text-xs text-green-600">Paid: {new Date(i.paid_date).toLocaleDateString()}</div>}</td>
                                <td className="p-3 text-center"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusClass(i)}`}>{getStatusIcon(i)}{i.paid ? 'Paid' : i.due_date < today ? 'Overdue' : 'Pending'}</span></td>
                                <td className="p-3 text-center">{!i.paid && <Button size="sm" onClick={() => markAsPaid(i.id)}><Check className="h-4 w-4 mr-1" />Mark Paid</Button>}</td>
                            </tr>
                        ))}</tbody></table>
                )}
            </CardContent></Card>

            {stats.pending > 0 && (
                <Card><CardHeader><CardTitle>Upcoming Due Dates</CardTitle></CardHeader><CardContent>
                    <div className="space-y-2">
                        {instalments.filter(i => !i.paid).sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 10).map(i => {
                            const daysUntil = Math.ceil((new Date(i.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            return <div key={i.id} className={`flex items-center justify-between p-3 rounded ${daysUntil < 0 ? 'bg-red-100' : daysUntil <= 3 ? 'bg-yellow-100' : 'bg-[hsl(var(--muted))]'}`}>
                                <div><span className="font-medium">#{i.order?.code || i.order_id.slice(0, 8)}</span> - {i.order?.customer ? `${i.order.customer.first_name} ${i.order.customer.last_name}` : 'Guest'}</div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold">{formatCurrency(i.amount)}</span>
                                    <span className={`text-sm ${daysUntil < 0 ? 'text-red-600 font-bold' : daysUntil <= 3 ? 'text-yellow-700' : ''}`}>{daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil} days`}</span>
                                </div>
                            </div>
                        })}
                    </div>
                </CardContent></Card>
            )}
        </div>
    )
}
