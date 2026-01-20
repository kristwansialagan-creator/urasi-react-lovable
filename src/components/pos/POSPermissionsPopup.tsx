import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

interface POSPermissionsPopupProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    requiredPermission: string
}

export default function POSPermissionsPopup({ isOpen, onClose, onSuccess, requiredPermission }: POSPermissionsPopupProps) {
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Note: Using static PIN for development. Production implementation should
        // verify against user roles/permissions in Supabase with proper authentication.
        // See usePermissions hook for role-based access patterns.
        if (pin === '1234') {
            onSuccess()
            onClose()
            setPin('')
            setError('')
        } else {
            setError('Invalid PIN code')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-red-500" />
                        Manager Authorization
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                        Action requires: <span className="font-medium text-[hsl(var(--foreground))]">{requiredPermission}</span>
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Enter Manager PIN</Label>
                            <Input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="****"
                                autoFocus
                                className="text-center text-2xl tracking-widest"
                                maxLength={4}
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="destructive">Authorize</Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
