export default function PrivacyPolicy() {
  return (
    <main
      className="min-h-screen bg-gray-950"
      style={{ paddingTop: '5.5rem' }} // Adjust this value to match your header height
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-blue-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Data Collection Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  🛡️
                </span>
                Data Collection
              </h2>
              <p className="text-slate-300 leading-relaxed">
                CloudFriends.net is committed to protecting your privacy. Our tools operate entirely in your browser, 
                and we do not collect, store, or process any of your data.
              </p>
            </section>

            {/* Browser Storage Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  💾
                </span>
                Browser Storage
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Some of our tools may use local browser storage (localStorage) to save your preferences. 
                This data never leaves your device and is not accessible to us.
              </p>
            </section>

            {/* Analytics Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  📊
                </span>
                Analytics
              </h2>
              <ul className="text-slate-300 space-y-3 list-none">
                {[
                  'We use privacy-focused analytics to understand tool usage',
                  'All data is anonymized and contains no personal information',
                  'You can opt-out of analytics at any time'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Third-Party Services Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  🔒
                </span>
                Third-Party Services
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Our website does not integrate with any third-party services that collect user data. 
                We prioritize your privacy and data security above all else.
              </p>
            </section>

            {/* Contact Section */}
            <section className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  📧
                </span>
                Contact Us
              </h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about our privacy policy, please contact us at{' '}
                <a href="mailto:contact@cloudfriends.net" className="text-blue-400 hover:text-blue-300 transition-colors">
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