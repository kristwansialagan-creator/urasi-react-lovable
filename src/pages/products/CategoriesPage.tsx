import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'

const categoriesData = [
    { id: '1', name: 'Beverages', products: 45, parent: null },
    { id: '2', name: 'Food', products: 78, parent: null },
    { id: '3', name: 'Snacks', products: 56, parent: null },
    { id: '4', name: 'Bakery', products: 23, parent: null },
    { id: '5', name: 'Soft Drinks', products: 25, parent: 'Beverages' },
    { id: '6', name: 'Instant Noodles', products: 30, parent: 'Food' },
]

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Product Categories</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Organize your products into categories</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categoriesData.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`flex items-center justify-between p-4 rounded-lg hover:bg-[hsl(var(--muted))]/50 ${category.parent ? 'ml-8' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FolderTree className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                            <div>
                                                <p className="font-medium">{category.name}</p>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {category.products} products
                                                    {category.parent && ` • Parent: ${category.parent}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Add</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category Name</label>
                            <Input placeholder="Enter category name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parent Category</label>
                            <Input placeholder="Select parent (optional)" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea rows={3} className="w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm" placeholder="Category description" />
                        </div>
                        <Button className="w-full">Add Category</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
