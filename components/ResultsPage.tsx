/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Snowflake, Users, Mountain, Martini, MapPin, X, Filter, Star, Sparkles, Lightbulb, Heart, MessageSquare } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { trackResortView, trackResortRemoval, trackSearchRefinement } from '@/utils/analytics'
import Fuse from 'fuse.js'
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { withClickTracking } from '@/components/withClickTracking'
import { trackEnhancedEvent } from '@/utils/enhanced-analytics'

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
    travelTime: string
    travelMonth: string[]
    additionalInfo: string
    pricingSensitivity: string
    otherActivities: string[]
  }
  lastUpdated: string
  currentStep: number
}

type SnowCondition = "Powder" | "Groomed" | "Packed" | "Ice" | "Spring"

// First, let's define a proper type for resort countries
type EuropeanCountry = typeof COUNTRIES_BY_REGION[typeof REGIONS.EUROPE][number];
type NorthAmericanCountry = typeof COUNTRIES_BY_REGION[typeof REGIONS.NORTH_AMERICA][number];
type ResortCountry = EuropeanCountry | NorthAmericanCountry;

interface Resort {
  name: string
  location: string
  country: ResortCountry
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
  numberOfLifts?: number
  villageAltitude?: string
  skiRange?: string
  nightlife: "Vibrant" | "Moderate" | "Quiet"
  highlights: string[]
  explanation?: string
  snow_condition?: SnowCondition
  pricing?: {
    dailyPass: string
    sixDayPass: string
  }
  website?: string
  homepage_url?: string
  tour_operators?: {
    weski_url?: string;
    crystal_ski_url?: string;
    iglu_ski_url?: string;
    ski_deal_url?: string;
  };
}

// Function to determine pricing badge style based on price range
const getPricingBadgeStyle = (price: string | undefined) => {
  if (!price) return "bg-gray-100 text-gray-600";
  
  const numericPrice = parseFloat(price.replace(/[€$£]/g, ''));
  
  if (numericPrice <= 200) {
    return "bg-green-50 text-green-700 hover:bg-green-100";
  } else if (numericPrice <= 300) {
    return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100";
  } else {
    return "bg-red-50 text-red-700 hover:bg-red-100";
  }
};

// Function to get pricing label based on price range
const getPricingLabel = (price: string | undefined) => {
  if (!price) return "Price N/A";
  
  const numericPrice = parseFloat(price.replace(/[€$£]/g, ''));
  
  if (numericPrice <= 200) {
    return "Budget-Friendly";
  } else if (numericPrice <= 300) {
    return "Mid-Range";
  } else {
    return "Premium";
  }
};

// Add this function to get the tooltip text based on price range
const getPricingTooltip = (price: string | undefined) => {
  if (!price) return "Pricing information not available";
  
  const numericPrice = parseFloat(price.replace(/[€$£]/g, ''));
  
  if (numericPrice <= 200) {
    return "Excellent choice for cost-conscious travelers.";
  } else if (numericPrice <= 300) {
    return "Balanced option offering good amenities and services at mid-range prices.";
  } else {
    return "High-end resort with premium facilities and services.";
  }
};

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

