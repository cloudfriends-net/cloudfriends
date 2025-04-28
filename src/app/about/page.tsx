import { ShieldCheckIcon, SparklesIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          About CloudFriends
        </h1>

        <div className="bg-slate-800 p-8 rounded-lg shadow-md border border-slate-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-300 mb-6">
            At CloudFriends, we believe that essential web tools should be accessible to everyone, 
            without compromising privacy or requiring costly subscriptions. Our mission is to provide 
            high-quality, browser-based tools that respect your data and privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Privacy Commitment</h3>
            <p className="text-gray-300">
              Your data stays in your browser. We don&apos;t track, store, or analyze any of your information.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <SparklesIcon className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Free Forever</h3>
            <p className="text-gray-300">
              We&apos;re committed to keeping our tools free and accessible to everyone, without any hidden costs.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <GlobeAltIcon className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Open Source</h3>
            <p className="text-gray-300">
              Our tools are open source, allowing transparency and community contributions.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg shadow-md border border-slate-700">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-4">
            We&apos;re always looking to improve our tools and add new features. If you have any suggestions,
            feedback, or questions, please don&apos;t hesitate to reach out.
          </p>
          <div className="text-gray-300">
            <p>Email: support@cloudfriends.net</p>
            <p>GitHub: github.com/cloudfriends-net/web-tools</p>
          </div>
        </div>
      </div>
    </main>
  )
}