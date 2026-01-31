import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SystemResetPage() {
    const [confirmText, setConfirmText] = useState('')
    const [isResetting, setIsResetting] = useState(false)

    const handleSoftReset = () => {
        // Logic to clear transaction data but keep settings
        toast.warning('Soft reset functionality would go here (clear orders, payments, keep products/users)')
    }

    const handleHardReset = () => {
        if (confirmText !== 'DELETE ALL DATA') return
        setIsResetting(true)
        // Logic to clear EVERYTHING
        setTimeout(() => {
            setIsResetting(false)
            toast.warning('System reset simulation complete. In production, this would wipe the database.')
        }, 2000)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-red-600">System Reset</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Danger Zone: Reset application data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="text-orange-700 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" /> Soft Reset
                        </CardTitle>
                        <CardDescription>Clears transactional data only.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            This will remove all:
                            <br />• Orders & Sales
                            <br />• Payments & Refunds
                            <br />• Customer History
                            <br />• Register Logs
                        </p>
                        <p className="text-sm font-medium mb-4">
                            Products, Customers, and Settings will be KEPT.
                        </p>
                        <Button variant="outline" className="w-full border-orange-300 hover:bg-orange-100 text-orange-700" onClick={handleSoftReset}>
                            Perform Soft Reset
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> Hard Reset
                        </CardTitle>
                        <CardDescription>Wipes the entire database.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive" className="bg-red-100 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Critical Warning</AlertTitle>
                            <AlertDescription>
                                This action is irreversible. All data including products, users, and settings will be lost forever.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label className="text-red-900">Type "DELETE ALL DATA" to confirm</Label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="bg-white border-red-300"
                                placeholder="DELETE ALL DATA"
                            />
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={confirmText !== 'DELETE ALL DATA' || isResetting}
                            onClick={handleHardReset}
                        >
                            {isResetting ? 'Resetting...' : 'PERFORM HARD RESET'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
