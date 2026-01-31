import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'

interface MediaSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (mediaUrl: string, mediaId: string) => void
}

export function MediaSelector({ open, onOpenChange, onSelect }: MediaSelectorProps) {
    const { media, loading, fetchMedia } = useMedia()
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchMedia()
        }
    }, [open, fetchMedia])

    const filteredMedia = media.filter(m =>
        (m.name || '').toLowerCase().includes(search.toLowerCase()) &&
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((m.extension || '').toLowerCase())
    )

    const handleSelect = () => {
        const selected = media.find(m => m.id === selectedId)
        if (selected && selected.url) {
            onSelect(selected.url, selected.id)
            onOpenChange(false)
            setSelectedId(null)
            setSearch('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select Image from Media Library</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <Input
                            placeholder="Search images..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Media Grid */}
                    <div className="border rounded-lg p-4 max-h-[50vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading images...</div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                {search ? 'No images found matching your search' : 'No images available. Upload some images first!'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                {filteredMedia.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all hover:border-[hsl(var(--primary))] hover:shadow-lg ${selectedId === m.id ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))] ring-offset-2' : 'border-[hsl(var(--border))]'
                                            }`}
                                        onClick={() => setSelectedId(m.id)}
                                    >
                                        <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-lg overflow-hidden">
                                            {m.url && (
                                                <img
                                                    src={m.url}
                                                    alt={m.name || ''}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                />
                                            )}
                                        </div>
                                        {selectedId === m.id && (
                                            <div className="absolute top-1 right-1 w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate rounded-b-lg">
                                            {m.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            onOpenChange(false)
                            setSelectedId(null)
                            setSearch('')
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedId}>
                            Select Image
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
