import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'
import { supabase } from '@/lib/supabase'

interface MediaInputProps {
    value?: string
    onChange: (url: string) => void
    bucket?: string
    folder?: string
    accept?: string
    maxSize?: number // in MB
}

export function MediaInput({
    value,
    onChange,
    bucket = 'media',
    folder = 'uploads',
    accept = 'image/*',
    maxSize = 5
}: MediaInputProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | undefined>(value)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`)
            return
        }

        try {
            setUploading(true)
            setError('')

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to Supabase
            const fileExt = file.name.split('.').pop()
            const fileName = `${folder}/${Math.random()}.${fileExt}`

            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            onChange(publicUrl)
        } catch (error: any) {
            setError(error.message || 'Failed to upload file')
            setPreview(undefined)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(undefined)
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {preview ? (
                <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]/50 transition-colors"
                >
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                Max {maxSize}MB
                            </p>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
