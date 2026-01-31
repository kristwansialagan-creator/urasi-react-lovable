import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Save } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function BulkEditorPage() {
    const [targetType, setTargetType] = useState('products')
    const [operation, setOperation] = useState('price_increase')

    // This is a simplified UI for the bulk editor. 
    // Real implementation would require a complex data grid or file upload.

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Editor</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Perform mass updates on your data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Operation Settings</CardTitle>
                        <CardDescription>Select what you want to update</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Data</label>
                            <Select value={targetType} onValueChange={setTargetType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover/100 backdrop-blur-sm border border-border shadow-lg z-50">
                                    <SelectItem value="products">Products</SelectItem>
                                    <SelectItem value="customers">Customers</SelectItem>
                                    <SelectItem value="orders">Orders</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action</label>
                            <Select value={operation} onValueChange={setOperation}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover/100 backdrop-blur-sm border border-border shadow-lg z-50">
                                    <SelectItem value="price_increase">Increase Price (%)</SelectItem>
                                    <SelectItem value="price_decrease">Decrease Price (%)</SelectItem>
                                    <SelectItem value="stock_set">Set Stock Level</SelectItem>
                                    <SelectItem value="category_move">Move Category</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full">
                            Preview Changes
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Preview & Execute</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                            <AlertDescription className="text-yellow-700">
                                Bulk operations cannot be undone easily. Please verify your selection carefully before applying changes.
                            </AlertDescription>
                        </Alert>

                        <div className="border rounded-md p-8 text-center bg-muted/20">
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Select an operation to see a preview of affected items here.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button disabled variant="destructive" className="gap-2">
                                <Save className="h-4 w-4" /> Apply Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
