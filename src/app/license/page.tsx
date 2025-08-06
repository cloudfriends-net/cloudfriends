import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ThemeAwareLayout from '../../components/ThemeAwareLayout'

export default function Licenses() {
  return (
    <ThemeAwareLayout>
      <main
        className="min-h-screen bg-gray-100"
        style={{ paddingTop: '5.5rem' }}
      >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-8"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold mb-8 text-gray-900">Licenses</h1>
          
          <div className="space-y-8">
            {/* CloudFriends License Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">CloudFriends.net License</h2>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <p className="text-gray-700 mb-4">
                  MIT License
                  <br />
                  <br />
                  Copyright (c) 2025 CloudFriends.net
                  <br />
                  <br />
                  Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the &quot;Software&quot;), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:
                  <br />
                  <br />
                  The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.
                </p>
                <p className="text-gray-600">
                  For questions about the license, please contact: <a href="mailto:contact@cloudfriends.net" className="text-blue-600 hover:text-blue-500">contact@cloudfriends.net</a>
                </p>
              </div>
            </section>

            {/* Third-Party Licenses Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Third-Party Licenses</h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'Heroicons',
                    url: 'https://github.com/tailwindlabs/heroicons',
                    license: 'MIT License'
                  },
                  {
                    name: 'qrcode.react',
                    url: 'https://github.com/zpao/qrcode.react',
                    license: 'ISC License'
                  },
                  {
                    name: 'Tailwind CSS',
                    url: 'https://tailwindcss.com',
                    license: 'MIT License'
                  },
                  {
                    name: 'Next.js',
                    url: 'https://nextjs.org',
                    license: 'MIT License'
                  }
                ].map(({ name, url, license }) => (
                  <div key={name} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900">{name}</h3>
                    <p className="text-gray-700 mb-2">License: {license}</p>
                    <a 
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      View Source
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
    </ThemeAwareLayout>
  )
}