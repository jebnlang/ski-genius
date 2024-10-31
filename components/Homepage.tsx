import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Snowflake, Users, MapPin } from 'lucide-react'

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-800">
            Discover Your Perfect <span className="text-blue-600">Ski Resort</span> in Minutes
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-600">
            AI-powered recommendations tailored to your experience and preferences
          </p>
          <Button asChild size="lg" className="text-xl px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700">
            <Link href="/questionnaire" className="flex items-center">
              Start Your Search <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white bg-opacity-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Share Your Preferences', description: 'Tell us about your ideal ski trip', icon: Users },
              { title: 'AI Analysis', description: 'Our AI processes your unique needs', icon: Snowflake },
              { title: 'Get Matched', description: 'Receive personalized resort recommendations', icon: MapPin },
            ].map((step, index) => (
              <div key={index} className="text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6">
                  {<step.icon className="w-10 h-10" />}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Recommendations Showcase */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-100 to-blue-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">Recent Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Alpine Paradise', country: 'Switzerland', difficulty: 'Intermediate', highlight: 'Perfect for families' },
              { name: 'Snowy Peaks', country: 'France', difficulty: 'Advanced', highlight: 'Excellent off-piste' },
              { name: 'Cozy Valley', country: 'Austria', difficulty: 'Beginner', highlight: 'Great ski school' },
            ].map((resort, index) => (
              <Card key={index} className="overflow-hidden transition-transform duration-300 hover:scale-105 bg-white bg-opacity-40 backdrop-blur-md border border-white">
                <CardContent className="p-0">
                  <Image
                    src="/placeholder.svg?height=300&width=500"
                    alt={resort.name}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">{resort.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{resort.country}</p>
                    <p className="text-sm mb-3 text-gray-700">Difficulty: {resort.difficulty}</p>
                    <p className="text-sm font-medium text-blue-600">{resort.highlight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-200 ease-in-out shadow-md">
              <Link href="/questionnaire">Find Your Perfect Resort</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}