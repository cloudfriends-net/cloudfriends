export default function TermsOfUse() {
  return (
    <main
      className="min-h-screen bg-gray-100"
      style={{ paddingTop: '5.5rem' }} // Adjust this value to match your header height
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
            <p className="text-blue-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Acceptance Section */}
            <section className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  §
                </span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using CloudFriends.net, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            {/* License Section */}
            <section className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  ⚖️
                </span>
                Use License
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The source code for this project is licensed under the{' '}
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 transition-colors"
                >
                  MIT License
                </a>
                . You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software,
                provided that the original copyright notice and this permission notice are included in all copies or substantial portions of the software.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                For inquiries or additional permissions, please contact: <a href="mailto:contact@cloudfriends.net" className="text-blue-600 hover:text-blue-500 transition-colors">contact@cloudfriends.net</a>
              </p>
            </section>

            {/* Limitations Section */}
            <section className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  ⚠️
                </span>
                Limitations
              </h2>
              <ul className="text-gray-700 space-y-3 list-none">
                {[
                  'The tools are provided "as is" without any warranties',
                  'We are not responsible for any data loss or damage',
                  'We reserve the right to modify or discontinue any service without notice'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Fair Usage Section */}
            <section className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  ⚡
                </span>
                Fair Usage
              </h2>
              <p className="text-gray-700 leading-relaxed">
                While our tools are free to use, we expect fair usage. Automated or excessive use that
                impacts service availability for others is not permitted.
              </p>
            </section>

            {/* Contact Section */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  📧
                </span>
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these terms, please contact us at{' '}
                <a href="mailto:contact@cloudfriends.net" className="text-blue-600 hover:text-blue-500 transition-colors">
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