// Update the LoadingCard component
const LoadingCard = () => (
  <Card className="relative bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
    transition-all duration-300 min-h-[180px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Finding new resort...</p>
    </div>
  </Card>
)

// Update the TOUR_OPERATORS constant with consistent color styling
const TOUR_OPERATORS = {
  weski: {
    name: 'WeSki',
    favicon: 'https://www.weski.com/favicon-32x32.png',
    style: 'from-[#285E61] to-[#234e51] hover:from-[#234e51] hover:to-[#1d4144] border border-[#285E61]/20'
  },
  crystal_ski: {
    name: 'Crystal Ski',
    favicon: 'https://www.crystalski.co.uk/ski-holidays/_ui/mobile/th/images/crystal_uk/favicon.ico',
    style: 'from-[#285E61] to-[#234e51] hover:from-[#234e51] hover:to-[#1d4144] border border-[#285E61]/20'
  },
  iglu_ski: {
    name: 'Iglu Ski',
    favicon: 'https://www.igluski.com/favicon.ico',
    style: 'from-[#285E61] to-[#234e51] hover:from-[#234e51] hover:to-[#1d4144] border border-[#285E61]/20'
  },
  skideal: {
    name: 'SkiDeal',
    favicon: 'https://www.skideal.co.il/app/uploads/2021/11/favicon-1-1-1.png?v=2',
    style: 'from-[#285E61] to-[#234e51] hover:from-[#234e51] hover:to-[#1d4144] border border-[#285E61]/20'
  }
} as const;

// Update the BookingCTA component with wider width
const BookingCTA = ({ resort }: { resort: Resort }) => {
  const operators = resort.tour_operators || {};
  const availableOperators = Object.entries({
    weski: operators.weski_url,
    crystal_ski: operators.crystal_ski_url,
    iglu_ski: operators.iglu_ski_url,
    skideal: operators.ski_deal_url
  })
    .filter(([_, url]) => url)
    .map(([key, url]) => ({
      key: key as keyof typeof TOUR_OPERATORS,
      url: url as string
    }));

  return (
    <div className="flex-shrink-0 w-full md:w-52 flex flex-col items-stretch justify-center p-4 md:px-4 border-t md:border-t-0 md:border-l border-gray-200">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">
        Book Your Trip
      </h3>
      <div className="space-y-2.5">
        {availableOperators.length > 0 ? (
          <>
            {availableOperators.map(({ key, url }) => (
              <TourOperatorCTA
                key={key}
                name={TOUR_OPERATORS[key].name}
                url={url}
                favicon={TOUR_OPERATORS[key].favicon}
                style={TOUR_OPERATORS[key].style}
              />
            ))}
          </>
        ) : (
          // Fallback button with matching dimensions
          <a
            href={resort.homepage_url || resort.website || `https://www.google.com/search?q=${encodeURIComponent(resort.name + ' ski resort')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackResortWebsiteClick(resort.name);
            }}
            className="w-full bg-gradient-to-r from-[#285E61] to-[#234e51] hover:from-[#234e51] hover:to-[#1d4144]
              text-white font-medium border border-[#285E61]/20
              h-10 rounded-lg shadow-md 
              transform transition-all duration-300 
              hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-offset-2
              active:translate-y-0 active:scale-[0.98]
              text-sm flex items-center justify-center gap-2"
          >
            <span>View Resort</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

// Update the ResortCard component
const ResortCard = ({ resort, rank, onRemove }: { resort: Resort, rank: string, onRemove: () => void }) => {
  // Get the appropriate badge style and icon based on rank
  const getBadgeConfig = (rank: string) => {
    switch (rank) {
      case 'Best Match':
        return {
          style: 'from-blue-400 to-blue-600',
          icon: <Star className="w-3 h-3 mr-1" />
        };
      case 'Perfect Alternative':
        return {
          style: 'from-purple-400 to-purple-600',
          icon: <Sparkles className="w-3 h-3 mr-1" />
        };
      case 'Surprise Pick':
        return {
          style: 'from-emerald-400 to-emerald-600',
          icon: <Lightbulb className="w-3 h-3 mr-1" />
        };
      default:
        return {
          style: 'from-blue-400 to-blue-600',
          icon: <Star className="w-3 h-3 mr-1" />
        };
    }
  };

  const badgeConfig = getBadgeConfig(rank);

  return (
    <Card className="relative bg-white bg-opacity-90 backdrop-blur-md shadow-md 
      transition-all duration-300 hover:shadow-lg">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 
          transition-colors z-20"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex flex-col md:flex-row">
        {/* Main Content Section */}
        <div className="flex-1 p-3 md:p-4">
          {/* Resort Title, Badges, Location and Description */}
          <div className="space-y-2 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
              <div className="flex flex-col sm:flex-row items-start gap-1 flex-1">
                <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`bg-gradient-to-r ${badgeConfig.style} text-white text-sm flex items-center`}
                  >
                    {badgeConfig.icon}
                    {rank}
                  </Badge>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className={`cursor-help transition-colors text-sm ${getPricingBadgeStyle(resort.pricing?.sixDayPass)}`}
                        >
                          {getPricingLabel(resort.pricing?.sixDayPass)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-white text-gray-800 border border-gray-200 p-2">
                        <p className="text-sm max-w-[200px]">{getPricingTooltip(resort.pricing?.sixDayPass)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3 h-3 mr-1" /> 
              {resort.location}, {resort.country}
            </div>

            {/* Moved description here */}
            {resort.explanation && (
              <p className="text-sm text-gray-700 italic border-l-2 border-blue-200 pl-3">
                {resort.explanation}
              </p>
            )}
          </div>

          {/* Resort Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <span className="text-blue-600 font-semibold mb-1 block text-sm">Resort Highlights:</span>
                <ul className="space-y-1">
                  {resort.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center text-gray-800">
                      <Mountain className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <span className="text-green-600 font-semibold block mb-1 text-sm">Lift Pass Pricing:</span>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Daily Pass:</span>
                    <p className="text-gray-800 font-medium text-sm">{resort.pricing?.dailyPass}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">6-Day Pass:</span>
                    <p className="text-gray-800 font-medium text-sm">{resort.pricing?.sixDayPass}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="hidden sm:block">
                <span className="text-gray-600 text-sm">Slope Distribution:</span>
                <DifficultyBar difficulty={resort.difficulty} runs={resort.runs} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white bg-opacity-50 rounded-lg p-1.5 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Ski Area:</span>
                    <p className="text-gray-800 font-medium text-sm">{resort.skiArea}</p>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-50 rounded-lg p-1.5 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Lifts:</span>
                    <p className="text-gray-800 font-medium text-sm">{resort.numberOfLifts}</p>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-50 rounded-lg p-1.5 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Village:</span>
                    <p className="text-gray-800 font-medium text-sm">{resort.villageAltitude}</p>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-50 rounded-lg p-1.5 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Nightlife:</span>
                    <div className="flex items-center">
                      <Martini className="w-3 h-3 mr-1 text-blue-500" />
                      <span className="text-gray-800 font-medium text-sm">{resort.nightlife}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replace the old CTA section with the new BookingCTA component */}
        <BookingCTA resort={resort} />
      </div>
    </Card>
  )
}
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
    snow_condition: "Powder",
    pricing: {
      dailyPass: "$50",
      sixDayPass: "$250"
    },
    website: "https://www.chamonix.com",
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
    snow_condition: "Groomed",
    pricing: {
      dailyPass: "$60",
      sixDayPass: "$300"
    },
    website: "https://www.zermatt.ch",
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
    snow_condition: "Packed",
    pricing: {
      dailyPass: "$70",
      sixDayPass: "$350"
    },
    website: "https://www.stmoritz.ch",
  }
]

// Define the EUROPEAN_COUNTRIES constant
const EUROPEAN_COUNTRIES = [
  'France',
  'Austria',
  'Switzerland',
  'Italy',
  'Germany',
  'Norway',
  'Sweden',
  'Spain',
  'Bulgaria',
  'Slovenia',
  'Czech Republic',
  'Poland',
  'Finland',
  'Andorra',
  'Greece'
];

// Validation function to check if resorts match selected countries
const validateResorts = (resorts: Resort[], selectedCountries: string[]): Resort[] => {
  console.log('=== Resort Validation Debug Start ===')
  console.log('Input resorts:', resorts)
  console.log('Selected countries:', selectedCountries)

  if (!Array.isArray(resorts)) {
    console.error('❌ Validation Failed: Input is not an array:', resorts)
    throw new Error('Invalid resort data format')
  }

  if (!resorts.length) {
    console.error('❌ Validation Failed: No resorts provided')
    throw new Error('No resorts were found matching your criteria')
  }

  // Remove duplicates
  const uniqueResorts = Array.from(
    new Map(resorts.map(resort => [resort.name.toLowerCase(), resort])).values()
  )

  let validResorts: Resort[] = []

  // Handle "Anywhere" selections
  if (selectedCountries.includes("Anywhere in Europe")) {
    validResorts = uniqueResorts.filter(resort => 
      COUNTRIES_BY_REGION[REGIONS.EUROPE].includes(resort.country as EuropeanCountry)
    )
  } else if (selectedCountries.includes("Anywhere in North America")) {
    validResorts = uniqueResorts.filter(resort => 
      COUNTRIES_BY_REGION[REGIONS.NORTH_AMERICA].includes(resort.country as NorthAmericanCountry)
    )
  } else if (selectedCountries.length > 0) {
    validResorts = uniqueResorts.filter(resort => selectedCountries.includes(resort.country))
  } else {
    // If no countries selected, accept all resorts
    validResorts = uniqueResorts
  }

  console.log('Validated resorts:', validResorts)

  if (validResorts.length === 0) {
    throw new Error(`No resorts found in selected countries (${selectedCountries.join(', ')}). Please try selecting more countries or choose 'Anywhere'.`)
  }

  return validResorts.slice(0, 3)
}

// Add these helper functions near the top with other utility functions
const getPricingGuidance = (pricingSensitivity: string): string => {
  switch (pricingSensitivity) {
    case 'Budget-friendly':
      return `CRITICAL BUDGET REQUIREMENT: User specifically requested budget-friendly options.
       STRICT REQUIREMENTS:
       - Focus on resorts known for affordability
       - Prioritize areas with lower lift pass prices
       - Look for resorts with good value accommodation
       - Consider destinations with reasonable equipment rental costs
       
       PRICING EXPECTATIONS:
       - Daily lift passes should be under €50
       - Look for resorts with budget-friendly dining options
       - Prioritize areas with affordable ski schools if lessons needed`;

    case 'Luxury':
      return `CRITICAL LUXURY REQUIREMENT: User specifically requested luxury destinations.
       STRICT REQUIREMENTS:
       - Focus ONLY on world-renowned luxury ski resorts
       - Prioritize resorts known for:
         * 5-star hotels and Michelin-starred restaurants
         * High-end boutiques and designer shopping
         * Premium spa facilities
         * Exclusive VIP services
         * Private ski instructors and guides
         * Helicopter transfers
         * Exceptional service standards
       
       PRICING EXPECTATIONS:
       - Daily lift passes can be premium range (€80+)
       - Focus on resorts with luxury accommodation options
       - Include resorts known for their wealthy clientele`;

    case 'Mid-range':
      return `PRICING GUIDANCE: User prefers mid-range options.
       REQUIREMENTS:
       - Focus on resorts offering good value for money
       - Balance quality and cost
       - Look for resorts with:
         * Reasonable lift pass prices (€50-80 per day)
         * Mix of accommodation options
         * Good quality facilities without premium pricing
         * Varied dining options at different price points`;

    default:
      return `STANDARD PRICING GUIDANCE: Focus on resorts that provide good value while meeting the user's quality expectations.
       Consider:
       - Mid-range lift pass prices
       - Mix of accommodation options
       - Reasonable equipment rental costs
       - Balanced food and drink prices
       - Good quality-to-price ratio for facilities`;
  }
};

// Update the constructPrompt function
const constructPrompt = (answers: StorageState['answers']): string => {
  // Check if this is a direct resort selection
  const isDirectSelection = answers.additionalInfo?.startsWith('Show me information about ');
  
  if (isDirectSelection) {
    const resortName = answers.additionalInfo.replace('Show me information about ', '');
    return `Please provide detailed information about ${resortName} ski resort in ${answers.countries[0]}.
    
    CRITICAL REQUIREMENTS:
    1. You MUST ONLY return information about ${resortName}
    2. Return exactly ONE resort in the response
    3. Include complete details about:
       - Difficulty levels
       - Available runs
       - Ski area
       - Lift system
       - Village details
       - Nightlife
       - Key highlights
       
    RESPONSE FORMAT:
    Provide the resort information in the exact JSON format as specified:
    {
      "name": "${resortName}",
      "location": string,
      "country": "${answers.countries[0]}",
      "difficulty": {
        "easy": number (percentage),
        "intermediate": number (percentage),
        "advanced": number (percentage)
      },
      "runs": {
        "easy": number (count),
        "intermediate": number (count),
        "advanced": number (count)
      },
      "skiArea": string,
      "numberOfLifts": number,
      "villageAltitude": string,
      "skiRange": string,
      "nightlife": "Vibrant" | "Moderate" | "Quiet",
      "highlights": string[],
      "explanation": string,
      "pricing": {
        "dailyPass": string,
        "sixDayPass": string
      }
    }`;
  }

  const pricingGuidance = getPricingGuidance(answers.pricingSensitivity);
  const isBudgetFriendly = answers.pricingSensitivity === 'Budget-friendly';

  // If not a direct selection, use the existing prompt construction
  return `Based on the following user preferences from the questionnaire:

Experience Level: ${answers.skiingLevels?.join(', ')}
Group Type: ${answers.groupType}
${answers.childrenAges ? `Children's Ages: ${answers.childrenAges.join(', ')}` : ''}
Sport: ${answers.sportType}
Nightlife Preference: ${answers.nightlife}
Snow Park Interest: ${answers.snowPark}
Off-Piste Interest: ${answers.offPiste}
Ski-in/Ski-out Preference: ${answers.skiInSkiOut}

CRITICAL REQUIREMENTS:
1. LOCATION REQUIREMENT: ${answers.countries?.includes("Anywhere in Europe") || answers.countries?.includes("Anywhere in North America") 
     ? `User is open to resorts in ${answers.countries.join(', ')}. ONLY suggest resorts from these regions.`
     : `YOU MUST ONLY SUGGEST RESORTS FROM: ${answers.countries?.join(', ')}. This is a non-negotiable requirement.`}

2. ${pricingGuidance}

3. RESORT SELECTION CRITERIA:
   ${isBudgetFriendly 
     ? answers.countries?.includes("Anywhere in Europe")
       ? `STRICT BUDGET FOCUS:
          - All suggestions must be from the budget-friendly countries listed above
          - Daily lift pass prices should be under €40
          - Must have good value rental equipment available`
       : `STRICT BUDGET FOCUS within selected countries (${answers.countries?.join(', ')}):
          - Find the most economical options in these specific locations
          - Focus on value seasons and package deals
          - Prioritize areas with lower overall costs
          - Look for resorts with reasonable lift pass prices
          - Must have budget-friendly accommodation options`
     : `STANDARD CRITERIA:
        - Balance of quality and value
        - Good infrastructure and facilities
        - Suitable terrain for specified skill levels
        - Appropriate amenities for group type`}

4. DIVERSE SUGGESTIONS: Provide exactly three resorts with distinct characteristics:
   - First resort (Best Match): The resort that best matches ALL specified criteria
   - Second resort (Perfect Alternative): A highly suitable alternative that matches most criteria but might excel in different areas
   - Third resort (Surprise Pick): An unexpected option that matches core requirements but offers unique features or experiences not explicitly requested

Each resort suggestion should be justified with clear explanations of why it matches its respective category.

IMPORTANT: Ensure each resort maintains high relevance to core requirements (location, skill level, budget) while fulfilling its specific role in the recommendation set.

CRITICAL FORMAT REQUIREMENTS:
Each resort MUST include these exact fields in this format:
{
  "name": string,
  "location": string,
  "country": string,
  "difficulty": {
    "easy": number (percentage),
    "intermediate": number (percentage),
    "advanced": number (percentage)
  },
  "runs": {
    "easy": number (count),
    "intermediate": number (count),
    "advanced": number (count)
  },
  "skiArea": string (e.g. "75 km"),
  "numberOfLifts": number,
  "villageAltitude": string (e.g. "1,500 m"),
  "skiRange": string (e.g. "1,500 m - 3,000 m"),
  "nightlife": "Vibrant" | "Moderate" | "Quiet",
  "highlights": string[],
  "explanation": string,
  "pricing": {
    "dailyPass": string (e.g. "€45"),
    "sixDayPass": string (e.g. "€225")
  }
}

IMPORTANT: ALL fields listed above are required. Do not omit any fields.
Each resort must include complete information for altitude, ski range, and pricing.
Format all prices in euros (€).

Please provide exactly three resort recommendations in valid JSON format.`;
};

// Add this function to determine price tag
const getPriceTag = (price: string | undefined): string => {
  if (!price) return "Unknown";
  
  const numericPrice = parseFloat(price.replace(/[€$£]/g, ''));
  
  if (numericPrice <= 200) {
    return "Budget";
  } else if (numericPrice <= 300) {
    return "Mid-Range";
  } else {
    return "Premium";
  }
};

// Update the processAndValidateResults function to remove database saving
const processAndValidateResults = async (
  aiResults: Resort[], 
  validResorts: DBResort[]
): Promise<Resort[]> => {
  console.log('Phase 2 - Step 3: Processing AI results');
  console.log('AI returned results:', aiResults);

  const validResortsMap = new Map(validResorts.map(r => [r.resort_name.toLowerCase(), r]));

  const validatedResults = aiResults
    .filter(resort => validResortsMap.has(resort.name.toLowerCase()))
    .map(resort => {
      const matchedResort = validResortsMap.get(resort.name.toLowerCase());
      return {
        ...resort,
        homepage_url: matchedResort?.homepage_url,
        tour_operators: {
          weski_url: matchedResort?.weski,
          crystal_ski_url: matchedResort?.crystal_ski,
          iglu_ski_url: matchedResort?.iglu_ski,
          ski_deal_url: matchedResort?.skideal
        }
      };
    });
  console.log('Validated results:', validatedResults);
  return validatedResults;
}

// Update the saveToDatabase function
const saveToDatabase = async (answers: StorageState['answers'], resorts: Resort[]) => {
  try {
    // Only proceed if we have resorts to save
    if (!resorts || resorts.length === 0) {
      console.log('No resorts to save to database');
      return;
    }

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
        travel_time: answers.travelTime,
        travel_month: answers.travelMonth,
        additional_info: answers.additionalInfo,
        pricing_sensitivity: answers.pricingSensitivity
      }])
      .select();

    if (questionnaireError) {
      throw new Error(`Error saving questionnaire: ${questionnaireError.details || questionnaireError.message}`);
    }

    const questionnaireId = questionnaireData[0].id;

    // Get the actual displayed resorts (max 3)
    const displayedResorts = resorts.slice(0, 3);

    // Save only the displayed resorts
    for (const [index, resort] of displayedResorts.entries()) {
      const priceTag = getPriceTag(resort.pricing?.sixDayPass);
      
      // Determine the match tag based on position
      const matchTag = answers.additionalInfo?.startsWith('Show me information about ')
        ? 'Direct Selection'
        : index === 0 
          ? 'Best Match' 
          : index === 1 
            ? 'Perfect Alternative' 
            : 'Surprise Pick';

      const { error: resortError } = await supabase
        .from('resort_recommendations')
        .insert([{
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
          explanation: resort.explanation,
          daily_pass_price: resort.pricing?.dailyPass,
          six_day_pass_price: resort.pricing?.sixDayPass,
          match_tag: matchTag,
          price_tag: priceTag
        }]);

      if (resortError) {
        console.error('Error saving resort:', resortError);
        throw new Error(`Error saving resort: ${resortError.details || resortError.message}`);
      }
    }

    console.log(`Successfully saved ${displayedResorts.length} displayed resorts to database`);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Update the RefinementDialog component
const RefinementDialog = ({ 
  currentAnswers,
  onUpdateAnswers 
}: { 
  currentAnswers: StorageState['answers'],
  onUpdateAnswers: (newAnswers: StorageState['answers']) => void 
}) => {
  const [tempAnswers, setTempAnswers] = useState(currentAnswers)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700 
            text-white rounded-lg px-4 py-2.5 shadow-md 
            flex items-center justify-center gap-2 transition-all duration-300 
            hover:shadow-blue-400/30 hover:shadow-lg
            border border-blue-400 text-sm"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Modify Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Refine Your Search</DialogTitle>
        </DialogHeader>
        
        {/* Mobile-friendly summary of current criteria */}
        <div className="lg:hidden border-b border-gray-200 pb-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Current Criteria</h3>
          <AnswersSummary answers={currentAnswers} />
        </div>

        {/* Rest of the dialog content */}
        <div className="space-y-8 py-4">
          {/* Group Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Group Type</Label>
            <RadioGroup value={tempAnswers.groupType} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, groupType: value }))}>
              {['Couple', 'Group of friends', 'Family with children', 'Family without children'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`group-${option}`} />
                  <Label htmlFor={`group-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>

            {tempAnswers.groupType === 'Family with children' && (
              <div className="mt-4 space-y-2">
                <Label className="text-md font-medium">Children&apos;s Ages</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Under 5', '5-12', '13-17'].map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <Checkbox
                        id={`age-${age}`}
                        checked={tempAnswers.childrenAges.includes(age)}
                        onCheckedChange={(checked) => {
                          setTempAnswers(prev => ({
                            ...prev,
                            childrenAges: checked 
                              ? [...prev.childrenAges, age]
                              : prev.childrenAges.filter(a => a !== age)
                          }))
                        }}
                      />
                      <Label htmlFor={`age-${age}`}>{age}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sport Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Are you skiers or snowboarders?</Label>
            <RadioGroup value={tempAnswers.sportType} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, sportType: value }))}>
              {['Skiers', 'Snowboarders', 'Mixed'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`sport-${option}`} />
                  <Label htmlFor={`sport-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <Label className="text-lg font-semibold">Where would you like to ski?</Label>
            
            {/* Europe Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Europe</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anywhere-europe"
                      checked={tempAnswers.countries.includes("Anywhere in Europe")}
                      onCheckedChange={(checked) => {
                        setTempAnswers(prev => ({
                          ...prev,
                          countries: checked 
                            ? ["Anywhere in Europe"]
                            : []
                        }))
                      }}
                    />
                    <Label htmlFor="anywhere-europe">Anywhere in Europe</Label>
                  </div>
                </div>
                {COUNTRIES_BY_REGION[REGIONS.EUROPE].map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={tempAnswers.countries.includes(country)}
                      onCheckedChange={(checked) => {
                        setTempAnswers(prev => ({
                          ...prev,
                          countries: checked
                            ? [...prev.countries.filter(c => !c.includes("Anywhere")), country]
                            : prev.countries.filter(c => c !== country)
                        }))
                      }}
                      disabled={tempAnswers.countries.includes("Anywhere in Europe") || 
                               tempAnswers.countries.includes("Anywhere in North America")}
                    />
                    <Label htmlFor={`country-${country}`}>{country}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* North America Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">North America</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anywhere-na"
                      checked={tempAnswers.countries.includes("Anywhere in North America")}
                      onCheckedChange={(checked) => {
                        setTempAnswers(prev => ({
                          ...prev,
                          countries: checked 
                            ? ["Anywhere in North America"]
                            : []
                        }))
                      }}
                    />
                    <Label htmlFor="anywhere-na">Anywhere in North America</Label>
                  </div>
                </div>
                {COUNTRIES_BY_REGION[REGIONS.NORTH_AMERICA].map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={tempAnswers.countries.includes(country)}
                      onCheckedChange={(checked) => {
                        setTempAnswers(prev => ({
                          ...prev,
                          countries: checked
                            ? [...prev.countries.filter(c => !c.includes("Anywhere")), country]
                            : prev.countries.filter(c => c !== country)
                        }))
                      }}
                      disabled={tempAnswers.countries.includes("Anywhere in Europe") || 
                               tempAnswers.countries.includes("Anywhere in North America")}
                    />
                    <Label htmlFor={`country-${country}`}>{country}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skiing Level */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What are the skiing levels in your group?</Label>
            <div className="space-y-2">
              {['First timers', 'Beginners', 'Intermediates', 'Advanced'].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={tempAnswers.skiingLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      const newLevels = checked
                        ? [...tempAnswers.skiingLevels, level]
                        : tempAnswers.skiingLevels.filter((l) => l !== level);
                      setTempAnswers(prev => ({ ...prev, skiingLevels: newLevels }));
                    }}
                  />
                  <Label htmlFor={`level-${level}`}>{level}</Label>
                </div>
              ))}
            </div>

            {hasAdvancedSkiers(tempAnswers.skiingLevels) && (
              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Is having a snow park important?</Label>
                  <RadioGroup value={tempAnswers.snowPark} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, snowPark: value }))}>
                    {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`snowpark-${option}`} />
                        <Label htmlFor={`snowpark-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">How important is having off-piste possibilities?</Label>
                  <RadioGroup value={tempAnswers.offPiste} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, offPiste: value }))}>
                    {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`offpiste-${option}`} />
                        <Label htmlFor={`offpiste-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>

          {/* Budget Preference */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What&apos;s your budget preference?</Label>
            <RadioGroup value={tempAnswers.pricingSensitivity} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, pricingSensitivity: value }))}>
              {[
                'Flexible',
                'Budget-friendly',
                'Mid-range',
                'Luxury'
              ].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`pricing-${option}`} />
                  <Label htmlFor={`pricing-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Would anyone in your group like ski or snowboard lessons?</Label>
            <RadioGroup value={tempAnswers.lessons} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, lessons: value }))}>
              {['Yes', 'No'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`lessons-${option}`} />
                  <Label htmlFor={`lessons-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Nightlife */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">How important is nightlife and après-ski?</Label>
            <RadioGroup value={tempAnswers.nightlife} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, nightlife: value }))}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`nightlife-${option}`} />
                  <Label htmlFor={`nightlife-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Ski-in/Ski-out */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Do you prefer ski-in/ski-out resorts?</Label>
            <RadioGroup value={tempAnswers.skiInSkiOut} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, skiInSkiOut: value }))}>
              {['Yes, must have', 'Nice to have', "Don't care"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`skiinout-${option}`} />
                  <Label htmlFor={`skiinout-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Resort Preferences */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What&apos;s most important to you in a resort? Pick up to 3 things!</Label>
            <div className="space-y-2">
              {[
                'Extensive ski area',
                'Less crowded slopes',
                'Close to the airport',
                'Family-friendly',
                'Peaceful atmosphere',
                'Scenic beauty',
                'Modern lift system',
                'Snow sure- High altitude resort'
              ].map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={`preference-${preference}`}
                    checked={tempAnswers.resortPreferences.includes(preference)}
                    onCheckedChange={(checked) => {
                      if (checked && tempAnswers.resortPreferences.length < 3) {
                        setTempAnswers(prev => ({
                          ...prev,
                          resortPreferences: [...prev.resortPreferences, preference]
                        }))
                      } else if (!checked) {
                        setTempAnswers(prev => ({
                          ...prev,
                          resortPreferences: prev.resortPreferences.filter(p => p !== preference)
                        }))
                      }
                    }}
                    disabled={tempAnswers.resortPreferences.length >= 3 && !tempAnswers.resortPreferences.includes(preference)}
                  />
                  <Label htmlFor={`preference-${preference}`}>{preference}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Other Activities */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What other activities would you like to try?</Label>
            <div className="space-y-2">
              {[
                "Spa/wellness facilities",
                "Great food scene",
                "Cross-country skiing",
                "Winter hiking",
                "Heli Skiing",
                "Cat skiing",
                "Ski touring",
                "Night skiing",
                "Sledding/Toboganning"
              ].map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity}`}
                    checked={tempAnswers.otherActivities.includes(activity)}
                    onCheckedChange={(checked) => {
                      setTempAnswers(prev => ({
                        ...prev,
                        otherActivities: checked
                          ? [...prev.otherActivities, activity]
                          : prev.otherActivities.filter((a: string) => a !== activity)
                      }))
                    }}
                  />
                  <Label htmlFor={`activity-${activity}`}>{activity}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Time */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">When do you want to go skiing?</Label>
            <RadioGroup value={tempAnswers.travelTime} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, travelTime: value }))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month">I know the month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible">I&apos;m flexible</Label>
              </div>
            </RadioGroup>

            {tempAnswers.travelTime === 'month' && (
              <div className="mt-4 space-y-2">
                <Label className="text-md font-medium">Select Month(s)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['December', 'January', 'February', 'March', 'April'].map((month) => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${month}`}
                        checked={tempAnswers.travelMonth.includes(month)}
                        onCheckedChange={(checked) => {
                          setTempAnswers(prev => ({
                            ...prev,
                            travelMonth: checked
                              ? [...prev.travelMonth, month]
                              : prev.travelMonth.filter(m => m !== month)
                          }))
                        }}
                      />
                      <Label htmlFor={`month-${month}`}>{month}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Additional Information</Label>
            <Textarea
              placeholder="Tell us more about your perfect ski trip..."
              value={tempAnswers.additionalInfo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setTempAnswers(prev => ({ ...prev, additionalInfo: e.target.value }))
              }
              className="min-h-[100px]"
            />
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={() => {
              onUpdateAnswers(tempAnswers)
              const closeButton = document.querySelector('[aria-label="Close"]')
              if (closeButton instanceof HTMLButtonElement) closeButton.click()
            }}
          >
            Update Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Add this interface near the top with other interfaces
interface StoredResults {
  resorts: Resort[]
  timestamp: string
}

// Add these functions before the ResultsPage component
const RESULTS_STORAGE_KEY = 'ski_resort_results'

const saveResortsToStorage = (resorts: Resort[]) => {
  const storedData: StoredResults = {
    resorts,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(storedData))
}

// Update the areAnswersEqual function
const areAnswersEqual = (stored: StorageState['answers'], current: StorageState['answers']): boolean => {
  // Helper function to compare arrays regardless of order
  const compareArrays = (arr1: string[], arr2: string[]) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
    if (arr1.length !== arr2.length) return false
    const sorted1 = [...arr1].sort()
    const sorted2 = [...arr2].sort()
    return sorted1.every((item, index) => item === sorted2[index])
  }

  // Compare all fields exactly
  const fieldsMatch = (
    stored.groupType === current.groupType &&
    compareArrays(stored.childrenAges, current.childrenAges) &&
    stored.sportType === current.sportType &&
    compareArrays(stored.countries, current.countries) &&
    compareArrays(stored.skiingLevels, current.skiingLevels) &&
    stored.pricingSensitivity === current.pricingSensitivity &&
    stored.lessons === current.lessons &&
    stored.nightlife === current.nightlife &&
    stored.snowPark === current.snowPark &&
    stored.offPiste === current.offPiste &&
    stored.skiInSkiOut === current.skiInSkiOut &&
    compareArrays(stored.resortPreferences, current.resortPreferences) &&
    compareArrays(stored.otherActivities, current.otherActivities) &&
    stored.travelTime === current.travelTime &&
    compareArrays(stored.travelMonth, current.travelMonth) &&
    stored.additionalInfo === current.additionalInfo
  )

  console.log('Answers comparison result:', fieldsMatch)
  return fieldsMatch
}

// Update the getResortsFromStorage function
const getResortsFromStorage = async (currentAnswers: StorageState['answers']): Promise<Resort[] | null> => {
  const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY)
  const savedQuestionnaire = localStorage.getItem('ski_questionnaire_data')
  
  if (!savedResults || !savedQuestionnaire) return null
  
  try {
    const { resorts, timestamp } = JSON.parse(savedResults) as StoredResults
    const { answers: storedAnswers, lastUpdated } = JSON.parse(savedQuestionnaire) as StorageState

    // Compare timestamps - if questionnaire was updated after results were stored, force new API call
    const resultsTime = new Date(timestamp).getTime()
    const questionnaireTime = new Date(lastUpdated).getTime()
    
    if (questionnaireTime > resultsTime) {
      console.log('Questionnaire updated after last results - forcing new API call')
      return null
    }

    // Only proceed with stored resorts if the answers match exactly
    if (areAnswersEqual(storedAnswers, currentAnswers)) {
      const validatedResorts = await validateAgainstDatabase(resorts);
      return validatedResorts;
    }
    
    return null
  } catch (error) {
    console.error('Error parsing stored data:', error)
    return null
  }
}

// Add this interface near the top with other interfaces
interface ValidationResort {
  resort_name: string;
  homepage_url: string;
}

// Add this function before the ResultsPage component
const getResortUrl = async (resortName: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('ski_resorts_validation_list')
      .select('homepage_url')
      .ilike('resort_name', resortName)
      .single();

    if (error) {
      console.error('Error fetching resort URL:', error);
      return null;
    }

    return data?.homepage_url || null;
  } catch (error) {
    console.error('Error in getResortUrl:', error);
    return null;
  }
};

// Update the DBResort interface to match actual column names
interface DBResort {
  resort_name: string;
  country: string;
  homepage_url: string;
  weski?: string;
  crystal_ski?: string;
  iglu_ski?: string;
  skideal?: string;
}

// Update the validateAgainstDatabase function with correct column names
const validateAgainstDatabase = async (resorts: Resort[]): Promise<Resort[]> => {
  console.log('Starting database validation for resorts:', resorts);
  
  if (!resorts.length) {
    console.warn('No resorts to validate');
    return resorts;
  }

  try {
    console.log('Fetching validation list from Supabase...');
    
    const { data: validationList, error } = await supabase
      .from('ski_resorts_validation_list')
      .select('resort_name, homepage_url, weski, crystal_ski, iglu_ski, skideal');

    if (error) {
      console.error('Supabase error details:', error);
      return resorts;
    }

    if (!validationList) {
      console.warn('No validation list returned from database');
      return resorts;
    }

    console.log(`Found ${validationList.length} resorts in validation list`);

    return resorts.map(resort => {
      const match = validationList.find(v => 
        v.resort_name.toLowerCase() === resort.name.toLowerCase()
      );
      
      if (!match) {
        console.warn(`No match found for resort: ${resort.name}`);
        return resort;
      }
      
      console.log(`Found match for ${resort.name}:`, match);
      
      const updatedResort = {
        ...resort,
        homepage_url: match.homepage_url || undefined,
        tour_operators: {
          weski_url: match.weski,
          crystal_ski_url: match.crystal_ski,
          iglu_ski_url: match.iglu_ski,
          ski_deal_url: match.skideal
        }
      };
      
      console.log(`Updated resort data:`, updatedResort);
      return updatedResort;
    });

  } catch (error) {
    console.error('Detailed validation error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return resorts;
  }
};

// Remove the global declaration and just use the trackResortWebsiteClick function
const trackResortWebsiteClick = (resortName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'resort_website_click', {
      resort_name: resortName,
      event_category: 'outbound_link',
      event_label: resortName,
    })
  }
}

// Add this new component after other component definitions
const AnswersSummary = ({ answers }: { answers: StorageState['answers'] }) => {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded in sidebar

  const summaryGroups = [
    {
      title: "Group & Activity",
      items: [
        { label: "Group Type", value: answers.groupType },
        { label: "Children's Ages", value: answers.childrenAges?.length ? answers.childrenAges.join(", ") : "N/A" },
        { label: "Sport Type", value: answers.sportType },
      ]
    },
    {
      title: "Location & Timing",
      items: [
        { label: "Preferred Countries", value: answers.countries.join(", ") },
        { label: "Travel Time", value: answers.travelTime === 'month' ? `Specific months: ${answers.travelMonth.join(", ")}` : "Flexible" },
      ]
    },
    {
      title: "Skill Level & Preferences",
      items: [
        { label: "Skiing Levels", value: answers.skiingLevels.join(", ") },
        { label: "Lessons Needed", value: answers.lessons },
        { label: "Nightlife Preference", value: answers.nightlife },
        { label: "Snow Park", value: answers.snowPark },
        { label: "Off-Piste", value: answers.offPiste },
        { label: "Ski-in/Ski-out", value: answers.skiInSkiOut },
      ]
    },
    {
      title: "Additional Preferences",
      items: [
        { label: "Budget", value: answers.pricingSensitivity },
        { label: "Resort Priorities", value: answers.resortPreferences.join(", ") },
        { label: "Other Activities", value: answers.otherActivities.length ? answers.otherActivities.join(", ") : "None selected" },
      ]
    }
  ]

  return (
    <div className="space-y-4 text-sm lg:text-base">
      {summaryGroups.map((group, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
          <h3 className="font-semibold text-gray-700 mb-2">{group.title}</h3>
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex flex-wrap gap-1">
                <span className="text-gray-600">{item.label}:</span>
                <span className="text-gray-800 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Add this near the top with other constants
const SKI_FACTS = [
  'The word ski comes from the Old Norse word skíð meaning stick of wood',
  'The first ski lift was invented in 1908 by Robert Winterhalder in Germany',
  'Skiing was originally a mode of transport, used by ancient Nordic hunters',
  'The first Winter Olympics featuring skiing was held in 1924 in Chamonix, France',
  'Val Thorens is Europe\'s highest ski resort at 2,300m altitude',
  'Zermatt, Switzerland offers skiing 365 days a year on its glacier',
  'The longest ski run in Europe is 22km long, located in Alpe d\'Huez',
  'Courchevel was the first resort purpose-built for skiing in France',
  'St. Moritz hosted the Winter Olympics twice: in 1928 and 1948',
  'No two snowflakes are exactly alike due to their unique crystal formation',
  'Fresh powder snow is 97% air, making it perfect for skiing',
  'Snow appears white because of how light reflects off ice crystals',
  'The Alps generate 40% of Europe\'s fresh water from snowmelt',
  'Blue runs in Europe are equivalent to green runs in North America'
];

// Update the constants to include both regions
const REGIONS = {
  EUROPE: 'Europe',
  NORTH_AMERICA: 'North America'
} as const

const COUNTRIES_BY_REGION = {
  [REGIONS.EUROPE]: [
    'France',
    'Austria',
    'Switzerland',
    'Italy',
    'Germany',
    'Norway',
    'Sweden',
    'Spain',
    'Bulgaria',
    'Slovenia',
    'Czech Republic',
    'Poland',
    'Finland',
    'Andorra',
    'Greece'
  ],
  [REGIONS.NORTH_AMERICA]: [
    'United States',
    'Canada'
  ]
} as const

// Add these functions near the top with other utility functions

interface DBResort {
  resort_name: string;
  country: string;
  homepage_url: string;
  weski?: string;
  crystal_ski?: string;
  iglu_ski?: string;
  skideal?: string;
}

// Add type for the validation list filter function
interface ValidationListResort {
  resort_name: string;
  country: string;
  homepage_url: string;
}

// Update the getValidResortsForCountries function with correct column names
const getValidResortsForCountries = async (selectedCountries: string[]): Promise<DBResort[]> => {
  console.log('Phase 1 - Step 1: Getting valid resorts for countries:', selectedCountries);
  
  try {
    const { data, error } = await supabase
      .from('ski_resorts_validation_list')
      .select('resort_name, country, homepage_url, weski, crystal_ski, iglu_ski, skideal');

    if (error) throw error;
    const validationList = data as ValidationListResort[];

    // Filter resorts based on selected countries
    let filteredResorts: DBResort[] = [];
    if (selectedCountries.includes("Anywhere in Europe")) {
      filteredResorts = validationList.filter((resort: ValidationListResort) => 
        COUNTRIES_BY_REGION[REGIONS.EUROPE].includes(resort.country as EuropeanCountry)
      );
    } else if (selectedCountries.includes("Anywhere in North America")) {
      filteredResorts = validationList.filter((resort: ValidationListResort) => 
        COUNTRIES_BY_REGION[REGIONS.NORTH_AMERICA].includes(resort.country as NorthAmericanCountry)
      );
    } else {
      filteredResorts = validationList.filter((resort: ValidationListResort) => 
        selectedCountries.includes(resort.country)
      );
    }

    console.log(`Found ${filteredResorts.length} valid resorts in selected countries`);
    return filteredResorts;
  } catch (error) {
    console.error('Error fetching valid resorts:', error);
    throw error;
  }
}

// Function to modify the AI prompt with valid resorts
const modifyPromptWithValidResorts = (basePrompt: string, validResorts: DBResort[]): string => {
  console.log('Phase 2 - Step 1: Modifying prompt with valid resorts');
  
  const resortsList = validResorts.map(r => r.resort_name).join(', ');
  
  const modifiedPrompt = `
${basePrompt}

CRITICAL INSTRUCTIONS:
1. You MUST ONLY choose from the following resorts. These are the only valid resorts in our database:
${resortsList}

2. RANKING APPROACH:
   - First, try to find resorts that match ALL user preferences
   - If perfect matches aren't available, find resorts that match the MOST IMPORTANT criteria:
     a. Country/Location (this is non-negotiable)
     b. Skill level compatibility
     c. Group type suitability
     d. Budget considerations
   - For remaining criteria, choose resorts that partially match or offer reasonable alternatives

3. RESPONSE REQUIREMENTS:
   - Provide up to 3 best matching resorts
   - If fewer than 3 resorts are available, return all available resorts
   - For each resort, include a detailed explanation of why it was chosen and how it matches or differs from preferences
   - Order results from best match to acceptable alternative

4. IMPORTANT: Even if no resort perfectly matches all criteria, you MUST return the best available options from the provided list.

Remember: A partial match is better than no match. Focus on finding resorts that offer the best overall experience while meeting the most critical user requirements.
`;

  console.log('Modified prompt created with', validResorts.length, 'valid resorts');
  return modifiedPrompt;
}

// Update the TourOperatorCTA component with bigger logos
const TourOperatorCTA = ({ 
  name, 
  url, 
  favicon, 
  style 
}: { 
  name: string; 
  url: string; 
  favicon: string; 
  style: string;
}) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => {
      trackResortWebsiteClick(`${name} - ${url}`);
    }}
    className={`w-full bg-gradient-to-r ${style}
      text-white font-medium
      h-10 rounded-lg shadow-md 
      transform transition-all duration-300 
      hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]
      focus:outline-none focus:ring-2 focus:ring-offset-2
      active:translate-y-0 active:scale-[0.98]
      text-sm flex items-center`}
  >
    <div className="flex items-center justify-center w-full px-4 gap-2">
      <div className="w-6 h-6 flex-shrink-0 bg-white rounded-full p-1 flex items-center justify-center">
        <Image 
          src={favicon} 
          alt={`${name} logo`} 
          width={16}
          height={16}
          className="object-contain"
          onError={(e) => {
            // Hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <span className="flex-1 text-center">{name}</span>
    </div>
  </a>
);

export function ResultsPage() {
  const [resorts, setResorts] = useState<Resort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingCards, setLoadingCards] = useState<{ [key: number]: boolean }>({})
  const [seenResorts, setSeenResorts] = useState<Set<string>>(new Set())
  const [currentFact, setCurrentFact] = useState(SKI_FACTS[Math.floor(Math.random() * SKI_FACTS.length)])
  const [validationListCache, setValidationListCache] = useState<DBResort[] | null>(null);
  const [resultsSaved, setResultsSaved] = useState(false);
  
  const router = useRouter()
  const { complete } = useCompletion({
    api: '/api/chat',
  })

  // Add at the beginning of the component
  useEffect(() => {
    localStorage.setItem('has_viewed_results', 'true')
  }, [])

  // Keep only this optimized version of handleRemoveResort
  const handleRemoveResort = async (index: number) => {
    trackResortRemoval(resorts[index].name);
    try {
      setLoadingCards(prev => ({ ...prev, [index]: true }));
      
      const currentResortNames = resorts.map(r => r.name);
      setSeenResorts(prev => new Set([...prev, resorts[index].name]));
      
      const savedData = localStorage.getItem('ski_questionnaire_data');
      if (!savedData) throw new Error('No saved preferences found');
      
      const { answers } = JSON.parse(savedData) as StorageState;
      
      // Get valid resorts and construct prompt in parallel
      const excludeList = [...seenResorts, ...currentResortNames].join(', ');
      const [validResorts, basePrompt] = await Promise.all([
        getValidResortsForCountries(answers.countries),
        Promise.resolve(constructPrompt(answers))
      ]);

      const modifiedPrompt = modifyPromptWithValidResorts(
        basePrompt + `\nIMPORTANT: Do NOT suggest any of these resorts: ${excludeList}`,
        validResorts
      );
      
      const completion = await complete(modifiedPrompt);
      const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]';
      const parsedResorts = JSON.parse(cleanedCompletion);
      
      const validatedResorts = await processAndValidateResults([parsedResorts[0]], validResorts);
      
      if (validatedResorts.length === 0) {
        throw new Error('No valid resort found in our database');
      }

      setResorts(prev => {
        const updated = [...prev];
        updated[index] = validatedResorts[0];
        saveResortsToStorage(updated);
        return updated;
      });

    } catch (error) {
      setError('Failed to get new resort recommendation');
    } finally {
      setLoadingCards(prev => ({ ...prev, [index]: false }));
    }
  };

  // Remove extra closing brace from handlePreferenceUpdate
  const handlePreferenceUpdate = async (newAnswers: StorageState['answers']) => {
    trackSearchRefinement()
    try {
      setIsLoading(true)
      setError(null)
      setResultsSaved(false) // Reset the flag when updating preferences

      const storageData: StorageState = {
        answers: newAnswers,
        lastUpdated: new Date().toISOString(),
        currentStep: 15
      }
      localStorage.setItem('ski_questionnaire_data', JSON.stringify(storageData))

      const completion = await complete(constructPrompt(newAnswers))
      const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
      const parsedResorts = JSON.parse(cleanedCompletion)
      const validatedResorts = validateResorts(parsedResorts, newAnswers.countries)

      setResorts(validatedResorts)
      saveResortsToStorage(validatedResorts)
      
      await saveToDatabase(newAnswers, validatedResorts)
      setResultsSaved(true) // Set flag after saving

    } catch (error) {
      setError('Failed to update results. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }; // Add closing brace here

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedData = localStorage.getItem('ski_questionnaire_data');
        if (!savedData) {
          throw new Error('No questionnaire data found');
        }

        const { answers } = JSON.parse(savedData) as StorageState;
        const isDirectSelection = answers.additionalInfo?.startsWith('Show me information about ');

        // For direct selection, skip cache check
        if (!isDirectSelection) {
          const cachedResults = await getResortsFromStorage(answers);
          if (cachedResults) {
            console.log('Using cached results:', cachedResults);
            setResorts(cachedResults);
            setIsLoading(false);
            return;
          }
        }

        // Start parallel processing
        const [validResorts, basePrompt] = await Promise.all([
          getValidResortsForCountries(answers.countries),
          Promise.resolve(constructPrompt(answers))
        ]);

        if (validResorts.length === 0) {
          throw new Error('No resorts found in selected countries. Please try different countries.');
        }

        // Modify prompt with valid resorts
        const modifiedPrompt = modifyPromptWithValidResorts(basePrompt, validResorts);
        
        // Make AI API call
        const completion = await complete(modifiedPrompt);
        if (!completion) {
          throw new Error('No response from recommendation service');
        }

        // Parse and validate results
        const cleanedCompletion = completion.replace(/```json\n?|\n?```/g, '').trim();
        const parsedResorts = JSON.parse(cleanedCompletion);

        // For direct selection, ensure we only get one resort
        const resortsToProcess = isDirectSelection ? [parsedResorts] : parsedResorts;

        // First validate the resorts
        const finalResorts = await processAndValidateResults(resortsToProcess, validResorts);

        if (finalResorts.length === 0) {
          throw new Error('No valid resorts found matching your criteria');
        }

        // Only save to database if we haven't saved these results yet
        if (!resultsSaved) {
          await saveToDatabase(answers, finalResorts);
          setResultsSaved(true);
        }

        setResorts(finalResorts);
        if (!isDirectSelection) {
          saveResortsToStorage(finalResorts);
        }

      } catch (error) {
        console.error('Fetch Results Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to get resort recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [complete, resultsSaved]);

  // Add tracking when resorts are viewed
  useEffect(() => {
    if (resorts.length > 0) {
      resorts.forEach((resort: Resort) => {
        trackResortView(resort.name)
      })
    }
  }, [resorts])

  // Update the useEffect for ski facts
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isLoading) {
      // Get initial random fact without comparison
      const getRandomFact = () => {
        const randomIndex = Math.floor(Math.random() * SKI_FACTS.length);
        setCurrentFact(SKI_FACTS[randomIndex]);
      };

      // Set initial fact
      getRandomFact();
      
      // Set up interval
      intervalId = setInterval(getRandomFact, 6000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]); // Only depend on isLoading state

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
        <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Finding Your Perfect Ski Destinations</h1>
          
          {/* Improved Snowflake Spinner */}
          <div className="flex justify-center items-center mb-8">
            <div className="relative">
              <div className="snowflake-spinner">
                <div className="snowflake-glow"></div>
                <div className="snowflake-inner">
                  <Snowflake 
                    size={40}
                    strokeWidth={1.5}
                    className="transform -rotate-45"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-4 mb-12 text-gray-600">Analyzing your preferences...</p>
          
          <div className="mt-8 max-w-md mx-auto transform transition-all duration-500 hover:scale-102">
            <div className="bg-blue-50/80 rounded-xl p-6 border border-blue-200 shadow-md backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Did you know?
                </h3>
              </div>
              <div className="relative h-[80px] flex items-center justify-center">
                <p 
                  key={currentFact} 
                  className="text-gray-700 text-lg leading-relaxed font-medium animate-fade-in"
                  style={{
                    animation: 'fadeIn 1s ease-in-out',
                    maxWidth: '90%',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}
                >
                  {currentFact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden p-4">
        <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mr-4"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/questionnaire')}
              variant="outline"
              className="bg-white bg-opacity-50 text-gray-800 px-6 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Back to Questionnaire
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 relative pb-[88px]">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Search Criteria (hidden on mobile) */}
          <div className="hidden lg:block lg:w-1/5">
            <div className="sticky top-8">
              <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Criteria</h2>
                
                {/* Refine Search Button moved here */}
                <div className="mb-6">
                  <RefinementDialog 
                    currentAnswers={JSON.parse(localStorage.getItem('ski_questionnaire_data') || '{}').answers}
                    onUpdateAnswers={handlePreferenceUpdate}
                  />
                </div>

                {/* Search Criteria Summary */}
                <AnswersSummary 
                  answers={JSON.parse(localStorage.getItem('ski_questionnaire_data') || '{}').answers} 
                />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-md p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Your Perfect Ski Destinations</h1>
                  <p className="text-gray-600">Based on your preferences</p>
                </div>
                <div className="text-gray-600">
                  {resorts.length} results found
                </div>
              </div>
              
              {/* Mobile Refine Search Button - moved here */}
              <div className="lg:hidden mt-4">
                <RefinementDialog 
                  currentAnswers={JSON.parse(localStorage.getItem('ski_questionnaire_data') || '{}').answers}
                  onUpdateAnswers={handlePreferenceUpdate}
                />
              </div>
            </div>

            {/* Results Cards */}
            <div className="space-y-4">
              {resorts.map((resort, index) => (
                <div key={index} className="transition-all duration-300">
                  {loadingCards[index] ? (
                    <LoadingCard />
                  ) : (
                    <ResortCard 
                      resort={resort} 
                      rank={index === 0 ? 'Best Match' : index === 1 ? 'Perfect Alternative' : 'Surprise Pick'} 
                      onRemove={() => handleRemoveResort(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap the component with click tracking
export default withClickTracking(ResultsPage, 'Results');

// Helper function remains outside the component
const hasAdvancedSkiers = (skiingLevels: string[]): boolean => {
  return skiingLevels.some(level => 
    level === 'Intermediates' || level === 'Advanced'
  )
}
