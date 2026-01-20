import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Plus, Search } from 'lucide-react'
import { useUsers, useRoles } from '@/hooks'

export default function UsersPage() {
    const { users, loading, fetchUsers, updateUser, assignRole, removeRole } = useUsers()
    const { roles, fetchRoles } = useRoles()

    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedRoleToAssign, setSelectedRoleToAssign] = useState('')

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [fetchUsers, fetchRoles])

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        (u.first_name?.toLowerCase().includes(search.toLowerCase())) ||
        (u.second_name?.toLowerCase().includes(search.toLowerCase())) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    )

    const handleUpdateUser = async () => {
        if (!selectedUser) return

        // Update user profile
        await updateUser(selectedUser.id, {
            first_name: selectedUser.first_name,
            second_name: selectedUser.second_name,
            role: selectedUser.role
        })

        setEditModalOpen(false)
    }

    const handleAssignExtraRole = async () => {
        if (!selectedUser || !selectedRoleToAssign) return
        await assignRole(selectedUser.id, selectedRoleToAssign)
        setSelectedRoleToAssign('')
    }

    const handleRemoveExtraRole = async (roleId: string) => {
        if (!selectedUser) return
        await removeRole(selectedUser.id, roleId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Manage users, roles, and access permissions.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users</CardTitle>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[300px]"
                            />
                            <Button size="icon" variant="ghost">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Primary Role</TableHead>
                                    <TableHead>Extra Roles</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar_url || ''} />
                                                    <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.first_name || user.username} {user.second_name || ''}</p>
                                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((r: any) => (
                                                    <Badge key={r.id} variant="outline" className="text-xs">
                                                        {r.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setEditModalOpen(true)
                                                }}
                                            >
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
                        <DialogDescription>
                            Update user details and manage roles.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input
                                            value={selectedUser.first_name || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Second Name</Label>
                                        <Input
                                            value={selectedUser.second_name || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, second_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            <div className="space-y-2">
                                <Label>Primary Role (System)</Label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                        <SelectItem value="customer">Customer</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label>Extra Roles (Permissions)</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={selectedRoleToAssign}
                                        onValueChange={setSelectedRoleToAssign}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role to add" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.filter(r => !selectedUser.roles?.find((ur: any) => ur.id === r.id)).map(role => (
                                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignExtraRole} disabled={!selectedRoleToAssign} size="sm">
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedUser.roles?.map((r: any) => (
                                        <Badge key={r.id} variant="secondary" className="gap-1 pr-1">
                                            {r.name}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 hover:bg-transparent"
                                                onClick={() => handleRemoveExtraRole(r.id)}
                                            >
                                                <span className="sr-only">Remove</span>
                                                <Plus className="h-3 w-3 rotate-45" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
