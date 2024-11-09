import './globals.css'
import { Inter } from 'next/font/google'
import ClientWrapper from '../components/ClientWrapper'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
  icons: {
    icon: '/favicon.ico',
  },
}

// Add this type declaration for global gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: {
        [key: string]: any;
        page_path?: string;
        resort_name?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
      }
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
        <GoogleAnalytics GA_MEASUREMENT_ID="G-SBSNN37TQJ" />
      </head>
      <body 
        className={`${inter.className} flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="pt-16 flex-grow">
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </main>
        <Footer />
      </body>
    </html>
  )
}
