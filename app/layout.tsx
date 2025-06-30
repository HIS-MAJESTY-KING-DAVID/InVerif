import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'InVerif',
  description: 'Document verification and validation system',
  generator: 'InVerif',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
