import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Library } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { MediaSelector } from './MediaSelector'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onMediaIdChange: (mediaId: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, onMediaIdChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB"
      })
      return
    }

    setUploading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) throw new Error('Failed to get public URL')

      // Create media record in database
      const { data: mediaData, error: mediaError } = await supabase
        .from('medias')
        .insert({
          name: file.name,
          extension: fileExt,
          slug: filePath,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (mediaError) throw mediaError

      // Update parent component
      onChange(urlData.publicUrl)
      onMediaIdChange(mediaData.id)

      toast({
        title: "Image uploaded successfully",
        description: "Product image has been uploaded"
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image"
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange('')
    onMediaIdChange('')
  }

  const handleMediaSelect = (mediaUrl: string, mediaId: string) => {
    onChange(mediaUrl)
    onMediaIdChange(mediaId)
    toast({
      title: "Image selected",
      description: "Image from library has been applied"
    })
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {value ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={value}
                alt="Product image"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Image
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsMediaSelectorOpen(true)}
            >
              <Library className="h-4 w-4 mr-2" />
              Select from Library
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Drag and drop an image or click to browse
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              PNG, JPG, GIF up to 5MB
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsMediaSelectorOpen(true)}
                disabled={uploading}
              >
                <Library className="h-4 w-4 mr-2" />
                Select from Library
              </Button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>

      <MediaSelector
        open={isMediaSelectorOpen}
        onOpenChange={setIsMediaSelectorOpen}
        onSelect={handleMediaSelect}
      />
    </Card>
  )
}
