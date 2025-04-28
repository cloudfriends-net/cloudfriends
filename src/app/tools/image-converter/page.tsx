'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import NextImage from 'next/image'

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp'

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg')
  const [isConverting, setIsConverting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const convertImage = async () => {
    if (!selectedFile || !canvasRef.current) return

    setIsConverting(true)
    try {
      // Create an image element to load the file
      const img = new window.Image()
      img.src = URL.createObjectURL(selectedFile)
      
      await new Promise((resolve) => {
        img.onload = () => {
          // Draw image to canvas
          const canvas = canvasRef.current!
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)

          // Convert and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `converted.${targetFormat.split('/')[1]}`
              a.click()
              URL.revokeObjectURL(url)
            }
            resolve(null)
          }, targetFormat, 0.9)
        }
      })
    } catch (error) {
      console.error('Error converting image:', error)
    }
    setIsConverting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Converter</h1>
      
      <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
        <div className="mb-6">
          <label className="block mb-2">Select image to convert:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-slate-600 rounded bg-slate-700"
          />
        </div>

        {previewUrl && (
          <div className="mb-6">
            <p className="mb-2">Preview:</p>
            <div className="relative w-full max-h-[300px] flex items-center justify-center">
              <NextImage
                src={previewUrl}
                alt="Preview"
                className="rounded object-contain"
                width={600}
                height={300}
                style={{
                  maxHeight: '300px',
                  width: 'auto',
                  height: 'auto'
                }}
                unoptimized // Since we're using a blob URL
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-2">Convert to:</label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
            className="w-full p-2 border border-slate-600 rounded bg-slate-700"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <button
          onClick={convertImage}
          disabled={!selectedFile || isConverting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConverting ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Converting...
            </>
          ) : (
            'Convert Image'
          )}
        </button>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}