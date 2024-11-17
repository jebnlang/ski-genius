'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Snowflake, Users, MapPin, Calendar } from 'lucide-react'
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
  daily_pass_price: number
  six_day_pass_price: number
}

interface AvailableResort {
  resort_name: string
  country: string
}

export default function Component() {
  const router = useRouter()
  const [recentRecommendations, setRecentRecommendations] = useState<RecentResort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [availableResorts, setAvailableResorts] = useState<AvailableResort[]>([])
  const [isLoadingResorts, setIsLoadingResorts] = useState(true)
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({})

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
            created_at,
            daily_pass_price,
            six_day_pass_price
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

  useEffect(() => {
    const fetchAvailableResorts = async () => {
      try {
        const { data, error } = await supabase
          .from('ski_resorts_validation_list')
          .select('resort_name, country')
          .order('country')

        if (error) {
          console.error('Error fetching resorts:', error)
          return
        }

        setAvailableResorts(data || [])
      } catch (error) {
        console.error('Caught error:', error)
      } finally {
        setIsLoadingResorts(false)
      }
    }

    fetchAvailableResorts()
  }, [])

  const handleStartNewSearch = () => {
    localStorage.removeItem('ski_questionnaire_data')
    localStorage.removeItem('ski_resort_results')
    router.push('/questionnaire')
  }

  const groupResortsByCountry = (resorts: AvailableResort[]) => {
    return resorts.reduce((acc, resort) => {
      if (!acc[resort.country]) {
        acc[resort.country] = []
      }
      acc[resort.country].push(resort.resort_name)
      return acc
    }, {} as Record<string, string[]>)
  }

  const toggleCountryExpansion = (country: string) => {
    setExpandedCountries(prev => ({
      ...prev,
      [country]: !prev[country]
    }))
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                title: 'Share Your Preferences', 
                description: 'Tell us about your ideal ski trip experience and requirements', 
                icon: Users 
              },
              { 
                title: 'AI Analysis', 
                description: 'Our AI matches you with perfect resorts based on your criteria', 
                icon: Snowflake 
              },
              { 
                title: 'Get Matched', 
                description: 'Review personalized resort recommendations with detailed insights', 
                icon: MapPin 
              },
              { 
                title: 'Book Your Trip', 
                description: 'Connect with top ski tour operators for the best holiday packages', 
                icon: Calendar 
              },
            ].map((step, index) => (
              <div key={index} className="text-center flex flex-col items-center relative">
                {/* Connection line between steps */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 h-0.5 bg-blue-200" />
                )}
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6">
                  {<step.icon className="w-10 h-10" />}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Recommendations Section */}
      <section 
        id="recent-recommendations" 
        className="py-24 px-4 bg-white bg-opacity-40 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Recent Recommendations
          </h2>
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : recentRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentRecommendations.map((resort) => (
                <Card 
                  key={resort.id}
                  className="bg-white bg-opacity-90 backdrop-blur-md border-white shadow-md 
                    transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{resort.name}</h3>
                    <p className="text-gray-600 mb-4">{resort.location}, {resort.country}</p>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Daily Pass:</span>
                        <span className="font-semibold">{resort.daily_pass_price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">6-Day Pass:</span>
                        <span className="font-semibold">{resort.six_day_pass_price}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <ul className="space-y-2">
                          {resort.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="mr-2 text-blue-500">•</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No recommendations available yet.</p>
          )}
        </div>
      </section>

      {/* Top Resorts Section */}
      <section 
        id="top-resorts" 
        className="py-24 px-4 bg-gradient-to-b from-gray-100 to-blue-100 relative"
      >
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Europe and North America's Top Ski Resorts
          </h2>
          
          {isLoadingResorts ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupResortsByCountry(availableResorts)).map(([country, resorts]) => {
                const isExpanded = expandedCountries[country] || false;
                const visibleResorts = isExpanded ? resorts : resorts.slice(0, 3);
                const remainingCount = resorts.length - 3;

                return (
                  <Card key={country} className="bg-white bg-opacity-90 backdrop-blur-md border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-bold mb-2 text-blue-600 border-b border-blue-100 pb-1">
                        {country}
                      </h3>
                      <ul className="space-y-1">
                        {visibleResorts.map((resort) => (
                          <li 
                            key={resort}
                            onClick={() => {
                              router.push(`/results?resort=${encodeURIComponent(resort)}`);
                            }}
                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:bg-blue-50 px-2 py-1 rounded-md"
                          >
                            {resort}
                          </li>
                        ))}
                      </ul>
                      {resorts.length > 3 && (
                        <button
                          onClick={() => toggleCountryExpansion(country)}
                          className="text-xs text-gray-500 hover:text-blue-600 mt-2 cursor-pointer"
                        >
                          {isExpanded ? 'Show less' : `Show ${remainingCount} more`}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}