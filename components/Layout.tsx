import Footer from '@/components/Footer'
import Head from 'next/head'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>SkiGenius | Your Personal Ski Resort Advisor</title>
        <meta name="description" content="Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you're a first-timer or a seasoned skier. Explore, compare, and book all in one place!" />
        <meta property="og:title" content="SkiGenius" />
        <meta property="og:description" content="Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you're a first-timer or a seasoned skier. Explore, compare, and book all in one place!" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SkiGenius" />
        <meta name="twitter:description" content="Discover your perfect ski getaway with our AI-powered platform. Tailored recommendations, expert insights, and seamless booking make planning your ski holiday effortless—whether you're a first-timer or a seasoned skier. Explore, compare, and book all in one place!" />
        <meta name="twitter:image" content="/logo.png" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto py-6">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}