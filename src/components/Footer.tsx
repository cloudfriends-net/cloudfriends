export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm">
              © {new Date().getFullYear()} CloudFriends.net - All rights reserved
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Terms of Use
            </a>
            <a
              href="/license"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              License
            </a>
            <a
              href="/contact"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}