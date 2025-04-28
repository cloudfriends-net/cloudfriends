export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
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
              className="text-sm hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              Terms of Use
            </a>
            <a
              href="/licenses"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              License
            </a>
            <a
              href="/contact"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}