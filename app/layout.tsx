import './globals.css'
import { Inter } from 'next/font/google'
import ClientWrapper from '../components/ClientWrapper'
import Navbar from '@/components/Navbar'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ski Genius',
  description: 'Find your perfect ski resort with AI-powered recommendations',
}

// Add this type declaration for global gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: Record<string, unknown>
    ) => void
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Add Google Analytics component */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-SBSNN37TQJ" />
      </head>
      <body 
        className={inter.className} 
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="pt-16">
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </main>
      </body>
    </html>
  )
}
