import { KeyIcon, QrCodeIcon, ShieldCheckIcon, SparklesIcon, ArrowPathIcon, PhotoIcon, DocumentIcon, DocumentTextIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import LightThemeLayout from './components/LightThemeLayout'

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
    name: 'KaceCIR Builder (BETA)',
    description: 'Build custom inventory rules for Quest KACE.',
    href: '/tools/kace-cir',
    icon: CodeBracketIcon,
  },
  {
    name: 'Rack Planner (BETA)',
    description: 'Easily design and visualize server and network racks with drag-and-drop components.',
    href: '/tools/rack-planner',
    icon: CodeBracketIcon,
  }
]

export default function Home() {
  return (
    <LightThemeLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-30"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Animated Heading */}
            <h1 className="text-5xl font-extrabold mb-4 animate-fade-in">
              Discover Free Online Tools
            </h1>
            <p className="text-lg mb-6 animate-fade-in delay-200">
              Simplify your work and life with powerful, privacy-first tools.
            </p>

            {/* Primary Call-to-Action */}
            <div className="flex justify-center gap-4 animate-fade-in delay-400">
              <Link
                href="#tools"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition transform hover:scale-105"
              >
                Explore Tools
              </Link>
              {/* Secondary Call-to-Action */}
              <Link
                href="/about"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow border border-white hover:bg-blue-700 transition transform hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            { [
              {
                icon: ShieldCheckIcon,
                title: "Privacy First",
                description: "Your data never leaves your device. Everything runs locally in your browser.",
              },
              {
                icon: SparklesIcon,
                title: "Always Free",
                description: "No registration, no subscriptions. All tools are completely free to use.",
              },
              {
                icon: ArrowPathIcon,
                title: "Regular Updates",
                description: "We constantly add new tools and improve existing ones.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition relative group"
              >
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r from-blue-500 to-blue-700 transition"></div>
                <feature.icon className="h-10 w-10 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            )) }
          </div>
        </div>

        {/* Tools Grid */}
        <div id="tools" className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Our Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools
              .slice() // Create a shallow copy to avoid mutating the original array
              .reverse() // Reverse the order of the tools
              .map((tool, index) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition transform hover:scale-105 border border-gray-200 relative"
                >
                  {index < 3 && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  <div className="p-4">
                    <div className="mb-3 bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <tool.icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.name}</h3>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                  </div>
                </Link>
              )) }
          </div>
        </div>

        {/* About Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Tools</h2>
            <p className="text-gray-600 mb-4">
              CloudFriends.net provides essential web tools that prioritize your privacy and security. 
              Our tools are designed to be simple, efficient, and completely free to use.
            </p>
            <p className="text-gray-600">
              Whether you need to generate secure passwords or create QR codes for your business, 
              our tools help you get the job done without compromising your data.
            </p>
            <div className="mt-6 text-center">
              <Link
                href="mailto:contact@cloudfriends.net"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm mb-4">
              © {new Date().getFullYear()} CloudFriends.net. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </LightThemeLayout>
  )
}
