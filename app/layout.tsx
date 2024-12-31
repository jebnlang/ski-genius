import './globals.css'
import { GeistSans } from 'geist/font/sans'
import ClientWrapper from '../components/ClientWrapper'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import Hotjar from '@/components/Hotjar'

export const metadata = {
  title: 'SkiGenius',
  description: 'Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you\'re a first-timer or a seasoned skier. Explore, compare, and book all in one place!',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SkiGenius',
    description: 'Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you\'re a first-timer or a seasoned skier. Explore, compare, and book all in one place!',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'SkiGenius Logo',
      },
    ],
    type: 'website',
    locale: 'en_US',
    siteName: 'SkiGenius',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkiGenius',
    description: 'Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you\'re a first-timer or a seasoned skier. Explore, compare, and book all in one place!',
    images: ['/android-chrome-512x512.png'],
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
