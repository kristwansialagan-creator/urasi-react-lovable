import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Play, Square, DollarSign, TrendingUp, TrendingDown, Calculator, History, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRegisters } from '@/hooks'
import { useLanguage } from '@/contexts/LanguageContext'

type DialogType = 'add' | 'open' | 'cashIn' | 'cashOut' | null

export default function RegistersPage() {
    const { registers, loading, error, createRegister, openRegister, closeRegister, cashIn, cashOut } = useRegisters()
    const { t } = useLanguage()

    // Dialog states
    const [dialogType, setDialogType] = useState<DialogType>(null)
    const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null)
    const [registerName, setRegisterName] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [closeConfirmId, setCloseConfirmId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetDialogState = () => {
        setDialogType(null)
        setSelectedRegisterId(null)
        setRegisterName('')
        setAmount('')
        setDescription('')
        setIsSubmitting(false)
    }

    const handleAddRegister = async () => {
        if (!registerName.trim()) return
        setIsSubmitting(true)
        await createRegister({ name: registerName.trim() })
        resetDialogState()
    }

    const handleOpenRegister = async () => {
        if (!selectedRegisterId) return
        setIsSubmitting(true)
        await openRegister(selectedRegisterId, parseFloat(amount) || 0)
        resetDialogState()
    }

    const handleCloseRegister = async () => {
        if (!closeConfirmId) return
        await closeRegister(closeConfirmId)
        setCloseConfirmId(null)
    }

    const handleCashIn = async () => {
        if (!selectedRegisterId || !amount || !description.trim()) return
        setIsSubmitting(true)
        await cashIn(selectedRegisterId, parseFloat(amount), description.trim())
        resetDialogState()
    }

    const handleCashOut = async () => {
        if (!selectedRegisterId || !amount || !description.trim()) return
        setIsSubmitting(true)
        await cashOut(selectedRegisterId, parseFloat(amount), description.trim())
        resetDialogState()
    }

    const openDialog = (type: DialogType, registerId?: string) => {
        setDialogType(type)
        if (registerId) setSelectedRegisterId(registerId)
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
                    <h1 className="text-2xl font-bold">{t('registers.title')}</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">{t('registers.subtitle')}</p>
                </div>
                <Button className="gap-2" onClick={() => openDialog('add')}>
                    <Plus className="h-4 w-4" />
                    {t('registers.addRegister')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <Calculator className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('registers.activeRegisters')}</p>
                            <p className="text-2xl font-bold">{activeRegisters}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                            <DollarSign className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('registers.totalBalance')}</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('registers.totalRegisters')}</p>
                            <p className="text-2xl font-bold">{registers.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-500/10">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('registers.closedRegisters')}</p>
                            <p className="text-2xl font-bold">{registers.length - activeRegisters}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <div className="text-center py-4 text-[hsl(var(--destructive))]">{error}</div>
            )}

            {registers.length === 0 ? (
                <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                    {t('registers.noRegisters')}
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    register.status === 'opened' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                }`}>
                                    {register.status === 'opened' ? t('registers.open') : t('registers.closed')}
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('registers.currentBalance')}</p>
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
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 gap-2" 
                                                onClick={() => openDialog('cashIn', register.id)}
                                            >
                                                <TrendingUp className="h-4 w-4" />
                                                {t('registers.cashIn')}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 gap-2" 
                                                onClick={() => openDialog('cashOut', register.id)}
                                            >
                                                <TrendingDown className="h-4 w-4" />
                                                {t('registers.cashOut')}
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="icon" 
                                                onClick={() => setCloseConfirmId(register.id)}
                                            >
                                                <Square className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            className="flex-1 gap-2" 
                                            onClick={() => openDialog('open', register.id)}
                                        >
                                            <Play className="h-4 w-4" />
                                            {t('registers.openRegister')}
                                        </Button>
                                    )}
                                </div>
                                <Button variant="ghost" className="w-full gap-2">
                                    <History className="h-4 w-4" />
                                    {t('registers.viewHistory')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Register Dialog */}
            <Dialog open={dialogType === 'add'} onOpenChange={() => resetDialogState()}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>{t('registers.addRegister')}</DialogTitle>
                        <DialogDescription>{t('registers.addRegisterDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="register-name">{t('registers.registerName')}</Label>
                            <Input
                                id="register-name"
                                placeholder={t('registers.registerNamePlaceholder')}
                                value={registerName}
                                onChange={(e) => setRegisterName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => resetDialogState()}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleAddRegister} disabled={!registerName.trim() || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('common.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Open Register Dialog */}
            <Dialog open={dialogType === 'open'} onOpenChange={() => resetDialogState()}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>{t('registers.openRegister')}</DialogTitle>
                        <DialogDescription>{t('registers.openRegisterDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="opening-balance">{t('registers.openingBalance')}</Label>
                            <Input
                                id="opening-balance"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => resetDialogState()}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleOpenRegister} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('registers.openRegister')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cash In Dialog */}
            <Dialog open={dialogType === 'cashIn'} onOpenChange={() => resetDialogState()}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>{t('registers.cashIn')}</DialogTitle>
                        <DialogDescription>{t('registers.cashInDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cash-in-amount">{t('common.amount')}</Label>
                            <Input
                                id="cash-in-amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cash-in-desc">{t('common.description')}</Label>
                            <Input
                                id="cash-in-desc"
                                placeholder={t('registers.descriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => resetDialogState()}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleCashIn} disabled={!amount || !description.trim() || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('registers.cashIn')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cash Out Dialog */}
            <Dialog open={dialogType === 'cashOut'} onOpenChange={() => resetDialogState()}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>{t('registers.cashOut')}</DialogTitle>
                        <DialogDescription>{t('registers.cashOutDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cash-out-amount">{t('common.amount')}</Label>
                            <Input
                                id="cash-out-amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cash-out-desc">{t('common.description')}</Label>
                            <Input
                                id="cash-out-desc"
                                placeholder={t('registers.descriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => resetDialogState()}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleCashOut} disabled={!amount || !description.trim() || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('registers.cashOut')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Close Register Confirmation */}
            <AlertDialog open={!!closeConfirmId} onOpenChange={() => setCloseConfirmId(null)}>
                <AlertDialogContent className="bg-background border border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('registers.closeRegisterConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('registers.closeRegisterConfirmDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCloseRegister}>
                            {t('registers.closeRegister')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
