export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 -z-10 opacity-10 bg-blue-600 rounded-3xl blur-3xl transform -translate-y-1/4"></div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About CloudFriends</h1>
            <p className="text-blue-600 text-lg max-w-2xl mx-auto">
              Free tools that respect your privacy and put your security first
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Mission Section */}
            <section className="bg-white rounded-xl p-8 shadow-md border border-gray-200 transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  🎯
                </span>
                Our Mission
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                CloudFriends was created with a simple mission: to provide free, privacy-focused web tools 
                that anyone can use without worrying about their data being collected or misused. We believe essential 
                tools should be accessible to everyone, regardless of technical skill or budget.
              </p>
            </section>

            {/* Privacy Section */}
            <section className="bg-white rounded-xl p-8 shadow-md border border-gray-200 transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  🛡️
                </span>
                Privacy First
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="text-lg mb-3">
                  All our tools run entirely in your browser. Your data never leaves your device, 
                  ensuring complete privacy and security.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3 mt-4 mb-4">
                  <span className="text-blue-600 mt-1">ℹ️</span>
                  <p>We don&rsquo;t use trackers, cookies, or store any personal information. Your privacy isn&rsquo;t just a feature—it&rsquo;s our foundation.</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                    <span>We use Google Analytics for basic analytics to understand how our tools are being used and to improve your experience. This data is anonymized and used solely for improving our services.</span>
                  </p>
                </div>
              </div>
            </section>

            {/* GitHub Section */}
            <section className="bg-white rounded-xl p-8 shadow-md border border-gray-200 transition-all hover:shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                Open Source
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="text-lg mb-3">
                  CloudFriends is proudly open source. Explore the code, suggest features, or report issues on GitHub.
                  Contributions are welcome—help us make CloudFriends even better for everyone!
                </p>
                <a
                  href="https://github.com/cloudfriends-net/cloudfriends"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mt-3 transition-colors"
                  aria-label="CloudFriends GitHub Repository"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200 shadow-inner">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  ✉️
                </span>
                Get in Touch
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Have suggestions for new tools or improvements? We&apos;d love to hear from you! 
                Contact us at{' '}
                <a 
                  href="mailto:contact@cloudfriends.net" 
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors underline"
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
