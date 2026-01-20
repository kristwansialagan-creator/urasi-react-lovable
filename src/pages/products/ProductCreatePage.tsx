import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Search, ScanLine, Plus, Loader2, Trash2 } from 'lucide-react'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { ImageUpload } from '@/components/ui/image-upload'
import { productLookupService } from '@/services/productLookup'
import { useToast } from '@/hooks/use-toast'
import { useProducts } from '@/hooks'
import { useCategories } from '@/hooks'
import { useSkuParents } from '@/hooks/useSkuParents'
import { useProductExtraction } from '@/contexts/ProductExtractionContext'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function ProductCreatePage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { toast } = useToast()
    const { createProduct, updateProduct } = useProducts()
    const { categories, createCategory } = useCategories()
    const { skuParents, createSkuParent, deleteSkuParent } = useSkuParents()
    const { extractedData, clearExtractedData, metadata } = useProductExtraction()
    const [loading, setLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')
    const isEditMode = !!id

    // Form states
    const [name, setName] = useState('')
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

    // SKU Parent-Child states
    const [skuParentId, setSkuParentId] = useState<string>('none')
    const [skuSuffix, setSkuSuffix] = useState('')

    // New optional fields
    const [brand, setBrand] = useState('')
    const [shelfLife, setShelfLife] = useState('')
    const [bpomNumber, setBpomNumber] = useState('')
    const [registrationNumber, setRegistrationNumber] = useState('')
    const [halalNumber, setHalalNumber] = useState('')
    const [composition, setComposition] = useState('')

    // Category creation dialog state
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryParent, setNewCategoryParent] = useState('none')
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)

    // SKU Parent dialog states
    const [isSkuParentDialogOpen, setIsSkuParentDialogOpen] = useState(false)
    const [newSkuParentCode, setNewSkuParentCode] = useState('')
    const [newSkuParentName, setNewSkuParentName] = useState('')
    const [newSkuParentDescription, setNewSkuParentDescription] = useState('')
    const [isCreatingSkuParent, setIsCreatingSkuParent] = useState(false)

    // SKU Parent delete confirmation
    const [skuParentToDelete, setSkuParentToDelete] = useState<string | null>(null)
    const [isDeletingSkuParent, setIsDeletingSkuParent] = useState(false)

    // Computed SKU
    const computedSku = useMemo(() => {
        const parent = skuParents.find(p => p.id === skuParentId)
        if (parent && skuSuffix) {
            return `${parent.code}${skuSuffix}`
        }
        return skuSuffix || ''
    }, [skuParentId, skuSuffix, skuParents])

    // Auto-fill from extracted product data (from AI Chat)
    useEffect(() => {
        if (extractedData && !isEditMode) {
            if (extractedData.name) setName(extractedData.name)
            if (extractedData.sku) setSkuSuffix(extractedData.sku)
            if (extractedData.barcode) setBarcode(extractedData.barcode)
            if (extractedData.description) setDescription(extractedData.description)
            if (extractedData.selling_price) setSellingPrice(extractedData.selling_price.toString())
            if (extractedData.purchase_price) setPurchasePrice(extractedData.purchase_price.toString())
            if (extractedData.stock_quantity) setStock(extractedData.stock_quantity.toString())
            if (extractedData.brand) setBrand(extractedData.brand)
            if (extractedData.shelf_life) setShelfLife(extractedData.shelf_life)
            if (extractedData.bpom_number) setBpomNumber(extractedData.bpom_number)
            if (extractedData.registration_number) setRegistrationNumber(extractedData.registration_number)
            if (extractedData.halal_number) setHalalNumber(extractedData.halal_number)
            if (extractedData.composition) setComposition(extractedData.composition)
            
            toast({
                title: "Data Auto-Filled",
                description: `Product data extracted from ${metadata?.sourceUrl || 'URL'}`,
            })
            
            clearExtractedData()
        }
    }, [extractedData, isEditMode, metadata, clearExtractedData, toast])

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
                    setBarcode(product.barcode || '')
                    setCategoryId(product.category_id || 'none')
                    setDescription(product.description || '')
                    setSellingPrice(product.selling_price?.toString() || '')
                    setPurchasePrice(product.purchase_price?.toString() || '')
                    setStatus(product.status || 'available')
                    setStockManagement(product.stock_management ?? true)
                    setThumbnailId(product.thumbnail_id || '')

                    // SKU Parent-Child handling
                    if (product.sku_parent_id) {
                        setSkuParentId(product.sku_parent_id)
                        // Extract suffix from full SKU
                        const parent = skuParents.find(p => p.id === product.sku_parent_id)
                        if (parent && product.sku?.startsWith(parent.code)) {
                            setSkuSuffix(product.sku.slice(parent.code.length))
                        } else {
                            setSkuSuffix(product.sku || '')
                        }
                    } else {
                        setSkuSuffix(product.sku || '')
                    }

                    // New fields
                    setBrand(product.brand || '')
                    setShelfLife(product.shelf_life || '')
                    setBpomNumber(product.bpom_number || '')
                    setRegistrationNumber(product.registration_number || '')
                    setHalalNumber(product.halal_number || '')
                    setComposition(product.composition || '')

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
    }, [id, navigate, toast, skuParents])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const productData = {
                name,
                sku: computedSku || undefined,
                barcode: barcode || undefined,
                description,
                selling_price: parseFloat(sellingPrice) || 0,
                purchase_price: parseFloat(purchasePrice) || 0,
                status,
                stock_management: stockManagement,
                thumbnail_id: thumbnailId || null,
                category_id: categoryId === 'none' ? null : categoryId,
                sku_parent_id: skuParentId === 'none' ? null : skuParentId,
                brand: brand || null,
                shelf_life: shelfLife || null,
                bpom_number: bpomNumber || null,
                registration_number: registrationNumber || null,
                halal_number: halalNumber || null,
                composition: composition || null,
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

    const handleCreateSkuParent = async () => {
        if (!newSkuParentCode.trim() || !newSkuParentName.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Code and name are required" })
            return
        }

        setIsCreatingSkuParent(true)
        try {
            const result = await createSkuParent({
                code: newSkuParentCode.trim(),
                name: newSkuParentName.trim(),
                description: newSkuParentDescription.trim() || undefined
            })

            if (result) {
                setSkuParentId(result.id)
                setIsSkuParentDialogOpen(false)
                setNewSkuParentCode('')
                setNewSkuParentName('')
                setNewSkuParentDescription('')
            }
        } finally {
            setIsCreatingSkuParent(false)
        }
    }

    const handleDeleteSkuParent = async () => {
        if (!skuParentToDelete) return

        setIsDeletingSkuParent(true)
        try {
            const success = await deleteSkuParent(skuParentToDelete)
            if (success && skuParentId === skuParentToDelete) {
                setSkuParentId('none')
            }
        } finally {
            setIsDeletingSkuParent(false)
            setSkuParentToDelete(null)
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
                    <p className="text-muted-foreground">
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
                                {/* Barcode Row */}
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
                                    
                                    {/* SKU Parent Selector */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sku-parent">SKU Parent (Induk)</Label>
                                        <div className="flex gap-2">
                                            <Select value={skuParentId} onValueChange={(val) => {
                                                if (val === 'create-new') {
                                                    setIsSkuParentDialogOpen(true)
                                                } else {
                                                    setSkuParentId(val)
                                                }
                                            }}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select SKU Parent..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-background border shadow-lg">
                                                    <SelectItem value="none">None (No Parent)</SelectItem>
                                                    {skuParents.map((parent) => (
                                                        <SelectItem key={parent.id} value={parent.id}>
                                                            <span className="font-mono">{parent.code}</span>
                                                            <span className="text-muted-foreground ml-2">- {parent.name}</span>
                                                        </SelectItem>
                                                    ))}
                                                    <div className="border-t mt-1 pt-1">
                                                        <SelectItem value="create-new" className="text-primary font-medium">
                                                            <Plus className="inline-block h-4 w-4 mr-1" />
                                                            Create New SKU Parent
                                                        </SelectItem>
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            {skuParentId !== 'none' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setSkuParentToDelete(skuParentId)}
                                                    title="Delete SKU Parent"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SKU Child Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku-suffix">SKU Suffix (Child)</Label>
                                        <Input
                                            id="sku-suffix"
                                            placeholder="e.g., 001, A1, etc."
                                            value={skuSuffix}
                                            onChange={(e) => setSkuSuffix(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Combined with parent to form full SKU
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Final SKU</Label>
                                        <Input
                                            value={computedSku}
                                            disabled
                                            className="bg-muted font-mono"
                                            placeholder="SKU will appear here"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Auto-generated from Parent + Suffix
                                        </p>
                                    </div>
                                </div>

                                {/* Name & Category Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name *</Label>
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
                                            <SelectContent className="bg-background border shadow-lg max-h-[300px]">
                                                <div className="p-2 border-b sticky top-0 bg-background z-10">
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
                                                            return (
                                                                <SelectItem key={parent.id} value={parent.id} className="font-medium">
                                                                    {parent.name}
                                                                </SelectItem>
                                                            )
                                                        }

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

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={3}
                                        placeholder="Product description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Regulatory & Brand Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Regulatory & Brand Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Merek (Brand)</Label>
                                        <Input
                                            id="brand"
                                            placeholder="Brand name"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shelf-life">Masa Penyimpanan (Shelf Life)</Label>
                                        <Input
                                            id="shelf-life"
                                            placeholder="e.g., 12 months, 2 years"
                                            value={shelfLife}
                                            onChange={(e) => setShelfLife(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bpom-number">No BPOM</Label>
                                        <Input
                                            id="bpom-number"
                                            placeholder="BPOM registration number"
                                            value={bpomNumber}
                                            onChange={(e) => setBpomNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registration-number">No Registrasi</Label>
                                        <Input
                                            id="registration-number"
                                            placeholder="Product registration number"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="halal-number">No Halal</Label>
                                        <Input
                                            id="halal-number"
                                            placeholder="Halal certification number"
                                            value={halalNumber}
                                            onChange={(e) => setHalalNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="composition">Komposisi (Composition)</Label>
                                    <Textarea
                                        id="composition"
                                        rows={2}
                                        placeholder="Product ingredients or composition"
                                        value={composition}
                                        onChange={(e) => setComposition(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
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
                                        <Label htmlFor="selling_price">Selling Price *</Label>
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
                            </CardContent>
                        </Card>

                        {/* Inventory */}
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
                                            disabled={isEditMode}
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
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <DialogContent className="sm:max-w-[425px]">
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
                                <SelectContent className="bg-background border shadow-lg">
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

            {/* SKU Parent Creation Dialog */}
            <Dialog open={isSkuParentDialogOpen} onOpenChange={setIsSkuParentDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New SKU Parent</DialogTitle>
                        <DialogDescription>
                            Create a new SKU parent code that will be used as prefix for product SKUs.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-sku-parent-code">Code (Prefix) *</Label>
                            <Input
                                id="new-sku-parent-code"
                                placeholder="e.g., FOOD-, BEV-, ELEC-"
                                value={newSkuParentCode}
                                onChange={(e) => setNewSkuParentCode(e.target.value.toUpperCase())}
                                className="font-mono"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be the prefix for all child SKUs
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-sku-parent-name">Name *</Label>
                            <Input
                                id="new-sku-parent-name"
                                placeholder="e.g., Food Products"
                                value={newSkuParentName}
                                onChange={(e) => setNewSkuParentName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-sku-parent-description">Description</Label>
                            <Textarea
                                id="new-sku-parent-description"
                                placeholder="Optional description"
                                value={newSkuParentDescription}
                                onChange={(e) => setNewSkuParentDescription(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSkuParentDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateSkuParent} disabled={isCreatingSkuParent}>
                            {isCreatingSkuParent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create SKU Parent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SKU Parent Delete Confirmation */}
            <AlertDialog open={!!skuParentToDelete} onOpenChange={(open) => !open && setSkuParentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete SKU Parent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this SKU Parent. Products using this parent will not be affected, 
                            but you won't be able to use this parent for new products.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteSkuParent} 
                            disabled={isDeletingSkuParent}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeletingSkuParent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
