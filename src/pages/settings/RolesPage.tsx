import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Shield, Trash2, Edit } from 'lucide-react'
import { useRoles } from '@/hooks'

export default function RolesPage() {
    const {
        roles, permissions, rolePermissions, loading,
        fetchRoles, createRole, updateRole, deleteRole, togglePermission
    } = useRoles()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', namespace: '', description: '' })

    // Permission Matrix State
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<string | null>(null)

    useEffect(() => {
        fetchRoles()
    }, [fetchRoles])

    // Group permissions by namespace
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, typeof permissions> = {}
        permissions.forEach(p => {
            if (!groups[p.namespace]) groups[p.namespace] = []
            groups[p.namespace].push(p)
        })
        return groups
    }, [permissions])

    const handleSaveRole = async () => {
        if (!formData.name || !formData.namespace) {
            alert('Name and Namespace are required')
            return
        }

        if (editingRole) {
            await updateRole(editingRole.id, formData)
        } else {
            await createRole(formData)
        }
        setModalOpen(false)
        setEditingRole(null)
        setFormData({ name: '', namespace: '', description: '' })
    }

    const startEdit = (role: any) => {
        setEditingRole(role)
        setFormData({ name: role.name, namespace: role.namespace, description: role.description || '' })
        setModalOpen(true)
    }

    const startCreate = () => {
        setEditingRole(null)
        setFormData({ name: '', namespace: '', description: '' })
        setModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure? This will remove all permissions for this role.')) {
            await deleteRole(id)
            if (selectedRoleForPerms === id) setSelectedRoleForPerms(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Define roles and assign granular permissions.
                    </p>
                </div>
                <Button onClick={startCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>Select a role to manage permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                        ) : (
                            <div className="divide-y">
                                {roles.map(role => (
                                    <div
                                        key={role.id}
                                        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors ${selectedRoleForPerms === role.id ? 'bg-[hsl(var(--muted))] border-l-4 border-l-[hsl(var(--primary))]' : ''}`}
                                        onClick={() => setSelectedRoleForPerms(role.id)}
                                    >
                                        <div>
                                            <p className="font-medium">{role.name}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{role.namespace}</p>
                                        </div>
                                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(role)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(role.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Permissions Matrix */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedRoleForPerms
                                ? `Permissions for: ${roles.find(r => r.id === selectedRoleForPerms)?.name}`
                                : 'Select a role to view permissions'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedRoleForPerms ? (
                            <div className="flex flex-col items-center justify-center h-64 text-[hsl(var(--muted-foreground))]">
                                <Shield className="h-12 w-12 mb-4 opacity-20" />
                                <p>Select a role from the left to configure access.</p>
                            </div>
                        ) : (
                            <Tabs defaultValue={Object.keys(groupedPermissions)[0]} className="w-full">
                                <TabsList className="flex-wrap h-auto gap-1 bg-transparent justify-start mb-4">
                                    {Object.keys(groupedPermissions).map(namespace => (
                                        <TabsTrigger
                                            key={namespace}
                                            value={namespace}
                                            className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] border"
                                        >
                                            {namespace}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {Object.entries(groupedPermissions).map(([namespace, perms]) => (
                                    <TabsContent key={namespace} value={namespace} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {perms.map(perm => (
                                                <div key={perm.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                                    <Checkbox
                                                        id={perm.id}
                                                        checked={rolePermissions[selectedRoleForPerms]?.includes(perm.id)}
                                                        onCheckedChange={(checked) => togglePermission(selectedRoleForPerms, perm.id, !!checked)}
                                                    />
                                                    <div className="space-y-1">
                                                        <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                                                            {perm.name}
                                                        </Label>
                                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                            {perm.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input
                                placeholder="e.g. Store Manager"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Namespace (Unique Identifier)</Label>
                            <Input
                                placeholder="e.g. store.manager"
                                value={formData.namespace}
                                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                                disabled={!!editingRole} // Don't change namespace ideally
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Role description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRole}>Save Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
