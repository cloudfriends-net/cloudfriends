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
      const img = new window.Image()
      img.src = URL.createObjectURL(selectedFile)

      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = canvasRef.current!
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)

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
    <div className="min-h-screen bg-gray-100 text-gray-900" style={{ paddingTop: '5.5rem' }}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <PhotoIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Image Converter</h1>
          </div>

          {/* How to use */}
          <div className="mb-8 bg-blue-100 border border-blue-300 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">How to use</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Click the upload area or drag and drop an image file (JPG, PNG, WebP, etc.).</li>
              <li>Select your desired output format (JPG, PNG, or WebP).</li>
              <li>Preview your image before converting.</li>
              <li>Click <span className="font-semibold text-blue-600">Convert Image</span> to download the converted file.</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Options Panel */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow">
              <h2 className="text-xl font-semibold mb-4">Upload Image</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {selectedFile ? selectedFile.name : 'Drop an image here or click to select'}
                  </p>
                </label>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Convert to:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className="w-full bg-gray-200 text-gray-900 px-3 py-2 rounded border border-gray-300"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <button
                onClick={convertImage}
                disabled={!selectedFile || isConverting}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              >
                {isConverting ? 'Converting...' : 'Convert Image'}
              </button>
            </div>

            {/* Preview Panel */}
            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>

              <div className="bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
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
                  <p className="text-gray-600">No image selected</p>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* How does it work */}
          <div className="mt-10 mb-8 bg-blue-100 border border-blue-300 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">How does it work?</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>
                <span className="font-semibold">Privacy:</span> All image processing happens <span className="text-blue-600">locally in your browser</span>. Your images are never uploaded to any server.
              </li>
              <li>
                <span className="font-semibold">Conversion:</span> The tool uses the HTML5 Canvas API to decode your image and re-encode it in the selected format. No quality loss occurs when converting between lossless formats (PNG, WebP), but converting to JPG may introduce compression.
              </li>
              <li>
                <span className="font-semibold">Supported formats:</span> Most common image types are supported for input and output.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
