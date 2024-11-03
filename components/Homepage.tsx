'use client'

import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Snowflake, Users, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

interface RecentResort {
  id: string
  name: string
  location: string
  country: string
  difficulty: {
    easy: number
    intermediate: number
    advanced: number
  }
  runs: {
    easy: number
    intermediate: number
    advanced: number
  }
  ski_area: string
  number_of_lifts: number
  village_altitude: string
  ski_range: string
  nightlife: string
  highlights: string[]
  explanation: string | null
  created_at: string
}

export default function Component() {
  const router = useRouter()
  const [recentRecommendations, setRecentRecommendations] = useState<RecentResort[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from('resort_recommendations')
          .select(`
            id,
            name,
            location,
            country,
            difficulty,
            runs,
            ski_area,
            number_of_lifts,
            village_altitude,
            ski_range,
            nightlife,
            highlights,
            explanation,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          console.error('Error details:', error.message, error.details, error.hint)
          return
        }

        console.log('Fetched data:', data)
        setRecentRecommendations(data || [])
      } catch (error) {
        console.error('Caught error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentRecommendations()
  }, [])

  const handleStartNewSearch = () => {
    localStorage.removeItem('ski_questionnaire_data')
    router.push('/questionnaire')
  }

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
          <Button 
            onClick={handleStartNewSearch}
            size="lg" 
            className="text-xl px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
          >
            <span className="flex items-center">
              Start Your Search <ArrowRight className="ml-2 h-6 w-6" />
            </span>
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
          
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : recentRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentRecommendations.map((resort) => (
                <Card 
                  key={resort.id} 
                  className="overflow-hidden transition-transform duration-300 hover:scale-105 bg-white bg-opacity-40 backdrop-blur-md border border-white"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">{resort.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{resort.location}, {resort.country}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {resort.ski_area}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {resort.village_altitude}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {resort.highlights && resort.highlights.slice(0, 2).map((highlight, index) => (
                          <p key={index} className="text-sm font-medium text-blue-600">
                            {highlight}
                          </p>
                        ))}
                        <p className="text-sm text-gray-600">
                          Difficulty: {Math.round(resort.difficulty.intermediate)}% intermediate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No recommendations available yet.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              onClick={handleStartNewSearch}
              size="lg" 
              className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-200 ease-in-out shadow-md"
            >
              Find Your Perfect Resort
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}