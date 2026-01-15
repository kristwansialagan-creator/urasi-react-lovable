import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Play, Square, DollarSign, TrendingUp, TrendingDown, Calculator, History, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRegisters } from '@/hooks'

export default function RegistersPage() {
    const { registers, loading, error, createRegister, openRegister, closeRegister, cashIn, cashOut } = useRegisters()

    const handleAddRegister = async () => {
        const name = prompt('Enter register name:')
        if (name) {
            await createRegister({ name })
        }
    }

    const handleOpenRegister = async (id: string) => {
        const balance = prompt('Enter opening balance:', '0')
        if (balance !== null) {
            await openRegister(id, parseFloat(balance) || 0)
        }
    }

    const handleCloseRegister = async (id: string) => {
        if (confirm('Are you sure you want to close this register?')) {
            await closeRegister(id)
        }
    }

    const handleCashIn = async (id: string) => {
        const amount = prompt('Enter cash-in amount:')
        const description = prompt('Enter description:')
        if (amount && description) {
            await cashIn(id, parseFloat(amount), description)
        }
    }

    const handleCashOut = async (id: string) => {
        const amount = prompt('Enter cash-out amount:')
        const description = prompt('Enter description:')
        if (amount && description) {
            await cashOut(id, parseFloat(amount), description)
        }
    }

    // Calculate stats
    const activeRegisters = registers.filter(r => r.status === 'opened').length
    const totalBalance = registers.reduce((sum, r) => sum + (r.balance || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cash Registers</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your cash registers</p>
                </div>
                <Button className="gap-2" onClick={handleAddRegister}><Plus className="h-4 w-4" />Add Register</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><Calculator className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Active Registers</p><p className="text-2xl font-bold">{activeRegisters}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><DollarSign className="h-6 w-6 text-blue-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Balance</p><p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><TrendingUp className="h-6 w-6 text-green-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Total Registers</p><p className="text-2xl font-bold">{registers.length}</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-lg bg-red-500/10"><TrendingDown className="h-6 w-6 text-red-500" /></div><div><p className="text-sm text-[hsl(var(--muted-foreground))]">Closed Registers</p><p className="text-2xl font-bold">{registers.length - activeRegisters}</p></div></CardContent></Card>
            </div>

            {error && (
                <div className="text-center py-4 text-[hsl(var(--destructive))]">{error}</div>
            )}

            {registers.length === 0 ? (
                <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                    No registers found. Create your first register to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {registers.map((register) => (
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
                                    <p className="text-2xl font-bold">{formatCurrency(register.balance || 0)}</p>
                                </div>
                                {register.description && (
                                    <div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{register.description}</p>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    {register.status === 'opened' ? (
                                        <>
                                            <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCashIn(register.id)}><TrendingUp className="h-4 w-4" />Cash In</Button>
                                            <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCashOut(register.id)}><TrendingDown className="h-4 w-4" />Cash Out</Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleCloseRegister(register.id)}><Square className="h-4 w-4" /></Button>
                                        </>
                                    ) : (
                                        <Button className="flex-1 gap-2" onClick={() => handleOpenRegister(register.id)}><Play className="h-4 w-4" />Open Register</Button>
                                    )}
                                </div>
                                <Button variant="ghost" className="w-full gap-2"><History className="h-4 w-4" />View History</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
