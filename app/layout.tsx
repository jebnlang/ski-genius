import './globals.css'
import { Inter } from 'next/font/google'
import ClientWrapper from '../components/ClientWrapper'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ski Genius',
  description: 'Find your perfect ski resort with AI-powered recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
