import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './studio.css'

export const metadata: Metadata = {
  title: 'CSA Prep Studio — Amazon Customer Service Preparation',
  description: 'Practice customer judgment, work style, behavioral interviews, JAM speaking, recorded fluency, grammar, and customer-service scenarios with local rubrics and optional Groq AI coaching.',
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f4f6fa' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body >{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body>
    </html>
  )
}
