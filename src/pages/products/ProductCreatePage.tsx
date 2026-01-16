import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Package } from 'lucide-react'

export default function ProductCreatePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // TODO: Implement product creation
        setTimeout(() => {
            setLoading(false)
            navigate('/products')
        }, 1000)
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add New Product</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Create a new product in your inventory</p>
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
                                        <Label htmlFor="name" required>Product Name</Label>
                                        <Input id="name" placeholder="Enter product name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input id="sku" placeholder="Auto-generated if empty" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode">Barcode</Label>
                                        <Input id="barcode" placeholder="Enter barcode" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input id="category" placeholder="Select category" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea id="description" rows={3} className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm" placeholder="Product description" />
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
                                        <Input id="purchase_price" type="number" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="selling_price" required>Selling Price</Label>
                                        <Input id="selling_price" type="number" placeholder="0" required />
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
                                        <Input id="stock" type="number" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="low_stock">Low Stock Alert</Label>
                                        <Input id="low_stock" type="number" placeholder="10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit">Unit</Label>
                                        <Input id="unit" placeholder="Select unit" />
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
                                <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center">
                                    <Package className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Drag and drop an image or click to browse
                                    </p>
                                    <Button variant="outline" className="mt-4">Upload Image</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Product Status</Label>
                                    <select id="status" className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm">
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="stock_management" className="rounded" defaultChecked />
                                    <Label htmlFor="stock_management">Enable Stock Management</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 gap-2" loading={loading}>
                                <Save className="h-4 w-4" />
                                Save Product
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
