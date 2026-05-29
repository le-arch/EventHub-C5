/**
 * ImageUploader Component
 * 
 * Drag-and-drop image uploader with preview, cropping, and validation.
 * Supports multiple formats and size limits.
 * 
 * @module ImageUploader
 */

'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image' 

interface ImageUploaderProps {
  value?: string
  onChange?: (file: File | null, previewUrl?: string) => void
  onUpload?: (file: File) => Promise<string>
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
  className?: string
  aspectRatio?: 'square' | '16:9' | '4:3' | 'free'
  label?: string
}

const defaultAccept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  accept = defaultAccept,
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  className,
  aspectRatio = '16:9',
  label = 'Upload Image',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)

  const aspectRatioClass = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    free: '',
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        toast.error(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`)
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload JPG, PNG, or WebP')
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

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
        toast.success('Image uploaded successfully')
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
  }, [onUpload, onChange, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
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
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {preview ? (
        // Preview mode
        <div className={cn("relative group rounded-lg overflow-hidden border", aspectRatioClass[aspectRatio])}>
          <Image
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
        // Upload area
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "flex flex-col items-center justify-center p-6",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
            disabled && "opacity-50 cursor-not-allowed",
            aspectRatio === 'free' ? "min-h-[200px]" : aspectRatioClass[aspectRatio]
          )}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
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
                JPEG, PNG or WebP (max {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}