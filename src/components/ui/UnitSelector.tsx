import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, ChevronsUpDown, Check, Search, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnits } from '@/hooks'

interface Unit {
    id: string
    name: string
    identifier: string
    description: string | null
    value: number | null
    base_unit: boolean | null
    group_id: string | null
    group?: { id: string; name: string } | null
    author?: string | null
    created_at?: string | null
}

interface UnitSelectorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    showManageButton?: boolean
    filterByProductStock?: { unit_id: string }[]
}

export function UnitSelector({
    value,
    onChange,
    placeholder = "Select unit...",
    className,
    showManageButton = true,
    filterByProductStock
}: UnitSelectorProps) {
    const { units, groups, fetchUnits, createUnit, updateUnit, deleteUnit } = useUnits()
    
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    
    // Create/Edit dialog state
    const [showUnitDialog, setShowUnitDialog] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [unitFormData, setUnitFormData] = useState({
        name: '',
        identifier: '',
        value: 1,
        base_unit: false,
        group_id: '',
        description: ''
    })
    const [isSaving, setIsSaving] = useState(false)
    
    // Delete confirmation state
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    
    // Manage popover state
    const [showManagePopover, setShowManagePopover] = useState(false)

    useEffect(() => {
        fetchUnits()
    }, [fetchUnits])

    const selectedUnit = units.find(u => u.id === value)

    // Filter units based on search and optional product stock filter
    const filteredUnits = useMemo(() => {
        let result = units
        
        // If filtering by product stock, only show units that the product has
        if (filterByProductStock && filterByProductStock.length > 0) {
            const stockUnitIds = new Set(filterByProductStock.map(s => s.unit_id))
            const filtered = result.filter(u => stockUnitIds.has(u.id))
            // If no units match, show all units
            if (filtered.length > 0) {
                result = filtered
            }
        }
        
        if (search) {
            const searchLower = search.toLowerCase()
            result = result.filter(u =>
                u.name?.toLowerCase().includes(searchLower) ||
                u.identifier?.toLowerCase().includes(searchLower)
            )
        }
        
        return result
    }, [units, search, filterByProductStock])

    const resetUnitForm = () => {
        setUnitFormData({
            name: '',
            identifier: '',
            value: 1,
            base_unit: false,
            group_id: '',
            description: ''
        })
        setEditingUnit(null)
    }

    const openCreateDialog = () => {
        resetUnitForm()
        setShowUnitDialog(true)
        setOpen(false)
    }

    const openEditDialog = (unit: Unit) => {
        setUnitFormData({
            name: unit.name,
            identifier: unit.identifier,
            value: unit.value || 1,
            base_unit: unit.base_unit || false,
            group_id: unit.group_id || '',
            description: unit.description || ''
        })
        setEditingUnit(unit)
        setShowUnitDialog(true)
        setShowManagePopover(false)
    }

    const handleSaveUnit = async () => {
        if (!unitFormData.name || !unitFormData.identifier) {
            alert('Name and identifier are required')
            return
        }

        setIsSaving(true)
        try {
            let success: boolean | undefined
            if (editingUnit) {
                success = (await updateUnit(editingUnit.id, unitFormData)) as unknown as boolean
            } else {
                success = (await createUnit(unitFormData)) as unknown as boolean
            }

            if (success) {
                // If creating new unit, select it
                if (!editingUnit) {
                    // Fetch updated units and select the new one
                    await fetchUnits()
                    const newUnit = units.find(u => 
                        u.identifier === unitFormData.identifier && 
                        u.name === unitFormData.name
                    )
                    if (newUnit) {
                        onChange(newUnit.id)
                    }
                }
                setShowUnitDialog(false)
                resetUnitForm()
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteUnit = async () => {
        if (!unitToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteUnit(unitToDelete.id)
            if (success) {
                // If the deleted unit was selected, clear selection
                if (value === unitToDelete.id) {
                    onChange('')
                }
            }
        } finally {
            setIsDeleting(false)
            setUnitToDelete(null)
        }
    }

    const confirmDelete = (unit: Unit) => {
        setUnitToDelete(unit)
        setShowManagePopover(false)
    }

    return (
        <div className={cn("flex gap-2", className)}>
            {/* Unit Select Dropdown */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="flex-1 justify-between font-normal"
                    >
                        {selectedUnit ? (
                            <span className="truncate">
                                {selectedUnit.name} ({selectedUnit.identifier})
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 bg-popover z-[100]" align="start">
                    {/* Search */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            placeholder="Search units..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    
                    {/* Units List */}
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filteredUnits.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No units found.
                            </div>
                        ) : (
                            filteredUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                                    onClick={() => {
                                        onChange(unit.id)
                                        setOpen(false)
                                        setSearch('')
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4 shrink-0",
                                            value === unit.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm">{unit.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {unit.identifier}
                                            {unit.base_unit && ' • Base Unit'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Create New Unit Button */}
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={openCreateDialog}
                        >
                            <Plus className="h-4 w-4" />
                            Create New Unit
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Manage Button */}
            {showManageButton && (
                <Popover open={showManagePopover} onOpenChange={setShowManagePopover}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" title="Manage Units">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-popover z-[100]" align="end">
                        <div className="p-3 border-b">
                            <h4 className="font-semibold">Manage Units</h4>
                            <p className="text-xs text-muted-foreground">Edit or delete existing units</p>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto">
                            {units.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No units configured
                                </div>
                            ) : (
                                units.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-accent border-b last:border-b-0"
                                    >
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-medium truncate">{unit.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {unit.identifier}
                                                {unit.base_unit && ' • Base'}
                                                {(unit as any).group?.name && ` • ${(unit as any).group.name}`}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEditDialog(unit)}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => confirmDelete(unit)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="border-t p-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={openCreateDialog}
                            >
                                <Plus className="h-4 w-4" />
                                Add New Unit
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* Create/Edit Unit Dialog */}
            <Dialog open={showUnitDialog} onOpenChange={(open) => { setShowUnitDialog(open); if (!open) resetUnitForm() }}>
                <DialogContent className="bg-background">
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? 'Edit' : 'Create'} Unit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    placeholder="e.g., Piece, Box, Kilogram"
                                    value={unitFormData.name}
                                    onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Identifier *</Label>
                                <Input
                                    placeholder="e.g., pcs, box, kg"
                                    value={unitFormData.identifier}
                                    onChange={(e) => setUnitFormData({ ...unitFormData, identifier: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Conversion Value</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={unitFormData.value}
                                    onChange={(e) => setUnitFormData({ ...unitFormData, value: Number(e.target.value) })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Value relative to base unit (e.g., 1 box = 12 pcs → value = 12)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Group</Label>
                                <Select
                                    value={unitFormData.group_id || "none"}
                                    onValueChange={(value) => setUnitFormData({ ...unitFormData, group_id: value === "none" ? "" : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-[150]">
                                        <SelectItem value="none">No group</SelectItem>
                                        {groups.map((g) => (
                                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="unit_base_unit"
                                checked={unitFormData.base_unit}
                                onCheckedChange={(checked) => setUnitFormData({ ...unitFormData, base_unit: !!checked })}
                            />
                            <Label htmlFor="unit_base_unit" className="cursor-pointer">Base Unit</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Optional description"
                                value={unitFormData.description}
                                onChange={(e) => setUnitFormData({ ...unitFormData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setShowUnitDialog(false); resetUnitForm() }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUnit} disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingUnit ? 'Update' : 'Create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{unitToDelete?.name}"? 
                            This may affect products using this unit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUnit}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
