/**
 * EventCoverUpload Component
 * 
 * Specialized image uploader for event cover images with 16:9 aspect ratio,
 * preview, and validation specific to event covers.
 * 
 * @module EventCoverUpload
 */

'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2, Crop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface EventCoverUploadProps {
  value?: string
  onChange?: (file: File | null, previewUrl?: string) => void
  onUpload?: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
  label?: string
}

const ACCEPT_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ASPECT_RATIO = 16 / 9 // 16:9

export function EventCoverUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  label = "Event Cover Image",
}: EventCoverUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const validateAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const ratio = img.width / img.height
        const tolerance = 0.1
        const isValid = Math.abs(ratio - ASPECT_RATIO) <= tolerance
        resolve(isValid)
      }
      img.onerror = () => resolve(false)
      img.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        toast.error(`Image is too large. Max size is ${MAX_SIZE / 1024 / 1024}MB`)
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload JPG, PNG, or WebP')
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    // Validate aspect ratio
    const isValidRatio = await validateAspectRatio(file)
    if (!isValidRatio) {
      toast.error('Image should have a 16:9 aspect ratio for best display')
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    // Upload if upload handler provided
    if (onUpload) {
      setIsUploading(true)
      try {
        const uploadedUrl = await onUpload(file)
        setPreview(uploadedUrl)
        onChange?.(file, uploadedUrl)
        toast.success('Cover image uploaded successfully')
      } catch (error) {
        toast.error('Failed to upload image')
        setPreview(null)
        onChange?.(null)
      } finally {
        setIsUploading(false)
      }
    } else {
      onChange?.(file, previewUrl)
    }
  }, [onUpload, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_TYPES,
    maxSize: MAX_SIZE,
    disabled: disabled || isUploading,
    multiple: false,
  })

  const handleRemove = () => {
    setPreview(null)
    onChange?.(null)
    if (value) {
      URL.revokeObjectURL(value)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-xs text-gray-400 ml-2">(16:9 recommended, max 5MB)</span>
      </label>

      {preview ? (
        // Preview Mode
        <div className="relative group rounded-lg overflow-hidden border aspect-video">
          <img
            src={preview}
            alt="Event cover preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('cover-upload-input')?.click()}
              >
                <Crop className="h-4 w-4 mr-1" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Upload Area
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "aspect-video flex flex-col items-center justify-center",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <input id="cover-upload-input" {...getInputProps()} />
          
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          ) : (
            <>
              <div className="p-3 bg-gray-100 rounded-full mb-3">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {isDragActive ? (
                  "Drop your image here"
                ) : (
                  <>
                    Drag & drop or <span className="text-primary">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG or WebP (max 5MB)
              </p>
              <p className="text-xs text-gray-400">
                16:9 aspect ratio recommended
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}