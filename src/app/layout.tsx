import type { Metadata } from "next"
import "./globals.css"
import { Footer } from "@/components/Footer"
import { SidebarNav } from "@/components/SidebarNav"
import Script from "next/script"

export const metadata: Metadata = {
  title: "CloudFriends - Free Privacy-Focused Web Tools",
  description: "Free online browser-based tools including Password Generator, QR Code Generator, PDF Tools, and Image Converter. All processing happens locally for maximum privacy.",
  keywords: ["free web tools", "password generator", "qr code generator", "pdf tools", "image converter", "privacy tools", "browser tools"],
  applicationName: "CloudFriends Web Tools",
  authors: [{ name: "CloudFriends" }],
  creator: "CloudFriends",
  publisher: "CloudFriends",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cloudfriends.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CloudFriends - Free Privacy-Focused Web Tools",
    description: "Free online browser-based tools including Password Generator, QR Code Generator, PDF Tools, and Image Converter.",
    url: "https://cloudfriends.net",
    siteName: "CloudFriends",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cloudfriends.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CloudFriends Web Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudFriends - Free Privacy-Focused Web Tools",
    description: "Free online browser-based tools that respect your privacy",
    images: ["https://cloudfriends.net/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZCDSKJ2KKJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZCDSKJ2KKJ');
</script>
        <Script
          id="schema-script"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CloudFriends Web Tools",
              "url": "https://cloudfriends.net",
              "description": "Free online browser-based tools including Password Generator, QR Code Generator, PDF Tools, and Image Converter.",
              "applicationCategory": "WebApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-950">
        <div className="flex">
          <SidebarNav />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  )
}
