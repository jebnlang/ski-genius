// import Navigation from './Navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}