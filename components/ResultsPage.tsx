/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Snowflake, Users, Mountain, Martini, MapPin } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface Resort {
  name: string
  location: string
  country: string
  matchPercentage: number
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
  snowCondition: string
  suitableFor: string[]
  skiArea: string
  liftSystem: string
  nightlife: string
  familyFriendly: boolean
  snowPark: boolean
  offPiste: boolean
  skiInSkiOut: boolean
  nearestAirport: string
  transferTime: string
  altitude: string
  seasonDates: string
  terrainTypes: string[]
  additionalActivities: string[]
  highlights: string[]
  explanation?: string
}

const DifficultyBar = ({ difficulty, runs }: { difficulty: Resort['difficulty'], runs: Resort['runs'] }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-1 cursor-help">
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div className="bg-blue-400 h-2 rounded-l-full" style={{ width: `${difficulty.easy}%` }}></div>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div className="bg-red-400 h-2" style={{ width: `${difficulty.intermediate}%` }}></div>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div className="bg-gray-600 h-2 rounded-r-full" style={{ width: `${difficulty.advanced}%` }}></div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-white text-gray-800 border border-gray-200">
        <div className="text-sm">
          <p>Easy (Blue): {runs.easy} runs</p>
          <p>Intermediate (Red): {runs.intermediate} runs</p>
          <p>Advanced (Black): {runs.advanced} runs</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const ResortCard = ({ resort, rank }: { resort: Resort, rank: string }) => (
  <Card className="bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 hover:bg-opacity-50 transition-all duration-200">
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-3 h-3 mr-1" /> 
            {resort.location}, {resort.country}
          </div>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">{rank}</Badge>
      </div>
      {resort.explanation && (
        <p className="text-sm text-gray-700 italic mt-2">{resort.explanation}</p>
      )}
    </CardHeader>
    <CardContent className="p-4 pt-2 grid grid-cols-2 gap-3 text-sm">
      <div className="col-span-2">
        <span className="text-gray-600">Difficulty:</span>
        <DifficultyBar difficulty={resort.difficulty} runs={resort.runs} />
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">Ski Area:</span>
        <p className="text-gray-800">{resort.skiArea}</p>
      </div>
      <div>
        <span className="text-gray-600">Snow:</span>
        <div className="flex items-center">
          <Snowflake className="w-3 h-3 mr-1 text-blue-500" />
          <span className="text-gray-800">{resort.snowCondition}</span>
        </div>
      </div>
      <div>
        <span className="text-gray-600">For:</span>
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1 text-blue-500" />
          <span className="text-gray-800">{resort.suitableFor.join(', ')}</span>
        </div>
      </div>
      <div>
        <span className="text-gray-600">Lifts:</span>
        <p className="text-gray-800">{resort.liftSystem}</p>
      </div>
      <div>
        <span className="text-gray-600">Nightlife:</span>
        <div className="flex items-center">
          <Martini className="w-3 h-3 mr-1 text-blue-500" />
          <span className="text-gray-800">{resort.nightlife}</span>
        </div>
      </div>
      <div>
        <span className="text-gray-600">Family:</span>
        <p className="text-gray-800">{resort.familyFriendly ? 'Yes' : 'No'}</p>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">Highlights:</span>
        <ul className="list-disc list-inside mt-1 space-y-1">
          {resort.highlights.map((highlight, index) => (
            <li key={index} className="flex items-center text-gray-800">
              <Mountain className="w-3 h-3 mr-2 text-blue-500" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)

const mockResorts: Resort[] = [
  {
    name: "Chamonix",
    location: "French Alps",
    country: "France",
    matchPercentage: 95,
    difficulty: {
      easy: 20,
      intermediate: 40,
      advanced: 40
    },
    runs: {
      easy: 10,
      intermediate: 20,
      advanced: 20
    },
    snowCondition: "Excellent",
    suitableFor: ["Advanced Skiers", "Off-Piste Enthusiasts"],
    skiArea: "170km of pistes",
    liftSystem: "Modern, high-speed lifts",
    nightlife: "Vibrant",
    familyFriendly: false,
    snowPark: true,
    offPiste: true,
    skiInSkiOut: false,
    nearestAirport: "Geneva Airport",
    transferTime: "1 hour",
    altitude: "1,035m - 3,842m",
    seasonDates: "December to May",
    terrainTypes: ["Glaciers", "Steep Slopes", "Off-Piste"],
    additionalActivities: ["Paragliding", "Ice Climbing"],
    highlights: ["World-renowned off-piste skiing", "Breathtaking Mont Blanc views", "Challenging terrain for experts"],
    explanation: "Perfect match for advanced skiers seeking challenging terrain, with extensive off-piste options and proximity to Geneva airport.",
  },
  {
    name: "Zermatt",
    location: "Swiss Alps",
    country: "Switzerland",
    matchPercentage: 88,
    difficulty: {
      easy: 25,
      intermediate: 50,
      advanced: 25
    },
    runs: {
      easy: 25,
      intermediate: 50,
      advanced: 25
    },
    snowCondition: "Very Good",
    suitableFor: ["Intermediate Skiers", "Luxury Seekers"],
    skiArea: "360km of pistes",
    liftSystem: "State-of-the-art lifts",
    nightlife: "Moderate",
    familyFriendly: true,
    snowPark: true,
    offPiste: true,
    skiInSkiOut: true,
    nearestAirport: "Zurich Airport",
    transferTime: "3.5 hours",
    altitude: "1,620m - 3,883m",
    seasonDates: "November to April",
    terrainTypes: ["Groomed Runs", "Glacier Skiing"],
    additionalActivities: ["Snowshoeing", "Gourmet Dining"],
    highlights: ["Car-free village", "Iconic Matterhorn views", "Year-round skiing on glaciers"],
    explanation: "Ideal for intermediate skiers looking for a luxury experience, with guaranteed snow conditions and spectacular mountain views.",
  },
  {
    name: "St. Anton",
    location: "Tyrol",
    country: "Austria",
    matchPercentage: 82,
    difficulty: {
      easy: 10,
      intermediate: 40,
      advanced: 50
    },
    runs: {
      easy: 5,
      intermediate: 20,
      advanced: 25
    },
    snowCondition: "Good",
    suitableFor: ["Advanced Skiers", "Party Lovers"],
    skiArea: "305km of pistes",
    liftSystem: "Efficient lift network",
    nightlife: "Vibrant",
    familyFriendly: false,
    snowPark: true,
    offPiste: true,
    skiInSkiOut: false,
    nearestAirport: "Innsbruck Airport",
    transferTime: "1.5 hours",
    altitude: "1,304m - 2,811m",
    seasonDates: "December to April",
    terrainTypes: ["Powder Bowls", "Steep Chutes"],
    additionalActivities: ["Apres-Ski", "Tobogganing"],
    highlights: ["Legendary apres-ski scene", "Extensive Arlberg ski area", "Challenging off-piste terrain"],
    explanation: "Selected for its combination of challenging slopes and vibrant nightlife, making it perfect for advanced skiers who enjoy après-ski.",
  }
]

// Add a validation function to check if resorts match selected countries
const validateResorts = (resorts: Resort[], selectedCountries: string[]) => {
  // If "Anywhere" is selected, accept all resorts
  if (selectedCountries.includes("Anywhere")) {
    return resorts;
  }

  // Filter resorts to only include those from selected countries
  const validResorts = resorts.filter(resort => 
    selectedCountries.includes(resort.country)
  );

  // If we don't have enough valid resorts, log an error
  if (validResorts.length < resorts.length) {
    console.error('Some resorts did not match selected countries');
  }

  return validResorts;
};

export default function ResultsPage() {
  const [resorts, setResorts] = useState<Resort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add this to get the search params
  const searchParams = useSearchParams()

  const { complete } = useCompletion({
    api: '/api/chat',
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Parse the answers from the search params
        const encodedAnswers = searchParams?.get('answers')
        if (!encodedAnswers) {
          throw new Error('No answers provided')
        }
        const answers = JSON.parse(decodeURIComponent(encodedAnswers))

        // Add emphasis on country selection in the prompt
        const prompt = `Based on the following user preferences from the questionnaire:
        - Group type: ${answers.groupType}
        - Children ages: ${answers.childrenAges?.join(', ') || 'N/A'}
        - Ski or snowboard: ${answers.skiOrSnowboard}
        - Desired countries: ${answers.countries?.join(', ') || 'Anywhere'}
        - Skiing levels: ${answers.skiingLevels?.join(', ')}
        - Resort size preference: ${answers.slopePreferences?.join(', ')}
        - Lessons needed: ${answers.lessons}
        - Nightlife importance: ${answers.nightlife}
        - Snow park importance: ${answers.snowPark}
        - Off-piste importance: ${answers.offPiste}
        - Ski-in/ski-out preference: ${answers.skiInSkiOut}
        - Resort preferences: ${answers.resortPreferences?.join(', ')}
        - Other activities: ${answers.otherActivities?.join(', ')}
        - Loved resorts: ${answers.lovedResorts}
        - Travel time: ${answers.travelTime}
        - Travel month: ${answers.travelMonth?.join(', ') || 'Flexible'}
        - Additional info: ${answers.additionalInfo}

        IMPORTANT: You must ONLY suggest resorts from these countries: ${answers.countries?.join(', ')}
        If "Anywhere" is selected, you may suggest resorts from any European country.
        DO NOT suggest resorts from countries that weren't selected.

        Suggest 3 ski resorts that best match these preferences. The resorts should be in Europe and closely align with the user's input. For each resort, provide the following details:

        - name
        - location
        - country
        - difficulty (object with easy, intermediate, advanced percentages)
        - runs (object with easy, intermediate, advanced number of runs)
        - snowCondition (Excellent, Very Good, or Good)
        - suitableFor (array of group types, e.g., ["Families", "Couples"])
        - skiArea (e.g., "200km of pistes")
        - liftSystem (e.g., "Modern, high-speed lifts")
        - nightlife (Vibrant, Moderate, or Quiet)
        - familyFriendly (boolean)
        - snowPark (boolean)
        - offPiste (boolean)
        - skiInSkiOut (boolean)
        - nearestAirport
        - transferTime
        - altitude (e.g., "1500m - 3000m")
        - seasonDates (e.g., "December to April")
        - terrainTypes (array of 2-3 terrain types that match the user's preferences)
        - additionalActivities (array of 2-3 activities that match the user's preferences)
        - highlights (array of 3 short phrases based on the resort's features that align with the user's preferences)
        - explanation (1-2 sentences explaining why this resort was chosen based on the user's specific preferences)

        Ensure that each resort recommendation directly addresses the user's preferences, including:
        - Matching the desired countries or being a good alternative if 'Anywhere' was selected
        - Suitable for the specified group type and children ages (if applicable)
        - Appropriate for the indicated skiing levels
        - Matching the preferred resort size (small and charming, medium-sized, or large ski area)
        - Aligning with the importance placed on nightlife, snow parks, and off-piste skiing
        - Meeting the ski-in/ski-out preference
        - Offering the preferred resort characteristics (from their top 3 choices)
        - Providing opportunities for the desired additional activities
        - Being available and suitable for the specified travel time and month(s)

        Consider the additional information provided by the user to further refine the recommendations.

        Respond with a JSON array of 3 resort objects that best match the user's preferences.`
        
        const completion = await complete(prompt)
        
        // Remove any backticks and "json" tag that might be in the response
        const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
        
        let parsedResorts
        try {
          parsedResorts = JSON.parse(cleanedCompletion)
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
          console.log('Received data:', cleanedCompletion)
          throw new Error('Invalid JSON received from AI completion')
        }
        
        if (Array.isArray(parsedResorts) && parsedResorts.length > 0) {
          // Validate that resorts match selected countries
          const validatedResorts = validateResorts(parsedResorts, answers.countries)
          
          if (validatedResorts.length > 0) {
            setResorts(validatedResorts)
          } else {
            throw new Error('No resorts match selected countries')
          }
        } else {
          throw new Error('No valid resort data received')
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        setError('Failed to fetch personalized resort recommendations. Please try again later.')
        
        // If using mock data, filter it based on selected countries
        if (searchParams?.get('answers')) {
          const answers = JSON.parse(decodeURIComponent(searchParams.get('answers')!))
          const validatedMockResorts = validateResorts(mockResorts, answers.countries)
          setResorts(validatedMockResorts)
        } else {
          setResorts(mockResorts)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [complete, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
        <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Finding Your Perfect Ski Destinations</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Perfect Ski Destinations</h1>
          <p className="text-gray-600">Based on your preferences, we&apos;ve found these amazing matches</p>
        </div>
        {error && (
          <div className="bg-white bg-opacity-40 backdrop-blur-md rounded-lg p-4 mb-8 text-center border border-white">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resorts.map((resort, index) => (
            <ResortCard 
              key={index} 
              resort={resort} 
              rank={index === 0 ? 'Best Match' : index === 1 ? 'Alternative' : 'Surprise Pick'} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}
