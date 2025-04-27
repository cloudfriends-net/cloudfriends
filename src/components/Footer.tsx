import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-12 text-center text-gray-400 border-t border-slate-800 pt-8 pb-8">
      <p className="mb-4">© {new Date().getFullYear()} CloudFriends.net</p>
      <p className="text-sm">
        <Link href="/licenses" className="hover:text-gray-300">
          Licenses
        </Link>
      </p>
    </footer>
  )
}