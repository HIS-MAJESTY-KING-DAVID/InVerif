import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InVerif',
  description: 'Document verification and validation system',
  generator: 'InVerif',
}

// This is required for GitHub Pages
const basePath = process.env.NODE_ENV === 'production' ? '/InVerif' : '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <base href={basePath} />
      </head>
      <body>{children}</body>
    </html>
  )
}
