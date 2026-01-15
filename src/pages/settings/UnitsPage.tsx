import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ruler, Plus, Edit2, Trash2 } from 'lucide-react'
import { useUnits } from '@/hooks'

export default function UnitsPage() {
    const { units, groups, loading, createUnit, updateUnit, deleteUnit, createGroup, updateGroup, deleteGroup } = useUnits()
    const [showModal, setShowModal] = useState(false)
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [editingUnit, setEditingUnit] = useState<any>(null)
    const [editingGroup, setEditingGroup] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', identifier: '', value: 1, base_unit: false, group_id: '', description: '' })
    const [groupData, setGroupData] = useState({ name: '', description: '' })

    useEffect(() => { resetForm() }, [])

    const resetForm = () => {
        setFormData({ name: '', identifier: '', value: 1, base_unit: false, group_id: '', description: '' })
        setGroupData({ name: '', description: '' })
        setEditingUnit(null)
        setEditingGroup(null)
    }

    const handleSaveUnit = async () => {
        if (!formData.name || !formData.identifier) return alert('Name and identifier required')
        const success = editingUnit ? await updateUnit(editingUnit.id, formData) : await createUnit(formData)
        if (success) { resetForm(); setShowModal(false) }
    }

    const handleDeleteUnit = async (id: string) => {
        if (confirm('Delete this unit?')) await deleteUnit(id)
    }

    const openEdit = (unit: any) => {
        setFormData({ name: unit.name, identifier: unit.identifier, value: unit.value, base_unit: unit.base_unit, group_id: unit.group_id || '', description: unit.description || '' })
        setEditingUnit(unit)
        setShowModal(true)
    }

    const handleSaveGroup = async () => {
        if (!groupData.name) return alert('Name required')
        const success = editingGroup ? await updateGroup(editingGroup.id, groupData) : await createGroup(groupData)
        if (success) { resetForm(); setShowGroupModal(false) }
    }

    const handleDeleteGroup = async (id: string) => {
        if (confirm('Delete this unit group?')) await deleteGroup(id)
    }

    const openGroupEdit = (group: any) => {
        setGroupData({ name: group.name, description: group.description || '' })
        setEditingGroup(group)
        setShowGroupModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Ruler className="h-8 w-8" />Units Management</h1>
                <div className="flex gap-2">
                    <Button onClick={() => { resetForm(); setShowGroupModal(true) }} variant="outline"><Plus className="h-4 w-4 mr-2" />New Group</Button>
                    <Button onClick={() => { resetForm(); setShowModal(true) }}><Plus className="h-4 w-4 mr-2" />New Unit</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Units</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{units.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Unit Groups</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{groups.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Base Units</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{units.filter((u: any) => u.base_unit).length}</div></CardContent></Card>
            </div>

            {/* Unit Groups */}
            <Card><CardHeader><CardTitle>Unit Groups</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-4">Loading...</div> : groups.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No unit groups</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {groups.map((group: any) => (
                            <Card key={group.id} className="border">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg">{group.name}</h3>
                                    </div>
                                    {group.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{group.description}</p>}
                                    <div className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{units.filter((u: any) => u.group_id === group.id).length} units</div>
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

            {/* Units List */}
            <Card><CardHeader><CardTitle>All Units</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-4">Loading...</div> : units.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No units configured</div>
                ) : (
                    <table className="w-full"><thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Identifier</th><th className="text-center p-3">Value</th><th className="text-center p-3">Base Unit</th><th className="text-left p-3">Group</th><th className="text-center p-3">Actions</th></tr></thead>
                        <tbody>{units.map((unit: any) => (
                            <tr key={unit.id} className="border-b hover:bg-[hsl(var(--muted))]">
                                <td className="p-3 font-medium">{unit.name}</td>
                                <td className="p-3"><span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs font-mono">{unit.identifier}</span></td>
                                <td className="p-3 text-center font-bold">{unit.value}</td>
                                <td className="p-3 text-center">{unit.base_unit ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Yes</span> : <span className="text-[hsl(var(--muted-foreground))]">No</span>}</td>
                                <td className="p-3">{unit.group?.name || '-'}</td>
                                <td className="p-3"><div className="flex gap-2 justify-center"><Button size="sm" variant="outline" onClick={() => openEdit(unit)}><Edit2 className="h-3 w-3" /></Button><Button size="sm" variant="destructive" onClick={() => handleDeleteUnit(unit.id)}><Trash2 className="h-3 w-3" /></Button></div></td>
                            </tr>
                        ))}</tbody></table>
                )}
            </CardContent></Card>

            {/* Unit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md"><CardHeader><CardTitle>{editingUnit ? 'Edit' : 'New'} Unit</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Piece, Box, Kilogram" /></div>
                        <div><Label>Identifier *</Label><Input value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} placeholder="pcs, box, kg" /></div>
                        <div><Label>Value (conversion factor)</Label><Input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} /></div>
                        <div><Label>Group</Label><select value={formData.group_id} onChange={e => setFormData({ ...formData, group_id: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="">Select group...</option>{groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                        <div className="flex items-center gap-2"><input type="checkbox" checked={formData.base_unit} onChange={e => setFormData({ ...formData, base_unit: e.target.checked })} id="base" /><Label htmlFor="base">Base Unit</Label></div>
                        <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" /></div>
                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => { setShowModal(false); resetForm() }} className="flex-1">Cancel</Button><Button onClick={handleSaveUnit} className="flex-1">{editingUnit ? 'Update' : 'Create'}</Button></div>
                    </CardContent></Card>
                </div>
            )}

            {/* Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md"><CardHeader><CardTitle>{editingGroup ? 'Edit' : 'New'} Unit Group</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Name *</Label><Input value={groupData.name} onChange={e => setGroupData({ ...groupData, name: e.target.value })} placeholder="Weight, Volume, Length" /></div>
                        <div><Label>Description</Label><Input value={groupData.description} onChange={e => setGroupData({ ...groupData, description: e.target.value })} placeholder="Optional" /></div>
                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => { setShowGroupModal(false); resetForm() }} className="flex-1">Cancel</Button><Button onClick={handleSaveGroup} className="flex-1">{editingGroup ? 'Update' : 'Create'}</Button></div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    )
}
