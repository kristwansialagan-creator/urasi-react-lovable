import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Plus, Edit2, Trash2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import BarcodeGenerator from '@/components/barcode/BarcodeGenerator'

interface LabelTemplate {
    id: string
    name: string
    width: number
    height: number
    template: string
    is_default: boolean
    paper_size: string
    created_at: string
}

export default function LabelTemplatesPage() {
    const [templates, setTemplates] = useState<LabelTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        width: 50,
        height: 30,
        paper_size: '80mm',
        template: '',
        is_default: false
    })

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('label_templates')
            .select('*')
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (!error) setTemplates(data || [])
        setLoading(false)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            width: 50,
            height: 30,
            paper_size: '80mm',
            template: '',
            is_default: false
        })
        setEditingTemplate(null)
    }

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required')

        const user = await supabase.auth.getUser()
        const templateData: any = {
            name: formData.name,
            width: formData.width,
            height: formData.height,
            paper_size: formData.paper_size,
            template: formData.template || getDefaultTemplate(),
            is_default: formData.is_default
        }

        if (editingTemplate) {
            const { error } = await supabase
                .from('label_templates')
                .update(templateData)
                .eq('id', editingTemplate.id)

            if (error) return alert('Failed to update template')
        } else {
            const { error } = await supabase
                .from('label_templates')
                .insert([{ ...templateData, author: user.data.user?.id }])

            if (error) return alert('Failed to create template')
        }

        await fetchTemplates()
        setShowModal(false)
        resetForm()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this template?')) return

        const { error } = await supabase
            .from('label_templates')
            .delete()
            .eq('id', id)

        if (!error) fetchTemplates()
    }

    const setAsDefault = async (id: string) => {
        // First, unset all defaults
        await supabase
            .from('label_templates')
            .update({ is_default: false })
            .neq('id', '00000000-0000-0000-0000-000000000000')

        // Then set the selected one as default
        const { error } = await supabase
            .from('label_templates')
            .update({ is_default: true })
            .eq('id', id)

        if (!error) fetchTemplates()
    }

    const openEdit = (template: LabelTemplate) => {
        setFormData({
            name: template.name,
            width: template.width,
            height: template.height,
            paper_size: template.paper_size,
            template: template.template,
            is_default: template.is_default
        })
        setEditingTemplate(template)
        setShowModal(true)
    }

    const getDefaultTemplate = () => {
        return `<div style="width: ${formData.width}mm; height: ${formData.height}mm; padding: 5mm; text-align: center; font-family: Arial; border: 1px solid #ccc;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 3mm;">{{product.name}}</div>
    <div style="margin: 3mm 0;">
        <div id="barcode-{{product.id}}"></div>
    </div>
    <div style="font-size: 12px; color: #666;">SKU: {{product.sku}}</div>
    <div style="font-size: 16px; font-weight: bold; margin-top: 2mm;">{{product.price}}</div>
</div>`
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Tag className="h-8 w-8" />Label Templates Management</h1>
                <Button onClick={() => { resetForm(); setShowModal(true) }}><Plus className="h-4 w-4 mr-2" />New Template</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Templates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{templates.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Default Template</CardTitle></CardHeader><CardContent><div className="text-sm font-medium">{templates.find(t => t.is_default)?.name || 'None'}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Paper Sizes</CardTitle></CardHeader><CardContent><div className="text-sm font-medium">{[...new Set(templates.map(t => t.paper_size))].join(', ') || 'N/A'}</div></CardContent></Card>
            </div>

            {/* Templates Grid */}
            <Card><CardHeader><CardTitle>All Templates</CardTitle></CardHeader><CardContent>
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                        <Tag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No label templates yet. Create your first template!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                            <Card key={template.id} className={`border-2 ${template.is_default ? 'border-[hsl(var(--primary))]' : 'border-transparent'}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{template.name}</h3>
                                            {template.is_default && <span className="inline-block px-2 py-0.5 bg-[hsl(var(--primary))] text-white text-xs rounded mt-1">Default</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Size:</span><span className="font-mono">{template.width} x {template.height} mm</span></div>
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Paper:</span><span>{template.paper_size}</span></div>
                                        <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Created:</span><span>{new Date(template.created_at).toLocaleDateString()}</span></div>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t mt-4">
                                        {!template.is_default && <Button size="sm" variant="outline" onClick={() => setAsDefault(template.id)} className="flex-1"><Check className="h-3 w-3 mr-1" />Set Default</Button>}
                                        <Button size="sm" variant="outline" onClick={() => openEdit(template)}><Edit2 className="h-3 w-3" /></Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent></Card>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8"><CardHeader><CardTitle>{editingTemplate ? 'Edit' : 'New'} Label Template</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><Label>Template Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Product Label Standard" /></div>
                            <div><Label>Width (mm)</Label><Input type="number" step="0.1" value={formData.width} onChange={e => setFormData({ ...formData, width: Number(e.target.value) })} /></div>
                            <div><Label>Height (mm)</Label><Input type="number" step="0.1" value={formData.height} onChange={e => setFormData({ ...formData, height: Number(e.target.value) })} /></div>
                            <div><Label>Paper Size</Label><select value={formData.paper_size} onChange={e => setFormData({ ...formData, paper_size: e.target.value })} className="w-full px-3 py-2 border rounded"><option value="58mm">58mm</option><option value="80mm">80mm</option><option value="A4">A4</option><option value="Letter">Letter</option></select></div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="default" checked={formData.is_default} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} /><Label htmlFor="default">Set as default template</Label></div>
                        </div>

                        <div><Label>Template HTML (Optional - leave blank for default)</Label><textarea value={formData.template} onChange={e => setFormData({ ...formData, template: e.target.value })} className="w-full px-3 py-2 border rounded min-h-[200px] font-mono text-sm" placeholder="Leave blank to use default template..." /></div>

                        <div className="bg-[hsl(var(--muted))] p-3 rounded text-sm"><p className="font-semibold mb-2">Available Variables:</p><div className="grid grid-cols-2 gap-2 font-mono text-xs"><code>{'{{product.name}}'}</code><code>{'{{product.sku}}'}</code><code>{'{{product.price}}'}</code><code>{'{{product.id}}'}</code><code>{'{{product.barcode}}'}</code><code>{'{{product.category}}'}</code></div></div>

                        {/* Preview */}
                        <div className="border-2 border-dashed p-4 rounded"><Label className="mb-2 block">Preview:</Label><div style={{ width: `${formData.width}mm`, height: `${formData.height}mm` }} className="mx-auto border bg-white"><div dangerouslySetInnerHTML={{ __html: (formData.template || getDefaultTemplate()).replace(/\{\{product\.name\}\}/g, 'Sample Product').replace(/\{\{product\.sku\}\}/g, 'SKU-001').replace(/\{\{product\.price\}\}/g, '$19.99').replace(/\{\{product\.id\}\}/g, '123') }} /></div></div>

                        <div className="flex gap-2 pt-4"><Button variant="outline" onClick={() => { setShowModal(false); resetForm() }} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1">{editingTemplate ? 'Update' : 'Create'}</Button></div>
                    </CardContent></Card>
                </div>
            )}
        </div>
    )
}
