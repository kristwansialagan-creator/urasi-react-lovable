import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Upload, Trash2, Search, Download, Edit2 } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'

export default function MediaLibraryPage() {
    const { media, loading, uploadFile, deleteMedia, fetchMedia } = useMedia()

    const [search, setSearch] = useState('')
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [viewItem, setViewItem] = useState<any | null>(null)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => { fetchMedia() }, [fetchMedia])

    const filteredMedia = media.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()))

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault(); setDragActive(false)
        const files = Array.from(e.dataTransfer.files)
        for (const file of files) {
            await uploadFile(file)
        }
    }, [uploadFile])

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        for (const file of files) {
            await uploadFile(file)
        }
        e.target.value = ''
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this file?')) {
            await deleteMedia(id)
            setSelectedItems(prev => { prev.delete(id); return new Set(prev) })
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedItems.size} files?`)) return
        for (const id of selectedItems) {
            await deleteMedia(id)
        }
        setSelectedItems(new Set())
    }

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const getFileIcon = (ext: string) => {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
        return imageExts.includes(ext.toLowerCase()) ? '🖼️' : '📄'
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Image className="h-8 w-8" />Media Library</h1>
                <div className="flex gap-2">
                    {selectedItems.size > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-2" />Delete ({selectedItems.size})</Button>
                    )}
                    <label>
                        <Button className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />Upload Files</Button>
                        <input type="file" multiple onChange={handleFileInput} className="hidden" accept="image/*,application/pdf" />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Files</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{media.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Images</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-[hsl(var(--primary))]">{media.filter(m => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((m.extension || '').toLowerCase())).length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Documents</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{media.filter(m => !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((m.extension || '').toLowerCase())).length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Selected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{selectedItems.size}</div></CardContent></Card>
            </div>

            <Card className={`border-2 border-dashed transition-colors ${dragActive ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]' : 'border-[hsl(var(--muted))]'}`}
                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}>
                <CardContent className="py-12 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-lg font-medium">Drag & drop files here</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">or click Upload Files above</p>
                </CardContent>
            </Card>

            <Card><CardContent className="pt-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded" />
                </div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>All Files</CardTitle></CardHeader><CardContent>
                {loading ? <div className="text-center py-8">Loading...</div> : filteredMedia.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No files found. Upload your first file!</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredMedia.map(m => {
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((m.extension || '').toLowerCase())
                            return <div key={m.id} className={`relative group rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selectedItems.has(m.id) ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`} onClick={() => toggleSelect(m.id)}>
                                <div className="aspect-square bg-[hsl(var(--muted))] flex items-center justify-center">
                                    {isImage && m.url ? (
                                        <img src={m.url} alt={m.name || ''} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    ) : (
                                        <span className="text-4xl">{getFileIcon(m.extension || '')}</span>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">.{m.extension}</p>
                                        {m.products && m.products.length > 0 && (
                                            <span className="text-xs bg-[hsl(var(--primary))] text-white px-2 py-0.5 rounded-full">
                                                {m.products.length} product{m.products.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={e => { e.stopPropagation(); setViewItem(m) }} className="p-1 bg-white rounded shadow hover:bg-[hsl(var(--muted))]"><Edit2 className="h-4 w-4" /></button>
                                    <button onClick={e => { e.stopPropagation(); handleDelete(m.id) }} className="p-1 bg-white rounded shadow hover:bg-red-100"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                </div>
                                {selectedItems.has(m.id) && <div className="absolute top-2 left-2 w-5 h-5 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                            </div>
                        })}
                    </div>
                )}
            </CardContent></Card>

            {viewItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewItem(null)}>
                    <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <CardHeader><CardTitle>File Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {viewItem.url && (
                                <div className="aspect-video bg-[hsl(var(--muted))] rounded overflow-hidden">
                                    <img src={viewItem.url} alt={viewItem.name} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div><label className="text-sm font-medium">File Name</label><input value={viewItem.name} disabled className="w-full px-3 py-2 border rounded bg-[hsl(var(--muted))]" /></div>
                            <div><label className="text-sm font-medium">URL</label><input value={viewItem.url || ''} disabled className="w-full px-3 py-2 border rounded bg-[hsl(var(--muted))]" /><Button size="sm" variant="outline" className="mt-1" onClick={() => navigator.clipboard.writeText(viewItem.url || '')}>Copy URL</Button></div>
                            <div className="flex gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                                <span>Type: {viewItem.extension}</span>
                                <span>Uploaded: {new Date(viewItem.created_at || '').toLocaleDateString()}</span>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-2">Used by Products</label>
                                {viewItem.products && viewItem.products.length > 0 ? (
                                    <div className="space-y-1">
                                        {viewItem.products.map((product: any) => (
                                            <div key={product.id} className="text-sm px-3 py-2 bg-[hsl(var(--muted))] rounded flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></span>
                                                {product.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] italic">Not used by any product</p>
                                )}
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setViewItem(null)} className="flex-1">Close</Button>
                                {viewItem.url && <a href={viewItem.url} download className="flex-1"><Button className="w-full"><Download className="h-4 w-4 mr-2" />Download</Button></a>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
