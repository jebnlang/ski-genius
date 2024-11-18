import './globals.css'
import { GeistSans } from 'geist/font/sans'
import ClientWrapper from '../components/ClientWrapper'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import Hotjar from '@/components/Hotjar'

export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
  icons: {
    icon: '/favicon.ico',
  },
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
        <Hotjar siteId={5203689} hotjarVersion={6} />
      </head>
      <body 
        className={`${GeistSans.className} flex flex-col min-h-screen`}
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
