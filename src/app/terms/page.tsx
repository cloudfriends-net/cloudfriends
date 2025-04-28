export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Use</h1>
            <p className="text-blue-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Acceptance Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  §
                </span>
                Acceptance of Terms
              </h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using CloudFriends.net, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>

            {/* License Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  ⚖️
                </span>
                Use License
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Our tools are provided under the MIT license. You are free to use them for personal 
                or commercial purposes without any warranty.
              </p>
            </section>

            {/* Limitations Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  ⚠️
                </span>
                Limitations
              </h2>
              <ul className="text-slate-300 space-y-3 list-none">
                {[
                  'The tools are provided "as is" without any warranties',
                  'We are not responsible for any data loss or damage',
                  'We reserve the right to modify or discontinue any service without notice'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Fair Usage Section */}
            <section className="bg-slate-800/50 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  ⚡
                </span>
                Fair Usage
              </h2>
              <p className="text-slate-300 leading-relaxed">
                While our tools are free to use, we expect fair usage. Automated or excessive use that 
                impacts service availability for others is not permitted.
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
                If you have any questions about these terms, please contact us at{' '}
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