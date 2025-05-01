import { KeyIcon, QrCodeIcon, ShieldCheckIcon, SparklesIcon, ArrowPathIcon, PhotoIcon, DocumentIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Free Online Tools
        </h1>

        <div className="max-w-4xl mx-auto mb-8 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg text-center">
          <p className="text-blue-400 text-lg">
            🔒 All tools run entirely in your browser. No data is stored on our servers.
          </p>
        </div>
        
        {/* Feature Highlights */}
        <div className="max-w-7xl mx-auto mb-12 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-lg p-6 text-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-2 text-white">Privacy First</h3>
            <p className="text-slate-300 text-sm">
              Your data never leaves your device. Everything runs locally in your browser.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 text-center">
            <SparklesIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-2 text-white">Always Free</h3>
            <p className="text-slate-300 text-sm">
              No registration, no subscriptions. All tools are completely free to use.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-6 text-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-2 text-white">Regular Updates</h3>
            <p className="text-slate-300 text-sm">
              We constantly add new tools and improve existing ones.
            </p>
          </div>
        </div>
        
        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Password Generator Card */}
          <Link href="/tools/password-generator" className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <KeyIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Password Generator</h3>
              <p className="text-slate-300 text-sm">
                Create secure, random passwords with customizable options for length and character types.
              </p>
            </div>
          </Link>

          {/* QR Code Generator Card */}
          <Link href="/tools/qr-generator" className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">QR Code Generator</h3>
              <p className="text-slate-300 text-sm">
                Create QR codes for URLs, text, WiFi credentials, or contact information instantly.
              </p>
            </div>
          </Link>

          {/* Image Converter Card */}
          <Link href="/tools/image-converter" className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <PhotoIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Image Converter</h3>
              <p className="text-slate-300 text-sm">
                Convert images between different formats easily with preview functionality.
              </p>
            </div>
          </Link>

          {/* PDF Tools Card */}
          <Link href="/tools/pdf-tools" className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <DocumentIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">PDF Tools</h3>
              <p className="text-slate-300 text-sm">
                Merge, split, and compress PDF files securely in your browser without uploading files.
              </p>
            </div>
          </Link>

          {/* Text Tools Card */}
          <Link href="/tools/text-tools" className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
            <div className="p-6">
              <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Text Tools</h3>
              <p className="text-slate-300 text-sm">
                Transform, clean, and analyze text with various operations like case conversion, sorting, and removing duplicates.
              </p>
            </div>
          </Link>
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">About Our Tools</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              CloudFriends.net provides essential web tools that prioritize your privacy and security. 
              Our tools are designed to be simple, efficient, and completely free to use.
            </p>
            <p>
              Whether you need to generate secure passwords or create QR codes for your business, 
              our tools help you get the job done without compromising your data.
            </p>
            <p className="text-sm text-slate-400">
              Have a suggestion for a new tool? Contact us at support@cloudfriends.net
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
