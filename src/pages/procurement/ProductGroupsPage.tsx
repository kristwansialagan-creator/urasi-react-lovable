import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface ProductGroup {
    id: string
    name: string
    description?: string
    products_count: number
    created_at: string
}

export default function ProductGroupsPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const [groups, setGroups] = useState<ProductGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null)
    const [formData, setFormData] = useState({ name: '', description: '' })

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('product_groups')
                .select(`
                    *,
                    products:product_group_items(count)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            const groupsWithCount: ProductGroup[] = data?.map((g: any) => ({
                ...g,
                products_count: g.products?.[0]?.count || 0
            })) || []
            setGroups(groupsWithCount)
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingGroup) {
                const { error } = await supabase
                    .from('product_groups')
                    .update(formData)
                    .eq('id', editingGroup.id)
                if (error) throw error
                toast({ title: 'Success', description: 'Product group updated' })
            } else {
                const { error } = await supabase
                    .from('product_groups')
                    .insert([formData])
                if (error) throw error
                toast({ title: 'Success', description: 'Product group created' })
            }
            setShowForm(false)
            setFormData({ name: '', description: '' })
            setEditingGroup(null)
            fetchGroups()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const handleEdit = (group: ProductGroup) => {
        setEditingGroup(group)
        setFormData({ name: group.name, description: group.description || '' })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product group?')) return
        try {
            const { error } = await supabase
                .from('product_groups')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast({ title: 'Success', description: 'Product group deleted' })
            fetchGroups()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Product Groups</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Organize products into groups for procurement</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditingGroup(null); setFormData({ name: '', description: '' }); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Group
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingGroup ? 'Edit' : 'Create'} Product Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Group Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter group name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description (optional)"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingGroup ? 'Update' : 'Create'} Group</Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingGroup(null); }}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">Loading...</div>
            ) : groups.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Package className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                        <p className="text-[hsl(var(--muted-foreground))]">No product groups yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                        <Card key={group.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{group.name}</h3>
                                        {group.description && (
                                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{group.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(group)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                                    <Package className="h-4 w-4" />
                                    <span className="text-sm">{group.products_count} products</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={() => navigate(`/app/procurement/groups/${group.id}/products`)}
                                >
                                    Manage Products
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
