'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Snowflake, Users, MapPin, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { withClickTracking } from '@/components/withClickTracking';
import { trackEnhancedEvent } from '@/utils/enhanced-analytics';

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

function Homepage() {
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
    trackEnhancedEvent('start_search', 'Navigation', {
      label: 'New Search',
      interaction_type: 'button_click'
    });
    localStorage.removeItem('ski_questionnaire_data')
    localStorage.removeItem('ski_resort_results')
    router.push('/questionnaire')
  }

  const handleResortCardClick = (resort: RecentResort | string) => {
    // If resort is a string, create a minimal RecentResort object
    const resortData = typeof resort === 'string' 
      ? {
          name: resort,
          country: '', // You might want to look up the country from availableResorts
          daily_pass_price: 0
        } as RecentResort
      : resort;

    trackEnhancedEvent('view_resort', 'Resort Interaction', {
      label: resortData.name,
      element_type: 'card',
      value: resortData.daily_pass_price
    });

    // Clear previous questionnaire data
    localStorage.removeItem('ski_questionnaire_data');
    localStorage.removeItem('ski_resort_results');
    
    // Find country if resort is a string
    let country = resortData.country;
    if (typeof resort === 'string') {
      const foundResort = availableResorts.find(r => r.resort_name === resort);
      country = foundResort?.country || '';
    }
    
    // Set new questionnaire data
    const storageData = {
      answers: {
        groupType: '',
        childrenAges: [],
        sportType: '',
        countries: [country],
        skiingLevels: [],
        snowPark: '',
        offPiste: '',
        pricingSensitivity: 'Flexible',
        lessons: '',
        nightlife: '',
        skiInSkiOut: '',
        resortPreferences: [],
        otherActivities: [],
        travelTime: '',
        travelMonth: [],
        additionalInfo: `Show me information about ${resortData.name}`
      },
      lastUpdated: new Date().toISOString(),
      currentStep: 12
    };
    localStorage.setItem('ski_questionnaire_data', JSON.stringify(storageData));
    
    // Navigate to results page
    router.push('/results');
  };

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
      <section className="py-24 px-4 bg-white/80 backdrop-blur-md relative border-y border-blue-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>
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
        className="py-24 px-4 bg-white relative"
      >
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
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
                  onClick={() => handleResortCardClick(resort)}
                  className="bg-white bg-opacity-90 backdrop-blur-md border-white shadow-md 
                    transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer h-full"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{resort.name}</h3>
                      <p className="text-gray-600 mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {resort.location}, {resort.country}
                      </p>

                      {/* Resort Statistics Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-600 mb-1">Total Runs</p>
                          <p className="font-semibold text-gray-800">
                            {resort.runs.easy + resort.runs.intermediate + resort.runs.advanced} km
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-600 mb-1">Altitude</p>
                          <p className="font-semibold text-gray-800">{resort.village_altitude}m</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-600 mb-1">Lifts</p>
                          <p className="font-semibold text-gray-800">{resort.number_of_lifts}</p>
                        </div>
                      </div>

                      {/* Run Distribution */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Slope Distribution</p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-20 text-sm text-gray-600">Easy</div>
                            <div className="flex-grow">
                              <div className="relative pt-1">
                                <div className="flex items-center">
                                  <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-200">
                                      <div 
                                        className="h-2 rounded-full bg-green-400" 
                                        style={{ width: `${(resort.runs.easy / (resort.runs.easy + resort.runs.intermediate + resort.runs.advanced)) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">{resort.runs.easy}km</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-20 text-sm text-gray-600">Medium</div>
                            <div className="flex-grow">
                              <div className="relative pt-1">
                                <div className="flex items-center">
                                  <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-200">
                                      <div 
                                        className="h-2 rounded-full bg-blue-400" 
                                        style={{ width: `${(resort.runs.intermediate / (resort.runs.easy + resort.runs.intermediate + resort.runs.advanced)) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">{resort.runs.intermediate}km</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-20 text-sm text-gray-600">Expert</div>
                            <div className="flex-grow">
                              <div className="relative pt-1">
                                <div className="flex items-center">
                                  <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-200">
                                      <div 
                                        className="h-2 rounded-full bg-black" 
                                        style={{ width: `${(resort.runs.advanced / (resort.runs.easy + resort.runs.intermediate + resort.runs.advanced)) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">{resort.runs.advanced}km</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Information */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600">€</span>
                          <div className="ml-1 space-y-2 flex-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Daily Pass:</span>
                              <span className="font-semibold">{resort.daily_pass_price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">6-Day Pass:</span>
                              <span className="font-semibold">{resort.six_day_pass_price}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Resort Highlights</p>
                        <ul className="space-y-2">
                          {resort.highlights.slice(0, 2).map((highlight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
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

      {/* Decorative Divider */}
      <div className="relative h-24 bg-gradient-to-b from-white to-blue-50">
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>

      {/* Top Resorts Section */}
      <section 
        id="top-resorts" 
        className="py-24 px-4 bg-blue-50 relative"
      >
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow opacity-20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Europe and North America&apos;s Top Ski Resorts
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
                            onClick={() => handleResortCardClick(resort)}
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

export default withClickTracking(Homepage, 'Homepage');