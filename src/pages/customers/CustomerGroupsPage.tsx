import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCustomers } from '@/hooks'
import { Trash2, Edit, Plus, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function CustomerGroupsPage() {
    const { groups, createGroup, updateGroup, deleteGroup } = useCustomers()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentGroup, setCurrentGroup] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', description: '', minimal_credit_payment: 0 })

    const handleOpenDialog = (group?: any) => {
        if (group) {
            setCurrentGroup(group)
            setFormData({
                name: group.name,
                description: group.description,
                minimal_credit_payment: group.minimal_credit_payment || 0
            })
        } else {
            setCurrentGroup(null)
            setFormData({ name: '', description: '', minimal_credit_payment: 0 })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentGroup) {
            await updateGroup(currentGroup.id, formData)
        } else {
            await createGroup(formData)
        }
        setIsDialogOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this group?')) {
            await deleteGroup(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Groups</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage customer segments and rewards.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Group
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
                            <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{group.description || 'No description'}</div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                Min. Credit: {group.minimal_credit_payment}
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(group)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(group.id)}>
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
                        <DialogTitle>{currentGroup ? 'Edit Group' : 'New Group'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Group Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum Credit Payment</Label>
                            <Input
                                type="number"
                                value={formData.minimal_credit_payment}
                                onChange={(e) => setFormData({ ...formData, minimal_credit_payment: parseFloat(e.target.value) })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{currentGroup ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
