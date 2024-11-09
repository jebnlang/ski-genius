import Footer from '@/components/Footer'
import Head from 'next/head'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>SkiGenius | Your Personal Ski Equipment Advisor</title>
        <meta name="description" content="Get personalized ski equipment recommendations based on your experience and preferences" />
        // ... rest of the head content
      </Head>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto py-6">
          {children /* some comment */}
        </main>
        <Footer />
      </div>
    </>
  )
}