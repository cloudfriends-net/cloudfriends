'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <PhotoIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Image Converter</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Options Panel */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
              
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-300 mb-4">
                    {selectedFile ? selectedFile.name : 'Drop an image here or click to select'}
                  </p>
                </label>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Convert to:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className="w-full bg-slate-900 text-gray-100 px-3 py-2 rounded"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <button
                onClick={convertImage}
                disabled={!selectedFile || isConverting}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-600"
              >
                {isConverting ? 'Converting...' : 'Convert Image'}
              </button>
            </div>

            {/* Preview Panel */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              
              <div className="bg-slate-900 rounded-lg flex items-center justify-center min-h-[300px]">
                {previewUrl ? (
                  <div className="relative w-full h-[300px]">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain rounded"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-slate-400">No image selected</p>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}