import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Package, Search, ScanLine, Plus, Loader2 } from 'lucide-react'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { ImageUpload } from '@/components/ui/image-upload'
import { productLookupService } from '@/services/productLookup'
import { useToast } from '@/hooks/use-toast'
import { useProducts } from '@/hooks'
import { useCategories } from '@/hooks'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function ProductCreatePage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const { createProduct, updateProduct } = useProducts()
    const { categories, createCategory } = useCategories()
    const [loading, setLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')
    const [isCategorySearching, setIsCategorySearching] = useState(false)
    const isEditMode = !!id

    // Form states
    const [name, setName] = useState('')
    const [sku, setSku] = useState('')
    const [barcode, setBarcode] = useState('')
    const [categoryId, setCategoryId] = useState('none')
    const [description, setDescription] = useState('')
    const [sellingPrice, setSellingPrice] = useState('')
    const [purchasePrice, setPurchasePrice] = useState('')
    const [stock, setStock] = useState('')
    const [lowStock, setLowStock] = useState('10')
    const [unit, setUnit] = useState('')
    const [status, setStatus] = useState('available')
    const [stockManagement, setStockManagement] = useState(true)
    const [imageUrl, setImageUrl] = useState('')
    const [thumbnailId, setThumbnailId] = useState('')

    // Category creation dialog state
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryParent, setNewCategoryParent] = useState('none')
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)

    // Load product data if in edit mode
    useEffect(() => {
        if (!id) return

        const loadProduct = async () => {
            setLoading(true)
            try {
                const { data: product, error } = await supabase
                    .from('products')
                    .select(`*, stock:product_unit_quantities(*), category:product_categories(*), thumbnail:medias(*)`)
                    .eq('id', id)
                    .single()

                if (error) throw error
                if (product) {
                    setName(product.name)
                    setSku(product.sku || '')
                    setBarcode(product.barcode || '')
                    setCategoryId(product.category_id || 'none')
                    setDescription(product.description || '')
                    setSellingPrice(product.selling_price?.toString() || '')
                    setPurchasePrice(product.purchase_price?.toString() || '')
                    setStatus(product.status || 'available')
                    setStockManagement(product.stock_management ?? true)
                    setThumbnailId(product.thumbnail_id || '')

                    // Set image URL if thumbnail exists
                    if (product.thumbnail?.slug) {
                        const { data: urlData } = supabase.storage
                            .from('product-images')
                            .getPublicUrl(product.thumbnail.slug)
                        setImageUrl(urlData.publicUrl)
                    }

                    if (product.stock && product.stock.length > 0) {
                        const s = product.stock[0]
                        setStock(s.quantity?.toString() || '')
                        setLowStock(s.low_quantity?.toString() || '')
                        // setUnit(s.unit_id) 
                    }
                }
            } catch (err) {
                console.error(err)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load product details"
                })
                navigate('/products')
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [id, navigate, toast])

    const handleBarcodeScan = async (code: string) => {
        setBarcode(code)
        handleLookup(code)
    }

    const handleLookup = async (codeToLookup: string = barcode) => {
        if (!codeToLookup) return

        setLookupLoading(true)
        try {
            const info = await productLookupService.identifyAndFetch(codeToLookup)

            if (info) {
                if (info.name) setName(info.name)
                // Skip category from lookup since we use categoryId now
                if (info.description) setDescription(info.description)
                if (info.barcode && !barcode) setBarcode(info.barcode)

                toast({
                    title: "Product Found",
                    description: `Successfully loaded data for ${info.name}`,
                })
            } else {
                toast({
                    title: "Product Not Found",
                    description: "Could not find product details. Please fill manually.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Lookup Failed",
                description: "An error occurred while looking up product details.",
                variant: "destructive"
            })
        } finally {
            setLookupLoading(false)
        }
    }

    const handleBarcodeFill = (barcodeValue: string) => {
        setBarcode(barcodeValue)
        handleLookup(barcodeValue)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const productData = {
                name,
                sku: sku || undefined,
                barcode: barcode || undefined,
                description,
                selling_price: parseFloat(sellingPrice) || 0,
                purchase_price: parseFloat(purchasePrice) || 0,
                status,
                stock_management: stockManagement,
                thumbnail_id: thumbnailId || null,
                category_id: categoryId === 'none' ? null : categoryId,
            }

            if (isEditMode && id) {
                await updateProduct(id, productData)
                toast({ title: "Success", description: "Product updated successfully" })
            } else {
                await createProduct(productData)
                toast({ title: "Success", description: "Product created successfully" })
            }
            navigate('/products')
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save product" })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNewCategory = async () => {
        if (!newCategoryName.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Category name is required" })
            return
        }

        setIsCreatingCategory(true)
        try {
            const newCategory = await createCategory({
                name: newCategoryName.trim(),
                parent_id: newCategoryParent === 'none' ? null : newCategoryParent,
                status: 'active'
            } as any)

            if (newCategory) {
                setCategoryId(newCategory.id)
                toast({ title: "Success", description: "Category created successfully" })
                setIsCategoryDialogOpen(false)
                setNewCategoryName('')
                setNewCategoryParent('none')
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create category" })
        } finally {
            setIsCreatingCategory(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        {isEditMode ? 'Update existing product information' : 'Create a new product in your inventory'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode">Barcode / QR Code</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="barcode"
                                                placeholder="Scan or enter barcode"
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        handleLookup()
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleLookup()}
                                                disabled={lookupLoading}
                                                title="Lookup Product"
                                            >
                                                <Search className={`h-4 w-4 ${lookupLoading ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <BarcodeScanner
                                                onScan={handleBarcodeScan}
                                                trigger={
                                                    <Button type="button" variant="outline" size="icon" title="Scan with Camera">
                                                        <ScanLine className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Scan barcode to auto-fill field
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            placeholder="Auto-generated if empty"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" required>Product Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter product name"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={categoryId} onValueChange={(val) => {
                                            if (val === 'create-new') {
                                                setIsCategoryDialogOpen(true)
                                            } else {
                                                setCategoryId(val)
                                            }
                                        }}>
                                            <SelectTrigger id="category" className="w-full">
                                                <SelectValue placeholder="Select category..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-2 border-border shadow-lg max-h-[300px]">
                                                {/* Search Input */}
                                                <div className="p-2 border-b sticky top-0 bg-white z-10">
                                                    <Input
                                                        placeholder="Search categories..."
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        className="h-8 text-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>

                                                <SelectItem value="none" className="font-medium">None (Uncategorized)</SelectItem>

                                                {categories
                                                    .filter(cat => !cat.parent_id)
                                                    .filter(parent => {
                                                        // Filter by search term
                                                        if (!categorySearch) return true
                                                        const searchLower = categorySearch.toLowerCase()
                                                        const parentMatch = parent.name.toLowerCase().includes(searchLower)
                                                        const childMatch = categories
                                                            .filter(c => c.parent_id === parent.id)
                                                            .some(child => child.name.toLowerCase().includes(searchLower))
                                                        return parentMatch || childMatch
                                                    })
                                                    .map((parent) => {
                                                        const children = categories
                                                            .filter(c => c.parent_id === parent.id)
                                                            .filter(child => {
                                                                if (!categorySearch) return true
                                                                return child.name.toLowerCase().includes(categorySearch.toLowerCase())
                                                            })

                                                        if (children.length === 0) {
                                                            // Parent with no children - selectable
                                                            return (
                                                                <SelectItem key={parent.id} value={parent.id} className="font-medium">
                                                                    {parent.name}
                                                                </SelectItem>
                                                            )
                                                        }

                                                        // Parent with children - use SelectGroup
                                                        return (
                                                            <SelectGroup key={parent.id}>
                                                                <SelectLabel className="text-sm font-semibold text-foreground px-2 py-1.5">
                                                                    {parent.name}
                                                                </SelectLabel>
                                                                {children.map(child => (
                                                                    <SelectItem
                                                                        key={child.id}
                                                                        value={child.id}
                                                                        className="pl-6 text-sm text-muted-foreground"
                                                                    >
                                                                        {child.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        )
                                                    })}

                                                <div className="border-t mt-1 pt-1">
                                                    <SelectItem value="create-new" className="text-primary font-medium">
                                                        <Plus className="inline-block h-4 w-4 mr-1" />
                                                        Create New Category
                                                    </SelectItem>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                                        placeholder="Product description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="purchase_price">Purchase Price</Label>
                                        <Input
                                            id="purchase_price"
                                            type="number"
                                            placeholder="0"
                                            value={purchasePrice}
                                            onChange={(e) => setPurchasePrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="selling_price" required>Selling Price</Label>
                                        <Input
                                            id="selling_price"
                                            type="number"
                                            placeholder="0"
                                            required
                                            value={sellingPrice}
                                            onChange={(e) => setSellingPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wholesale_price">Wholesale Price</Label>
                                        <Input id="wholesale_price" type="number" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_group">Tax Group</Label>
                                        <Input id="tax_group" placeholder="Select tax group" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Initial Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            placeholder="0"
                                            value={stock}
                                            onChange={(e) => setStock(e.target.value)}
                                            disabled={isEditMode} // Disable stock edit on main form for now
                                            title={isEditMode ? "Use Stock Adjustment to change stock" : ""}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock">Low Stock Alert</Label>
                                        <Input
                                            id="low_stock"
                                            type="number"
                                            placeholder="10"
                                            value={lowStock}
                                            onChange={(e) => setLowStock(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit">Unit</Label>
                                        <Input
                                            id="unit"
                                            placeholder="Select unit"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                    onMediaIdChange={setThumbnailId}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Product Status</Label>
                                    <select
                                        id="status"
                                        className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="stock_management"
                                        className="rounded"
                                        checked={stockManagement}
                                        onChange={(e) => setStockManagement(e.target.checked)}
                                    />
                                    <Label htmlFor="stock_management">Enable Stock Management</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                                <Save className="h-4 w-4" />
                                {isEditMode ? 'Update Product' : 'Save Product'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Category Creation Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">Category Name *</Label>
                            <Input
                                id="new-category-name"
                                placeholder="e.g., Electronics"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-category-parent">Parent Category</Label>
                            <Select value={newCategoryParent} onValueChange={setNewCategoryParent}>
                                <SelectTrigger id="new-category-parent" className="w-full">
                                    <SelectValue placeholder="Select parent..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-2 border-border shadow-lg">
                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                    {categories
                                        .filter(cat => !cat.parent_id)
                                        .map((parent) => (
                                            <SelectItem key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateNewCategory} disabled={isCreatingCategory}>
                            {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
