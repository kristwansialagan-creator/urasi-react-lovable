import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, FolderTree, Loader2, Search, ArrowUpDown, Filter } from 'lucide-react'
import { useProducts } from '@/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CategoriesPage() {
    const { categories, products, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useProducts()
    const { toast } = useToast()

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<string | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<{ id: string, name: string } | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Filter/Sort State
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'>('name-asc')

    // Custom Parent State
    const [customParentName, setCustomParentName] = useState('')
    const [isCreatingParent, setIsCreatingParent] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        parent_id: 'none',
        description: ''
    })
    const [formErrors, setFormErrors] = useState<{ name?: string }>({})

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Calculate product count for a category (including child categories)
    const getCategoryProductCount = (categoryId: string): number => {
        // Get all child category IDs
        const getChildIds = (catId: string): string[] => {
            const children = categories.filter(c => c.parent_id === catId)
            const childIds = children.map(c => c.id)
            // Recursively get grandchildren
            const grandchildIds = children.flatMap(c => getChildIds(c.id))
            return [catId, ...childIds, ...grandchildIds]
        }

        const allCategoryIds = getChildIds(categoryId)
        return products.filter(p => p.category_id && allCategoryIds.includes(p.category_id)).length
    }

    const resetForm = () => {
        setFormData({
            name: '',
            parent_id: 'none',
            description: ''
        })
        setEditingCategory(null)
        setCustomParentName('')
        setIsCreatingParent(false)
    }

    const handleOpenCreate = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (category: typeof categories[0]) => {
        setFormData({
            name: category.name,
            parent_id: category.parent_id || 'none',
            description: category.description || ''
        })
        setEditingCategory(category.id)
        setIsDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('=== FORM SUBMIT STARTED ===')
        console.log('Form data:', formData)
        console.log('Editing category:', editingCategory)

        // Clear previous errors
        setFormErrors({})

        // Validation - Only check if name is empty
        if (!formData.name.trim()) {
            console.log('Validation failed: name is empty')
            setFormErrors({ name: 'Category name is required' })
            toast({ variant: "destructive", title: "Validation Error", description: "Category name is required" })
            return
        }

        console.log('Validation passed, proceeding to save...')
        setActionLoading(true)
        try {
            const finalParentId = formData.parent_id === 'none' ? null : formData.parent_id;

            const payload = {
                name: formData.name.trim(),
                parent_id: finalParentId,
                description: formData.description.trim()
            }
            console.log('Payload:', payload)

            if (editingCategory) {
                console.log('Updating category:', editingCategory)
                await updateCategory(editingCategory, payload as any)
                console.log('Update successful')
                toast({ title: "Success", description: "Category updated successfully" })
            } else {
                console.log('Creating new category...')
                const result = await createCategory(payload as any)
                console.log('Create successful, result:', result)
                toast({ title: "Success", description: "Category created successfully" })
            }
            console.log('Closing dialog and resetting form')
            setIsDialogOpen(false)
            resetForm()
        } catch (err: any) {
            console.error('Error during save:', err)
            if (err.message?.includes('duplicate key value') || err.message?.includes('product_categories_name_key')) {
                setFormErrors({ name: 'Category name already exists' })
                toast({ variant: "destructive", title: "Validation Error", description: "Category name already exists" })
            } else {
                toast({ variant: "destructive", title: "Error", description: err.message || "Failed to save category" })
            }
        } finally {
            setActionLoading(false)
            console.log('=== FORM SUBMIT COMPLETED ===')
        }
    }

    const handleCreateCustomParent = async () => {
        const trimmedName = customParentName.trim()

        // Validation
        if (!trimmedName) {
            toast({ variant: "destructive", title: "Validation Error", description: "Parent category name is required" })
            return
        }

        if (trimmedName.length < 3) {
            toast({ variant: "destructive", title: "Validation Error", description: "Parent category name must be at least 3 characters" })
            return
        }

        if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedName)) {
            toast({ variant: "destructive", title: "Validation Error", description: "Parent category name contains invalid characters" })
            return
        }

        // Check if already exists
        const existing = categories.find((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase())
        if (existing) {
            setFormData(prev => ({ ...prev, parent_id: existing.id }))
            setCustomParentName('')
            toast({ title: "Info", description: `Category "${trimmedName}" already exists and has been selected` })
            return
        }

        setIsCreatingParent(true)
        try {
            const newParent = await createCategory({
                name: trimmedName,
                status: 'active',
                description: 'Created as parent category'
            } as any)

            if (newParent) {
                setFormData(prev => ({ ...prev, parent_id: newParent.id }))
                setCustomParentName('')
                toast({ title: "Success", description: `Parent category "${trimmedName}" created and selected` })
            }
        } catch (err: any) {
            if (err.message?.includes('duplicate key value') || err.message?.includes('product_categories_name_key')) {
                toast({ variant: "destructive", title: "Validation Error", description: "Category name already exists" })
            } else {
                toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create parent category" })
            }
        } finally {
            setIsCreatingParent(false)
        }
    }

    const handleOpenDelete = (category: { id: string, name: string }) => {
        setDeletingCategory(category)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingCategory) return

        setActionLoading(true)
        try {
            await deleteCategory(deletingCategory.id)
            toast({ title: "Success", description: `Category "${deletingCategory.name}" deleted` })
            setIsDeleteDialogOpen(false)
            setDeletingCategory(null)
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete category" })
        } finally {
            setActionLoading(false)
        }
    }

    // Process categories: Filter & Sort - Build Hierarchy
    const processedCategories = useMemo(() => {
        let filtered = [...categories]

        // Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase()
            filtered = filtered.filter(c => c.name.toLowerCase().includes(lowerSearch))
        }

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c =>
                statusFilter === 'active' ? c.status === 'active' : c.status === 'inactive'
            )
        }

        // Build hierarchy: separate parents and children
        const topLevel = filtered.filter(c => !c.parent_id)
        const children = filtered.filter(c => c.parent_id)

        // Create map of children by parent_id
        const childrenByParent = new Map<string, typeof categories>()
        children.forEach(child => {
            const parentId = child.parent_id!
            if (!childrenByParent.has(parentId)) {
                childrenByParent.set(parentId, [])
            }
            childrenByParent.get(parentId)!.push(child)
        })

        // Build result with parents and their children
        const result: Array<typeof categories[0] & { children?: typeof categories }> = []

        topLevel.forEach(parent => {
            result.push({
                ...parent,
                children: childrenByParent.get(parent.id) || []
            })
        })

        // Sort parents
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name)
                case 'name-desc':
                    return b.name.localeCompare(a.name)
                case 'date-asc':
                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                case 'date-desc':
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                default:
                    return 0
            }
        })

        // Sort children within each parent
        result.forEach(parent => {
            if (parent.children) {
                parent.children.sort((a, b) => a.name.localeCompare(b.name))
            }
        })

        return result
    }, [categories, searchTerm, statusFilter, sortBy])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Product Categories</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage category hierarchy and status</p>
                </div>
                <Button className="gap-2" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-border shadow-lg">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                        <SelectTrigger className="w-[180px]">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-border shadow-lg">
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="date-desc">Date (Newest)</SelectItem>
                            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="w-full bg-white">
                <CardHeader>
                    <CardTitle>Category List ({processedCategories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-4">
                            Error: {error}
                        </div>
                    )}
                    {loading && categories.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : processedCategories.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                            <FolderTree className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No categories found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {processedCategories.map((parent) => (
                                <div key={parent.id} className="space-y-1">
                                    {/* Parent Category */}
                                    <div
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${parent.status === 'inactive' ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-md ${parent.status === 'inactive' ? 'bg-muted' : 'bg-primary/10'}`}>
                                                <FolderTree className={`h-5 w-5 ${parent.status === 'inactive' ? 'text-muted-foreground' : 'text-primary'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{parent.name}</p>
                                                    {parent.status === 'inactive' && (
                                                        <span className="text-[10px] uppercase font-bold bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">Inactive</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{getCategoryProductCount(parent.id)} items</span>
                                                    {parent.children && parent.children.length > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{parent.children.length} subcategories</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(parent)}
                                                title="Edit Category"
                                                className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 active:scale-95"
                                                onClick={() => handleOpenDelete({ id: parent.id, name: parent.name })}
                                                title="Delete Category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Child Categories */}
                                    {parent.children && parent.children.length > 0 && (
                                        <div className="space-y-1">
                                            {parent.children.map((child) => (
                                                <div
                                                    key={child.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border border-dashed transition-all ${child.status === 'inactive' ? 'opacity-60 bg-muted/20' : 'hover:bg-muted/30'}`}
                                                >
                                                    <div className="flex items-center gap-3 ml-12">
                                                        <div className={`p-1.5 rounded ${child.status === 'inactive' ? 'bg-muted' : 'bg-primary/5'}`}>
                                                            <FolderTree className={`h-4 w-4 ${child.status === 'inactive' ? 'text-muted-foreground' : 'text-primary/70'}`} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-sm">{child.name}</p>
                                                                {child.status === 'inactive' && (
                                                                    <span className="text-[9px] uppercase font-bold bg-muted-foreground/20 text-muted-foreground px-1 py-0.5 rounded">Inactive</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                <span>{getCategoryProductCount(child.id)} items</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
                                                            onClick={() => handleOpenEdit(child)}
                                                            title="Edit Subcategory"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 active:scale-95"
                                                            onClick={() => handleOpenDelete({ id: child.id, name: child.name })}
                                                            title="Delete Subcategory"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white border shadow-lg text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingCategory ? 'Update details and hierarchy.' : 'Create a new category.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name" className="text-foreground">Category Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    name="categoryName"
                                    placeholder="e.g., Beverages"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value })
                                        if (formErrors.name) setFormErrors({})
                                    }}
                                    autoFocus
                                    className={`bg-background text-foreground ${formErrors.name ? 'border-destructive' : ''}`}
                                    autoComplete="off"
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="parent" className="text-foreground">Parent Category</Label>
                                <Select
                                    name="parentCategory"
                                    value={formData.parent_id}
                                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                                >
                                    <SelectTrigger id="parent" className="w-full bg-background text-foreground">
                                        <SelectValue placeholder="Select parent category..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-2 border-border shadow-lg">
                                        <SelectItem value="none">None (Top Level)</SelectItem>
                                        {categories
                                            .filter(c => c.id !== editingCategory && !c.parent_id)
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>

                                {/* Custom Parent Creation */}
                                <div className="pt-2 border-t">
                                    <p className="text-[0.75rem] text-muted-foreground mb-2">Or create a new parent category:</p>
                                    <div className="flex gap-2">
                                        <Input
                                            name="customParentName"
                                            placeholder="New parent category name..."
                                            value={customParentName}
                                            onChange={(e) => setCustomParentName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleCreateCustomParent()
                                                }
                                            }}
                                            className="flex-1 bg-background text-foreground"
                                            disabled={isCreatingParent}
                                            autoComplete="off"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleCreateCustomParent}
                                            disabled={isCreatingParent || !customParentName.trim()}
                                        >
                                            {isCreatingParent ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Optional. Select an existing category as parent, or leave as "None" for top-level category.
                                </p>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description" className="text-foreground">Description</Label>
                                <textarea
                                    id="description"
                                    name="categoryDescription"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                                    placeholder="Optional description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white border shadow-lg text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Delete Category</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={actionLoading}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
