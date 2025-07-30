import Link from 'next/link';
import { KeyIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 grid-animation opacity-5"></div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Logo, Links and Social */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Logo & About */}
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold text-white mr-2">CloudFriends</span>
              </div>
              <p className="text-blue-200/80 text-sm mb-6">
                Free web-based tools designed with privacy and usability in mind. No account required.
              </p>
              <div className="flex gap-3">
                <Link 
                  href="https://x.com/cloudfriendsnet"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                </Link>
                <Link 
                  href="https://github.com/cloudfriends-net"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                  </svg>
                </Link>
                <Link 
                  href="mailto:contact@cloudfriends.net"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/tools" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-5">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <KeyIcon className="h-4 w-4" />
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/license" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    License
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent mb-6"></div>
          
          {/* Bottom Section - Copyright and Made with Love */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-blue-200/70 mb-4 sm:mb-0">
              © {new Date().getFullYear()} CloudFriends.net - All rights reserved
            </p>
            <div className="flex items-center">
              <span className="text-sm text-blue-200/70 flex items-center">
                Made with <HeartIcon className="h-4 w-4 mx-1 text-pink-400" /> in Sweden
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}