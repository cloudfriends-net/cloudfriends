import { useCallback, useState } from 'react'

export interface FileValidation {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  maxFiles?: number
}

export interface FileError {
  file: File
  error: string
}

export function useFileHandler(validation?: FileValidation) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<FileError[]>([])

  const validateFile = useCallback((file: File): string | null => {
    if (validation?.maxSize && file.size > validation.maxSize) {
      return `File size ${formatFileSize(file.size)} exceeds maximum allowed size ${formatFileSize(validation.maxSize)}`
    }

    if (validation?.allowedTypes && !validation.allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${validation.allowedTypes.join(', ')}`
    }

    return null
  }, [validation])

  const validateFiles = useCallback((files: File[]): { valid: File[], invalid: FileError[] } => {
    const valid: File[] = []
    const invalid: FileError[] = []

    if (validation?.maxFiles && files.length > validation.maxFiles) {
      return {
        valid: [],
        invalid: [{ file: files[0], error: `Too many files. Maximum ${validation.maxFiles} files allowed.` }]
      }
    }

    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        invalid.push({ file, error })
      } else {
        valid.push(file)
      }
    }

    return { valid, invalid }
  }, [validateFile, validation])

  const handleFiles = useCallback(async (
    files: File[],
    processor: (files: File[]) => Promise<void>
  ): Promise<void> => {
    setIsProcessing(true)
    setErrors([])

    try {
      const { valid, invalid } = validateFiles(files)
      
      if (invalid.length > 0) {
        setErrors(invalid)
      }

      if (valid.length > 0) {
        await processor(valid)
      }
    } catch (error) {
      setErrors([{ 
        file: files[0], 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }])
    } finally {
      setIsProcessing(false)
    }
  }, [validateFiles])

  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }, [])

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }, [])

  const readFileAsArrayBuffer = useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const downloadFile = useCallback((
    content: string | Blob,
    filename: string,
    mimeType?: string
  ) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return {
    isProcessing,
    errors,
    handleFiles,
    readFileAsText,
    readFileAsDataURL,
    readFileAsArrayBuffer,
    downloadFile,
    validateFile,
    validateFiles
  }
}

// Utility function to format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Hook for drag and drop file handling
export function useDragAndDrop(
  onFiles: (files: File[]) => void,
  validation?: FileValidation
) {
  const [isDragging, setIsDragging] = useState(false)
  const { validateFiles } = useFileHandler(validation)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const { valid } = validateFiles(files)
    onFiles(valid)
  }, [onFiles, validateFiles])

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  }
}
