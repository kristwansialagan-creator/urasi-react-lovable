import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProviders, Provider } from '@/hooks'
import { Trash2, Edit, Plus, Truck, Phone, Mail, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProvidersPage() {
    const { providers, createProvider, updateProvider, deleteProvider } = useProviders()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentProvider, setCurrentProvider] = useState<Provider | null>(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })

    const handleOpenDialog = (provider?: Provider) => {
        if (provider) {
            setCurrentProvider(provider)
            setFormData({
                name: provider.name,
                email: provider.email || '',
                phone: provider.phone || '',
                address: provider.address || ''
            })
        } else {
            setCurrentProvider(null)
            setFormData({ name: '', email: '', phone: '', address: '' })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentProvider) {
            await updateProvider(currentProvider.id, formData)
        } else {
            await createProvider(formData)
        }
        setIsDialogOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this provider?')) {
            await deleteProvider(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your suppliers and vendors.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Provider
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {providers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                        No providers found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                providers.map((provider) => (
                                    <TableRow key={provider.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-[hsl(var(--primary))]" />
                                                {provider.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                {provider.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                                                        {provider.email}
                                                    </div>
                                                )}
                                                {provider.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                                                        {provider.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                                                <span className="truncate max-w-[200px]">{provider.address || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(provider)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(provider.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentProvider ? 'Edit Provider' : 'New Provider'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Provider Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{currentProvider ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
