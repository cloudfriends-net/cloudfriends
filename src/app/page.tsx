import { KeyIcon, QrCodeIcon, ShieldCheckIcon, SparklesIcon, ArrowPathIcon, PhotoIcon, DocumentIcon, DocumentTextIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const tools = [
  {
    name: 'Password Generator',
    description: 'Create secure, random passwords with customizable options for length and character types.',
    href: '/tools/password-generator',
    icon: KeyIcon,
  },
  {
    name: 'QR Code Generator',
    description: 'Create QR codes for URLs, text, WiFi credentials, or contact information instantly.',
    href: '/tools/qr-generator',
    icon: QrCodeIcon,
  },
  {
    name: 'Image Converter',
    description: 'Convert images between different formats easily.',
    href: '/tools/image-converter',
    icon: PhotoIcon,
  },
  {
    name: 'PDF Tools',
    description: 'Merge, split, and compress PDF files securely in your browser without uploading files.',
    href: '/tools/pdf-tools',
    icon: DocumentIcon,
  },
  {
    name: 'Text Tools',
    description: 'Transform, clean, and analyze text with various operations like case conversion, sorting, and removing duplicates.',
    href: '/tools/text-tools',
    icon: DocumentTextIcon,
  },
  {
    name: 'Regex Tester & Creator',
    description: 'Test and create regular expressions. Find, match, and replace patterns in your text with instant feedback.',
    href: '/tools/regex-tools',
    icon: CodeBracketIcon,
  },
  {
    name: 'Subnet Calculator',
    description: 'Calculate IPv4 subnets, masks, ranges, and more. Great for network planning and troubleshooting.',
    href: '/tools/subnet-calculator',
    icon: CodeBracketIcon,
  },
  {
    name: 'Docker Compose Generator',
    description: 'Generate Docker Compose files with a simple UI.',
    href: '/tools/docker-compose',
    icon: CodeBracketIcon,
  },
  {
    name: 'KaceCIR Builder',
    description: 'Build custom inventory rules for Quest KACE.',
    href: '/tools/kace-cir',
    icon: CodeBracketIcon,
  },
];

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-700">
              <div className="p-4">
                <div className="mb-2 bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
                <p className="text-slate-300 text-xs">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
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
              Have a suggestion for a new tool? Contact us at contact@cloudfriends.net
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
