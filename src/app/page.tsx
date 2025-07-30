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
        {/* Hero Section - Interactive 3D Design */}
        <div className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-24 overflow-hidden perspective-1000">
          {/* Interactive Background */}
          <div className="absolute inset-0">
            {/* Dynamic Grid Pattern */}
            <div className="absolute inset-0 grid-animation opacity-10"></div>
            
            {/* Floating Tool Icons */}
            <div className="hidden md:block">
              {tools.slice(0, 8).map((tool, index) => (
                <div 
                  key={index}
                  className="absolute tool-icon-float"
                  style={{ 
                    top: `${15 + Math.random() * 70}%`, 
                    left: `${10 + Math.random() * 80}%`,
                    zIndex: Math.floor(Math.random() * 10),
                    animationDelay: `${index * 0.7}s`,
                    transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${Math.random() * 20 - 10}deg)`
                  }}
                >
                  <div className="tool-icon-container p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-glow">
                    <tool.icon className="h-8 w-8 text-blue-200/70" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* 3D Perspective Elements */}
            <div className="absolute inset-0 transform-3d pointer-events-none">
              {/* Depth Planes */}
              <div className="absolute plane-animation-1 w-full h-1/3 top-1/3 border-t border-b border-white/5"></div>
              <div className="absolute plane-animation-2 w-1/3 h-full left-1/3 border-l border-r border-white/5"></div>
              
              {/* 3D Cubes */}
              <div className="absolute cube hidden lg:block" style={{ top: '20%', left: '10%' }}>
                <div className="cube-face cube-face-front"></div>
                <div className="cube-face cube-face-back"></div>
                <div className="cube-face cube-face-right"></div>
                <div className="cube-face cube-face-left"></div>
                <div className="cube-face cube-face-top"></div>
                <div className="cube-face cube-face-bottom"></div>
              </div>
              
              <div className="absolute cube hidden lg:block" style={{ top: '70%', left: '80%' }}>
                <div className="cube-face cube-face-front"></div>
                <div className="cube-face cube-face-back"></div>
                <div className="cube-face cube-face-right"></div>
                <div className="cube-face cube-face-left"></div>
                <div className="cube-face cube-face-top"></div>
                <div className="cube-face cube-face-bottom"></div>
              </div>
            </div>
            
            {/* Light Effects */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-500/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full radial-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full radial-pulse-delayed"></div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block animated-badge-container">
                  <span className="animated-badge px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-400/20 to-indigo-400/20 backdrop-blur-sm border border-white/20 mb-5">
                    Free Web Tools • No Sign-up • Privacy-First
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-7xl font-extrabold leading-tight text-glow split-text">
                  <span className="block mb-2">Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">Web Tools</span></span>
                  <span className="block text-3xl md:text-5xl text-blue-200">For Everyone</span>
                </h1>
                
                <p className="text-lg md:text-xl mt-6 mb-10 text-blue-100/80 max-w-xl mx-auto fade-in-up">
                  Simplify your workflow with our collection of free, browser-based tools 
                  that respect your privacy and enhance your productivity.
                </p>

                {/* Interactive CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 button-container">
                  <Link
                    href="#tools"
                    className="primary-button px-10 py-4 rounded-lg font-medium shadow-glow group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Explore Tools
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/about"
                    className="secondary-button px-10 py-4 rounded-lg font-medium group"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              
              {/* Tool Counter with 3D Cards */}
              <div className="mt-16 flex justify-center gap-8 counter-cards">
                {[
                  { value: tools.length, label: "Tools Available", icon: "🛠️" },
                  { value: "100%", label: "Free Forever", icon: "✨" },
                  { value: "0", label: "Data Collected", icon: "🔒" }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    className="counter-card"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="counter-card-inner">
                      <div className="counter-card-front">
                        <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-blue-200 text-sm">{stat.label}</div>
                      </div>
                      <div className="counter-card-back">
                        <div className="text-5xl">{stat.icon}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Advanced Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
              <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g className="moving-waves">
                <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(249, 250, 251, 0.4)" />
                <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(249, 250, 251, 0.3)" />
                <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(249, 250, 251, 0.1)" />
                <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(249, 250, 251, 0.7)" />
              </g>
              <rect x="0" y="27" width="100%" height="1" fill="#F9FAFB" />
            </svg>
          </div>
        </div>

        {/* Feature Highlights with Animated Cards */}
        <div className="container mx-auto px-4 py-16 relative">
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-500 filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-indigo-500 filter blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 fade-in-up-scroll">Why Choose Our Tools?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: "Privacy First",
                  description: "Your data never leaves your device. All processing happens locally in your browser for maximum privacy.",
                  color: "from-blue-500 to-blue-600",
                  animation: "0s"
                },
                {
                  icon: SparklesIcon,
                  title: "Always Free",
                  description: "No registration, no subscriptions, no hidden fees. All tools are completely free to use forever.",
                  color: "from-indigo-500 to-indigo-600",
                  animation: "0.2s"
                },
                {
                  icon: ArrowPathIcon,
                  title: "Regular Updates",
                  description: "We constantly add new tools and improve existing ones based on user feedback and needs.",
                  color: "from-purple-500 to-purple-600",
                  animation: "0.4s"
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card bg-white rounded-xl p-6 border border-gray-100 hover:border-transparent shadow-sm hover:shadow-xl transition-all duration-300 relative group"
                  style={{ animationDelay: feature.animation }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" 
                      style={{ opacity: 0.03 }}></div>
                  
                  <div className="relative z-10">
                    <div className={`h-14 w-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid with Enhanced Design */}
        <div id="tools" className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-40 bg-gradient-to-b from-blue-50/50 to-transparent top-0"></div>
            <div className="absolute left-0 top-1/4 w-32 h-32 border border-blue-200/30 rounded-full transform rotate-45 opacity-20"></div>
            <div className="absolute right-0 bottom-1/4 w-40 h-40 border border-indigo-200/30 rounded-full transform -rotate-45 opacity-20"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full inline-block mb-3">Explore Our Tools</span>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Tools at Your Fingertips</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  All tools are browser-based, require no installation, and respect your privacy.
                  Select a tool to get started.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...tools].reverse().map((tool, index) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="tool-card group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 relative flex flex-col h-full transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Tool Icon */}
                    <div className="relative p-6">
                      <div className="mb-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <tool.icon className="h-7 w-7 text-blue-600" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{tool.name}</h3>
                      <p className="text-gray-600 text-sm flex-grow">{tool.description}</p>
                    </div>
                    
                    <div className="mt-auto border-t border-gray-100 group-hover:border-blue-50 transition-colors p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Free</span>
                        <span className="text-blue-600 flex items-center text-sm font-medium">
                          Use Tool
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    
                    {/* New Badge - now appears on the last 3 items after reversing */}
                    {index < 3 && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          New
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About Section with Interactive Elements */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100/50 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="md:w-2/3">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">About CloudFriends.net</h2>
                    <p className="text-gray-700 mb-4">
                      CloudFriends.net provides essential web tools that prioritize your privacy and security.
                      Our tools are designed to be simple, efficient, and completely free to use.
                    </p>
                    <p className="text-gray-700 mb-6">
                      Whether you need to generate secure passwords, create QR codes, or convert images,
                      our tools help you get the job done without compromising your data.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="mailto:contact@cloudfriends.net"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                      >
                        <span>Contact Us</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </Link>
                      <Link
                        href="/about"
                        className="bg-white text-blue-700 border border-blue-200 px-6 py-3 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3 flex justify-center items-center">
                    <div className="stats-container p-6 bg-white rounded-xl shadow-lg border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">User Satisfaction</h3>
                      
                      <div className="flex flex-col gap-4">
                        {[
                          { label: "Monthly Users", value: "75+", icon: "👥" },
                          { label: "Data Collected", value: "Zero", icon: "🔒" }
                        ].map((stat, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="text-2xl">{stat.icon}</div>
                            <div>
                              <div className="text-sm text-gray-500">{stat.label}</div>
                              <div className="font-bold text-gray-900">{stat.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </LightThemeLayout>
  )
}
