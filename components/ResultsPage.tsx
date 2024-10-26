'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCompletion } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Snowflake, Users, Mountain, Martini, TreePine, MapPin } from 'lucide-react'

interface Resort {
  name: string
  location: string
  country: string
  matchPercentage: number
  difficulty: {
    beginner: number
    intermediate: number
    advanced: number
  }
  snowCondition: string
  priceLevel: number
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
}

const DifficultyBar = ({ difficulty }: { difficulty: Resort['difficulty'] }) => (
  <div className="flex items-center space-x-2">
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${difficulty.beginner}%` }}></div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${difficulty.intermediate}%` }}></div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${difficulty.advanced}%` }}></div>
    </div>
  </div>
)

const PriceLevel = ({ level }: { level: number }) => (
  <div className="flex items-center">
    {[...Array(4)].map((_, i) => (
      <DollarSign key={i} className={`w-4 h-4 ${i < level ? 'text-primary' : 'text-gray-300'}`} />
    ))}
  </div>
)

const ResortCard = ({ resort, rank }: { resort: Resort, rank: string }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>{resort.name}</span>
        <Badge variant="secondary">{rank}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="aspect-video relative mb-4">
        <Image
          src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(resort.name)}`}
          alt={resort.name}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
          {resort.matchPercentage}% Match
        </Badge>
      </div>
      <p className="text-muted-foreground mb-2 flex items-center">
        <MapPin className="w-4 h-4 mr-1" /> {resort.location}, {resort.country}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Difficulty</span>
          <DifficultyBar difficulty={resort.difficulty} />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Snow Condition</span>
          <div className="flex items-center">
            <Snowflake className="w-4 h-4 mr-1 text-blue-500" />
            <span>{resort.snowCondition}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Price Level</span>
          <PriceLevel level={resort.priceLevel} />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Suitable For</span>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{resort.suitableFor.join(', ')}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Ski Area</span>
          <span>{resort.skiArea}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Lift System</span>
          <span>{resort.liftSystem}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Nightlife</span>
          <div className="flex items-center">
            <Martini className="w-4 h-4 mr-1" />
            <span>{resort.nightlife}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Family Friendly</span>
          <span>{resort.familyFriendly ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Snow Park</span>
          <span>{resort.snowPark ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Off-Piste</span>
          <span>{resort.offPiste ? 'Available' : 'Limited'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Ski-in/Ski-out</span>
          <span>{resort.skiInSkiOut ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Nearest Airport</span>
          <span>{resort.nearestAirport}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Transfer Time</span>
          <span>{resort.transferTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Altitude</span>
          <span>{resort.altitude}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Season Dates</span>
          <span>{resort.seasonDates}</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="font-semibold">Terrain Types</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {resort.terrainTypes.map((terrain, index) => (
            <Badge key={index} variant="outline">
              <TreePine className="w-4 h-4 mr-1" /> {terrain}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <span className="font-semibold">Additional Activities</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {resort.additionalActivities.map((activity, index) => (
            <Badge key={index} variant="outline">
              <Snowflake className="w-4 h-4 mr-1" /> {activity}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <span className="font-semibold">Highlights</span>
        <ul className="list-disc list-inside mt-1">
          {resort.highlights.map((highlight, index) => (
            <li key={index} className="text-sm flex items-center">
              <Mountain className="w-4 h-4 mr-1" /> {highlight}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full">View Details</Button>
    </CardFooter>
  </Card>
)

export default function ResultsPage() {
  const [resorts, setResorts] = useState<Resort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { complete } = useCompletion({
    api: '/api/chat',
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const prompt = `Based on the user's preferences from the questionnaire, suggest 3 ski resorts from Europe only with the following details for each:
        - name
        - location
        - country
        - matchPercentage (between 80 and 100)
        - difficulty (object with beginner, intermediate, advanced percentages)
        - snowCondition (Excellent, Very Good, or Good)
        - priceLevel (1-4)
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
        - terrainTypes (array of 2-3 terrain types from the questionnaire)
        - additionalActivities (array of 2-3 activities from the questionnaire)
        - highlights (array of 2-3 short phrases based on resort preferences from the questionnaire)
        
        Ensure the results match the user's preferences for group type, skiing level, desired countries, and other specific requirements from the questionnaire. Respond with a JSON array of resort objects.`
        const completion = await complete(prompt)
        const parsedResorts = JSON.parse(completion || '[]')
        setResorts(parsedResorts)
      } catch (error) {
        console.error('Error fetching results:', error)
        setError('Failed to fetch resort recommendations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [complete])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Finding Your Perfect Ski Destinations</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Your Perfect Ski Destinations</h1>
        <p className="text-center text-muted-foreground mb-12">Based on your preferences, we've found these amazing matches</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resorts.map((resort, index) => (
            <ResortCard key={index} resort={resort} rank={index === 0 ? 'Best Match' : index === 1 ? 'Alternative' : 'Surprise Pick'} />
          ))}
        </div>
      </div>
    </div>
  )
}
