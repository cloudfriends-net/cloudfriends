export default function About() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">About CloudFriends</h1>
            <p className="text-blue-400">
              Free tools that respect your privacy
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Mission Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  🎯
                </span>
                Our Mission
              </h2>
              <p className="text-slate-300 leading-relaxed">
                CloudFriends was created with a simple mission: to provide free, privacy-focused web tools 
                that anyone can use without worrying about their data being collected or misused.
              </p>
            </section>

            {/* Privacy Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  🛡️
                </span>
                Privacy First
              </h2>
              <p className="text-slate-300 leading-relaxed">
                All our tools run entirely in your browser. Your data never leaves your device, 
                ensuring complete privacy and security. We don&apos;t use trackers, and we don&apos;t store 
                any personal information.
              </p>
            </section>

            {/* Tools Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  🛠️
                </span>
                Our Tools
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  We offer a variety of tools to help you with everyday tasks:
                </p>
                <ul className="space-y-2 list-none">
                  {[
                    'Password Generator - Create strong, secure passwords',
                    'QR Code Generator - Generate QR codes for various purposes',
                    'PDF Tools - Merge, split, and compress PDF files',
                    'Image Converter - Convert images between different formats'
                  ].map((tool, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* GitHub Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                Open Source
              </h2>
              <p className="text-slate-300 leading-relaxed">
                CloudFriends is proudly open source. Explore the code, suggest features, or report issues on{' '}
                <a
                  href="https://github.com/cloudfriends-net/web-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                  aria-label="CloudFriends GitHub Repository"
                >
                  GitHub
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                . Contributions are welcome—help us make CloudFriends even better for everyone!
              </p>
            </section>

            {/* Contact Section */}
            <section className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  ✉️
                </span>
                Get in Touch
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Have suggestions for new tools or improvements? We&apos;d love to hear from you! 
                Contact us at{' '}
                <a 
                  href="mailto:contact@cloudfriends.net" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  contact@cloudfriends.net
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}