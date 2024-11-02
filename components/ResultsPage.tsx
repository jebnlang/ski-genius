/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Snowflake, Users, Mountain, Martini, MapPin } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { PostgrestError } from '@supabase/supabase-js'

// Define all necessary types
interface StorageState {
  answers: {
    groupType: string
    childrenAges: string[]
    sportType: string
    countries: string[]
    skiingLevels: string[]
    lessons: string
    nightlife: string
    snowPark: string
    offPiste: string
    skiInSkiOut: string
    resortPreferences: string[]
    slopePreferences: string[]
    otherActivities: string[]
    lovedResorts: string
    travelTime: string
    travelMonth: string[]
    additionalInfo: string
  }
  lastUpdated: string
  currentStep: number
}

type SnowCondition = "Powder" | "Groomed" | "Packed" | "Ice" | "Spring"

interface Resort {
  snow_condition: SnowCondition
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
  skiArea: string
  numberOfLifts: number
  villageAltitude: string
  skiRange: string
  nightlife: "Vibrant" | "Moderate" | "Quiet"
  highlights: string[]
  explanation?: string
}

const DifficultyBar = ({ difficulty, runs }: { difficulty: Resort['difficulty'], runs: Resort['runs'] }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-16">Easy</span>
            <div className="flex-1 bg-blue-100 rounded-full h-3">
              <div 
                className="bg-blue-400 h-3 rounded-full" 
                style={{ width: `${difficulty.easy}%` }}
              ></div>
            </div>
            <span className="text-xs w-8">{runs.easy}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-16">Medium</span>
            <div className="flex-1 bg-red-100 rounded-full h-3">
              <div 
                className="bg-red-400 h-3 rounded-full" 
                style={{ width: `${difficulty.intermediate}%` }}
              ></div>
            </div>
            <span className="text-xs w-8">{runs.intermediate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-16">Expert</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div 
                className="bg-gray-600 h-3 rounded-full" 
                style={{ width: `${difficulty.advanced}%` }}
              ></div>
            </div>
            <span className="text-xs w-8">{runs.advanced}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-white text-gray-800 border border-gray-200">
        <div className="text-sm">
          <p>Easy (Blue): {runs.easy} runs ({difficulty.easy}%)</p>
          <p>Intermediate (Red): {runs.intermediate} runs ({difficulty.intermediate}%)</p>
          <p>Advanced (Black): {runs.advanced} runs ({difficulty.advanced}%)</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const ResortCard = ({ resort, rank }: { resort: Resort, rank: string }) => (
  <Card className="bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
    transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10">
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-3 h-3 mr-1" /> 
            {resort.location}, {resort.country}
          </div>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
          {rank}
        </Badge>
      </div>
      
      <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
        <span className="text-blue-600 font-semibold mb-2 block">Resort Highlights:</span>
        <ul className="space-y-2">
          {resort.highlights.map((highlight, index) => (
            <li key={index} className="flex items-center text-gray-800">
              <Mountain className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {resort.explanation && (
        <p className="text-sm text-gray-700 italic mt-3">{resort.explanation}</p>
      )}
    </CardHeader>

    <CardContent className="p-4 pt-2">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="col-span-2">
          <span className="text-gray-600">Slope Distribution:</span>
          <DifficultyBar difficulty={resort.difficulty} runs={resort.runs} />
        </div>
        <div>
          <span className="text-gray-600">Km of Runs:</span>
          <p className="text-gray-800">{resort.skiArea}</p>
        </div>
        <div>
          <span className="text-gray-600">Number of Lifts:</span>
          <p className="text-gray-800">{resort.numberOfLifts}</p>
        </div>
        <div>
          <span className="text-gray-600">Village Altitude:</span>
          <p className="text-gray-800">{resort.villageAltitude}</p>
        </div>
        <div>
          <span className="text-gray-600">Ski Range:</span>
          <p className="text-gray-800">{resort.skiRange}</p>
        </div>
        <div>
          <span className="text-gray-600">Nightlife:</span>
          <div className="flex items-center">
            <Martini className="w-3 h-3 mr-1 text-blue-500" />
            <span className="text-gray-800">{resort.nightlife}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)
const mockResorts: Resort[] = [
  {
    name: "Chamonix",
    location: "French Alps", 
    country: "France",
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
    skiArea: "170 km",
    numberOfLifts: 49,
    villageAltitude: "1,035 m",
    skiRange: "1,035 m - 3,842 m",
    nightlife: "Vibrant",
    highlights: [
      "World-renowned off-piste skiing",
      "Breathtaking Mont Blanc views", 
      "Challenging terrain for experts"
    ],
    explanation: "Perfect match for advanced skiers seeking challenging terrain and vibrant atmosphere.",
    snow_condition: "Powder"
  },
  {
    name: "Zermatt",
    location: "Swiss Alps",
    country: "Switzerland", 
    difficulty: {
      easy: 25,
      intermediate: 50,
      advanced: 25
    },
    runs: {
      easy: 15,
      intermediate: 25,
      advanced: 10
    },
    skiArea: "360 km",
    numberOfLifts: 52,
    villageAltitude: "1,620 m",
    skiRange: "1,620 m - 3,883 m",
    nightlife: "Moderate",
    highlights: [
      "Year-round skiing",
      "Car-free village",
      "Views of the Matterhorn"
    ],
    explanation: "Great for intermediate skiers with stunning views and charming atmosphere.",
    snow_condition: "Groomed"
  },
  {
    name: "St. Moritz",
    location: "Swiss Alps",
    country: "Switzerland",
    difficulty: {
      easy: 30,
      intermediate: 45,
      advanced: 25
    },
    runs: {
      easy: 20,
      intermediate: 30,
      advanced: 15
    },
    skiArea: "350 km",
    numberOfLifts: 58,
    villageAltitude: "1,822 m",
    skiRange: "1,822 m - 3,303 m",
    nightlife: "Vibrant",
    highlights: [
      "Luxury shopping",
      "Winter sports events",
      "Sunny climate"
    ],
    explanation: "Luxury resort perfect for those seeking both great skiing and upscale amenities.",
    snow_condition: "Packed"
  }
]

// Validation function to check if resorts match selected countries
const validateResorts = (resorts: Resort[], selectedCountries: string[]): Resort[] => {
  if (!Array.isArray(resorts)) {
    throw new Error('Invalid resort data received')
  }

  // Basic data validation
  const isValidResort = (resort: Resort): boolean => {
    return (
      typeof resort.name === 'string' &&
      typeof resort.location === 'string' &&
      typeof resort.country === 'string' &&
      typeof resort.difficulty === 'object' &&
      typeof resort.runs === 'object' &&
      typeof resort.skiArea === 'string' &&
      typeof resort.numberOfLifts === 'number' &&
      typeof resort.villageAltitude === 'string' &&
      typeof resort.skiRange === 'string' &&
      Array.isArray(resort.highlights) &&
      ['Vibrant', 'Moderate', 'Quiet'].includes(resort.nightlife)
    )
  }

  // Filter out invalid resorts
  const validResorts = resorts.filter(isValidResort)

  if (validResorts.length === 0) {
    throw new Error('No valid resort data found')
  }

  // If "Anywhere" is selected, return all valid resorts
  if (selectedCountries.includes("Anywhere")) {
    return validResorts
  }

  // Filter resorts by selected countries
  const countryMatchedResorts = validResorts.filter(resort => 
    selectedCountries.includes(resort.country)
  )

  if (countryMatchedResorts.length === 0) {
    throw new Error('No resorts found in selected countries')
  }

  return countryMatchedResorts
}

// API prompt construction
const constructPrompt = (answers: StorageState['answers']): string => {
  return `Based on the following user preferences from the questionnaire:
- Group type: ${answers.groupType}
- Children ages: ${answers.childrenAges?.join(', ') || 'N/A'}
- Ski or snowboard: ${answers.sportType}
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

CRITICAL REQUIREMENTS:
1. COUNTRY RESTRICTION: You must ONLY suggest resorts from these countries: ${answers.countries?.join(', ')}
   If "Anywhere" is selected, you may suggest resorts from any European country.
   Under no circumstances suggest resorts from countries that weren't selected.

2. SIMILAR TO LOVED RESORTS: The user loved these resorts: ${answers.lovedResorts}
   If the user specified any loved resorts, at least one recommendation should have similar characteristics.

3. DIVERSE SUGGESTIONS: While one recommendation can be a well-known resort, at least one recommendation 
   should be a hidden gem or lesser-known resort that matches their preferences.

Suggest 3 ski resorts that best match these preferences. For each resort, provide ONLY the following details in JSON format:
{
  "name": "Resort Name",
  "location": "Specific Region/Area",
  "country": "Country Name",
  "difficulty": {
    "easy": percentage,
    "intermediate": percentage,
    "advanced": percentage
  },
  "runs": {
    "easy": number,
    "intermediate": number,
    "advanced": number
  },
  "skiArea": "XXX km",
  "numberOfLifts": number,
  "villageAltitude": "XXXX m",
  "skiRange": "XXXX m - YYYY m",
  "nightlife": "Vibrant|Moderate|Quiet",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "explanation": "1-2 sentences explaining why this resort matches"
}

Respond with a JSON array of exactly 3 resort objects.`
}

const saveToDatabase = async (answers: StorageState['answers'], resorts: Resort[]) => {
  try {
    // First, save questionnaire answers
    const { data: questionnaireData, error: questionnaireError } = await supabase
      .from('questionnaire_answers')
      .insert([{
        group_type: answers.groupType,
        children_ages: answers.childrenAges,
        sport_type: answers.sportType,
        countries: answers.countries,
        skiing_levels: answers.skiingLevels,
        lessons: answers.lessons,
        nightlife: answers.nightlife,
        snow_park: answers.snowPark,
        off_piste: answers.offPiste,
        ski_in_ski_out: answers.skiInSkiOut,
        resort_preferences: answers.resortPreferences,
        slope_preferences: answers.slopePreferences,
        other_activities: answers.otherActivities,
        loved_resorts: answers.lovedResorts,
        travel_time: answers.travelTime,
        travel_month: answers.travelMonth,
        additional_info: answers.additionalInfo
      }])
      .select()

    if (questionnaireError) {
      throw new Error(`Error saving questionnaire: ${questionnaireError.details || questionnaireError.message}`)
    }

    // Then, save each resort recommendation with only the data we're using
    const questionnaireId = questionnaireData[0].id
    const resortsToInsert = resorts.map((resort) => ({
      questionnaire_id: questionnaireId,
      name: resort.name,
      location: resort.location,
      country: resort.country,
      difficulty: resort.difficulty,
      runs: resort.runs,
      ski_area: resort.skiArea,
      number_of_lifts: resort.numberOfLifts,
      village_altitude: resort.villageAltitude,
      ski_range: resort.skiRange,
      nightlife: resort.nightlife,
      highlights: resort.highlights,
      explanation: resort.explanation
    }))

    const { error: resortsError } = await supabase
      .from('resort_recommendations')
      .insert(resortsToInsert)

    if (resortsError) {
      throw new Error(`Error saving resorts: ${resortsError.details || resortsError.message}`)
    }
  } catch (error) {
    // Log the error and rethrow it
    if (error instanceof Error) {
      console.log('Database error:', error.message)
    } else {
      console.log('Unknown database error occurred')
    }
    throw error
  }
}

export default function ResultsPage() {
  const [resorts, setResorts] = useState<Resort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { complete } = useCompletion({
    api: '/api/chat',
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Check for localStorage data
        const savedData = localStorage.getItem('ski_questionnaire_data')
        if (!savedData) {
          router.push('/questionnaire')
          return
        }

        let parsedData: StorageState
        try {
          parsedData = JSON.parse(savedData)
        } catch (e) {
          setError('Error loading your preferences. Please try again.')
          router.push('/questionnaire')
          return
        }

        const { answers } = parsedData

        try {
          const completion = await complete(constructPrompt(answers))
          
          const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
          
          let parsedResorts: Resort[]
          try {
            parsedResorts = JSON.parse(cleanedCompletion)
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
            throw new Error('Unable to process resort recommendations')
          }
          
          // Validate resort data
          if (!Array.isArray(parsedResorts) || parsedResorts.length === 0) {
            throw new Error('No resort recommendations received')
          }

          // Validate that resorts match selected countries
          const validatedResorts = validateResorts(parsedResorts, answers.countries)
          
          if (validatedResorts.length === 0) {
            throw new Error('No resorts match your selected countries')
          }

          setResorts(validatedResorts)
          
          // Save to database
          try {
            await saveToDatabase(answers, validatedResorts)
          } catch (dbError) {
            console.error('Database error:', dbError)
            // Don't throw here - we still want to show results even if save fails
          }

        } catch (apiError) {
          console.error('API Error:', apiError)
          setError('Unable to get resort recommendations. Please try again.')
          
          // Only use mock data in development
          if (process.env.NODE_ENV === 'development') {
            const validatedMockResorts = validateResorts(mockResorts, answers.countries)
            setResorts(validatedMockResorts)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [complete, router])

  // Improved loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
        <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Finding Your Perfect Ski Destinations</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your preferences...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden p-4">
        <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/questionnaire')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Perfect Ski Destinations</h1>
          <p className="text-gray-600">Based on your preferences, we&apos;ve found these amazing matches</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative group">
          {resorts.map((resort, index) => (
            <div key={index} className="transition-all duration-300 group-hover:opacity-50 hover:!opacity-100">
              <ResortCard 
                resort={resort} 
                rank={index === 0 ? 'Best Match' : index === 1 ? 'Alternative' : 'Surprise Pick'} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}