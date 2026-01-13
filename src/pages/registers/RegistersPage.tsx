import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Play, Square, DollarSign, TrendingUp, TrendingDown, Calculator, History } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const registersData = [
    { id: '1', name: 'Register 1', status: 'opened', balance: 1500000, user: 'John Cashier' },
    { id: '2', name: 'Register 2', status: 'closed', balance: 0, user: null },
    { id: '3', name: 'Register 3', status: 'opened', balance: 2350000, user: 'Jane Cashier' },
]

export default function RegistersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cash Registers</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your cash registers</p>
                </div>
                <Button className="gap-2"><Plus className="h-4 w-4" />Add Register</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><Calculator className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Active Registers</p><p className="text-2xl font-bold">2</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><DollarSign className="h-6 w-6 text-blue-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Balance</p><p className="text-2xl font-bold">{formatCurrency(3850000)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><TrendingUp className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Cash In Today</p><p className="text-2xl font-bold">{formatCurrency(12500000)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-red-500/10"><TrendingDown className="h-6 w-6 text-red-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Cash Out Today</p><p className="text-2xl font-bold">{formatCurrency(850000)}</p></div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {registersData.map((register) => (
                    <Card key={register.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                {register.name}
                            </CardTitle>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${register.status === 'opened' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                {register.status === 'opened' ? 'Open' : 'Closed'}
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Balance</p>
                                <p className="text-2xl font-bold">{formatCurrency(register.balance)}</p>
                            </div>
                            {register.user && (
                                <div>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Operated by</p>
                                    <p className="font-medium">{register.user}</p>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                {register.status === 'opened' ? (
                                    <>
                                        <Button variant="outline" className="flex-1 gap-2"><TrendingUp className="h-4 w-4" />Cash In</Button>
                                        <Button variant="outline" className="flex-1 gap-2"><TrendingDown className="h-4 w-4" />Cash Out</Button>
                                        <Button variant="destructive" size="icon"><Square className="h-4 w-4" /></Button>
                                    </>
                                ) : (
                                    <Button className="flex-1 gap-2"><Play className="h-4 w-4" />Open Register</Button>
                                )}
                            </div>
                            <Button variant="ghost" className="w-full gap-2"><History className="h-4 w-4" />View History</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
