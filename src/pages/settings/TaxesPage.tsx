import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Plus, Edit2, Trash2, Percent } from 'lucide-react'
import { useTaxes } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function TaxesPage() {
    const { taxes, groups: taxGroups, loading, createTax, updateTax, deleteTax, createGroup, updateGroup, deleteGroup } = useTaxes()
    const [showModal, setShowModal] = useState(false)
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [editingTax, setEditingTax] = useState<any>(null)
    const [editingGroup, setEditingGroup] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', rate: 0, tax_type: 'percentage' as 'percentage' | 'flat', description: '' })
    const [groupData, setGroupData] = useState({ name: '', description: '' })
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'tax' | 'group', id: string } | null>(null)

    useEffect(() => { resetForm() }, [])

    const resetForm = () => {
        setFormData({ name: '', rate: 0, tax_type: 'percentage', description: '' })
        setGroupData({ name: '', description: '' })
        setEditingTax(null)
        setEditingGroup(null)
    }

    const handleSaveTax = async () => {
        if (!formData.name) return toast.error('Name required')
        const success = editingTax ? await updateTax(editingTax.id, formData) : await createTax(formData)
        if (success) { resetForm(); setShowModal(false) }
    }

    const handleDeleteTax = (id: string) => {
        setDeleteConfirm({ type: 'tax', id })
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return
        if (deleteConfirm.type === 'tax') {
            await deleteTax(deleteConfirm.id)
        } else {
            await deleteGroup(deleteConfirm.id)
        }
        setDeleteConfirm(null)
    }

    const openEdit = (tax: any) => {
        setFormData({ name: tax.name, rate: tax.rate, tax_type: tax.tax_type, description: tax.description || '' })
        setEditingTax(tax)
        setShowModal(true)
    }

    const handleSaveGroup = async () => {
        if (!groupData.name) return toast.error('Name required')
        const success = editingGroup ? await updateGroup(editingGroup.id, groupData) : await createGroup(groupData)
        if (success) { resetForm(); setShowGroupModal(false) }
    }

    const handleDeleteGroup = (id: string) => {
        setDeleteConfirm({ type: 'group', id })
    }

    const openGroupEdit = (group: any) => {
        setGroupData({ name: group.name, description: group.description || '' })
        setEditingGroup(group)
        setShowGroupModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Calculator className="h-8 w-8" />Tax Configuration</h1>
                <div className="flex gap-2">
                    <Button onClick={() => { resetForm(); setShowGroupModal(true) }} variant="outline"><Plus className="h-4 w-4 mr-2" />New Tax Group</Button>
                    <Button onClick={() => { resetForm(); setShowModal(true) }}><Plus className="h-4 w-4 mr-2" />New Tax</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Taxes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{taxes.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tax Groups</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{taxGroups.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Average Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{taxes.length > 0 ? (taxes.reduce((sum: number, t: any) => sum + t.rate, 0) / taxes.length).toFixed(2) : 0}%</div></CardContent></Card>
            </div>

            {/* Tax Groups */}
            <Card><CardHeader><CardTitle>Tax Groups</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-4">Loading...</div> : taxGroups.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No tax groups. Create your first group!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {taxGroups.map((group: any) => (
                            <Card key={group.id} className="border">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg">{group.name}</h3>
                                    </div>
                                    {group.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{group.description}</p>}
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button size="sm" variant="outline" onClick={() => openGroupEdit(group)} className="flex-1"><Edit2 className="h-3 w-3 mr-1" />Edit</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(group.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent></Card>

            {/* Taxes List */}
            <Card><CardHeader><CardTitle>All Taxes</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-4">Loading...</div> : taxes.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No taxes configured</div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-right p-3">Rate</th><th className="text-left p-3">Type</th><th className="text-left p-3">Description</th><th className="text-center p-3">Actions</th></tr></thead>
                        <tbody>{taxes.map((tax: any) => (
                            <tr key={tax.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                <td className="p-3 font-medium">{tax.name}</td>
                                <td className="p-3 text-right font-bold text-[hsl(var(--primary))]">{tax.tax_type === 'percentage' ? `${tax.rate}%` : formatCurrency(tax.rate)}</td>
                                <td className="p-3"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs capitalize">{tax.tax_type}</span></td>
                                <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">{tax.description || '-'}</td>
                                <td className="p-3"><div className="flex gap-2 justify-center"><Button size="sm" variant="outline" onClick={() => openEdit(tax)}><Edit2 className="h-3 w-3" /></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteTax(tax.id)}><Trash2 className="h-3 w-3" /></Button></div></td>
                            </tr>
                        ))}</tbody></table>
                )}
            </CardContent></Card>

            {/* Tax Modal - Using Dialog Component */}
            <Dialog open={showModal} onOpenChange={(open) => { setShowModal(open); if (!open) resetForm() }}>
                <DialogContent className="bg-background/100 backdrop-blur-sm border border-border shadow-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTax ? 'Edit' : 'New'} Tax</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name *</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Sales Tax" />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select value={formData.tax_type} onValueChange={(value: 'percentage' | 'flat') => setFormData({ ...formData, tax_type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover/100 backdrop-blur-sm border border-border shadow-lg z-[150]">
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="flat">Flat Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Rate *</Label>
                            <div className="relative">
                                <Input type="number" step="0.01" value={formData.rate} onChange={e => setFormData({ ...formData, rate: Number(e.target.value) })} />
                                {formData.tax_type === 'percentage' && <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />}
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
                        <Button onClick={handleSaveTax}>{editingTax ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Group Modal - Using Dialog Component */}
            <Dialog open={showGroupModal} onOpenChange={(open) => { setShowGroupModal(open); if (!open) resetForm() }}>
                <DialogContent className="bg-background/100 backdrop-blur-sm border border-border shadow-lg">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit' : 'New'} Tax Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name *</Label>
                            <Input value={groupData.name} onChange={e => setGroupData({ ...groupData, name: e.target.value })} placeholder="Tax Group Name" />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input value={groupData.description} onChange={e => setGroupData({ ...groupData, description: e.target.value })} placeholder="Optional description" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setShowGroupModal(false); resetForm() }}>Cancel</Button>
                        <Button onClick={handleSaveGroup}>{editingGroup ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
                title={`Delete ${deleteConfirm?.type === 'tax' ? 'Tax' : 'Tax Group'}?`}
                description={deleteConfirm?.type === 'tax'
                    ? 'This will permanently delete this tax configuration.'
                    : 'This will permanently delete this tax group.'
                }
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    )
}
