/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useState, useEffect } from 'react'
import { useCompletion } from 'ai/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Snowflake, Users, Mountain, Martini, MapPin, X, Filter } from 'lucide-react'
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
    pricingSensitivity: string
  }
  lastUpdated: string
  currentStep: number
}

type SnowCondition = "Powder" | "Groomed" | "Packed" | "Ice" | "Spring"

interface Resort {
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

const LoadingCard = () => (
  <Card className="relative bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
    transition-all duration-300 min-h-[600px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Finding new resort...</p>
    </div>
  </Card>
)

const ResortCard = ({ resort, rank, onRemove }: { resort: Resort, rank: string, onRemove: () => void }) => {
  return (
    <Card className="relative bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
      transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10
      flex flex-col min-h-[800px]">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 
          transition-colors z-20"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex-1">
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2 flex-1">
              <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                  {rank}
                </Badge>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={`cursor-help transition-colors ${getPricingBadgeStyle(resort.pricing?.sixDayPass)}`}
                      >
                        {getPricingLabel(resort.pricing?.sixDayPass)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="bg-white text-gray-800 border border-gray-200 p-2 z-50 shadow-lg"
                      sideOffset={5}
                      avoidCollisions={true}
                    >
                      <p className="text-sm max-w-[200px]">{getPricingTooltip(resort.pricing?.sixDayPass)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-3 h-3 mr-1" /> 
            {resort.location}, {resort.country}
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

        <CardContent className="p-6 pt-2">
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
          
          <div className="col-span-2 mt-6 bg-green-50 rounded-lg p-3 border border-green-100">
            <span className="text-green-600 font-semibold block mb-2">Lift Pass Pricing:</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">Daily Pass:</span>
                <p className="text-gray-800 font-medium">{resort.pricing?.dailyPass}</p>
              </div>
              <div>
                <span className="text-gray-600">6-Day Pass:</span>
                <p className="text-gray-800 font-medium">{resort.pricing?.sixDayPass}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="p-6 mt-auto">
        <a
          href={resort.website || `https://www.google.com/search?q=${encodeURIComponent(resort.name + ' ski resort')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackResortWebsiteClick(resort.name)
          }}
          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700 text-white font-semibold 
            rounded-full px-6 py-3.5 shadow-lg transform transition-all duration-300 
            hover:shadow-blue-400/30 hover:shadow-xl hover:-translate-y-1
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            active:translate-y-0"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Book Your Ski Trip</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
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
          </div>
        </a>
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
  console.log('Validating resorts:', resorts);
  console.log('Selected countries:', selectedCountries);

  if (!Array.isArray(resorts)) {
    console.error('Invalid resort data received:', resorts);
    return [];
  }

  // Basic data validation with more detailed logging
  const isValidResort = (resort: Resort): boolean => {
    const requiredFields = {
      name: typeof resort.name === 'string',
      location: typeof resort.location === 'string',
      country: typeof resort.country === 'string',
      difficulty: resort.difficulty && typeof resort.difficulty === 'object' &&
        typeof resort.difficulty.easy === 'number' &&
        typeof resort.difficulty.intermediate === 'number' &&
        typeof resort.difficulty.advanced === 'number',
      runs: resort.runs && typeof resort.runs === 'object' &&
        typeof resort.runs.easy === 'number' &&
        typeof resort.runs.intermediate === 'number' &&
        typeof resort.runs.advanced === 'number',
      skiArea: typeof resort.skiArea === 'string',
      nightlife: ['Vibrant', 'Moderate', 'Quiet'].includes(resort.nightlife),
      highlights: Array.isArray(resort.highlights)
    };

    const invalidFields = Object.entries(requiredFields)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      console.error('Invalid fields for resort:', resort.name, invalidFields);
    }

    return Object.values(requiredFields).every(Boolean);
  };

  // Filter out invalid resorts and ensure required fields
  const validResorts = resorts.map(resort => ({
    ...resort,
    nightlife: ['Vibrant', 'Moderate', 'Quiet'].includes(resort.nightlife) 
      ? resort.nightlife 
      : 'Moderate',
    pricing: resort.pricing || { dailyPass: 'N/A', sixDayPass: 'N/A' },
    snow_condition: resort.snow_condition || 'Packed',
    villageAltitude: resort.villageAltitude || 'N/A',
    skiRange: resort.skiRange || 'N/A',
    numberOfLifts: resort.numberOfLifts || 0,
    website: resort.website || `https://www.google.com/search?q=${encodeURIComponent(resort.name + ' ski resort')}`
  })).filter(isValidResort);

  console.log('Valid resorts after basic validation:', validResorts);

  if (validResorts.length === 0) {
    console.error('No valid resort data found');
    return [];
  }

  // If "Anywhere in Europe" is selected or no specific countries selected, 
  // return all valid resorts since they're all European anyway
  if (selectedCountries.includes("Anywhere in Europe") || selectedCountries.length === 0) {
    console.log('Returning all valid resorts for Anywhere in Europe');
    return validResorts;
  }

  // Filter by specific countries if selected
  const countryMatchedResorts = validResorts.filter(resort => 
    selectedCountries.includes(resort.country)
  );

  console.log('Country matched resorts:', countryMatchedResorts);

  // If no matches found for specific countries, return all valid resorts
  if (countryMatchedResorts.length === 0) {
    console.log('No country matches found, returning all valid resorts');
    return validResorts;
  }

  return countryMatchedResorts;
}

// API prompt construction
const constructPrompt = (answers: StorageState['answers']): string => {
  // Define budget-friendly countries in order of affordability
  const budgetFriendlyCountries = [
    'Bulgaria', 'Serbia', 'Poland', 'Romania', 'Bosnia and Herzegovina',
    'Slovakia', 'Czech Republic', 'Montenegro', 'Slovenia', 'Andorra'
  ];

  // Define luxury resort destinations
  const luxuryDestinations = [
    'Courchevel', 'Zermatt', 'St. Moritz', 'Verbier', 'Gstaad',
    'Lech-Zürs', 'Kitzbühel', 'Megève', 'Val d\'Isère', 'Cortina d\'Ampezzo'
  ];

  const isLuxuryFocused = answers.pricingSensitivity === 'Looking specifically for luxury destinations';
  const isBudgetFriendly = answers.pricingSensitivity === 'Very important - I\'d prefer destinations known for lower overall costs';

  const pricingGuidance = isLuxuryFocused
    ? `CRITICAL LUXURY REQUIREMENT: User specifically requested luxury destinations.
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
       - Daily lift passes should be in the premium range (€80+)
       - Focus on resorts with luxury accommodation options
       - Include resorts known for their wealthy clientele
       
       SUGGESTED LUXURY DESTINATIONS (if matching selected countries):
       ${luxuryDestinations.join(', ')}`
    : isBudgetFriendly
      ? `CRITICAL BUDGET CONSIDERATION: User specifically requested budget-friendly options.
         YOU MUST PRIORITIZE resorts from these specific countries in this exact order:
         1. Bulgaria (most affordable)
         2. Serbia
         3. Poland
         4. Romania
         5. Bosnia and Herzegovina
         6. Slovakia
         7. Czech Republic
         8. Montenegro
         9. Slovenia
         10. Andorra
         
         STRICT REQUIREMENTS:
         - Your first recommendation MUST be from Bulgaria, Serbia, or Poland
         - Your second recommendation MUST be from one of the other listed countries
         - Your third recommendation can be from any of these countries`
      : `STANDARD PRICING GUIDANCE: Focus on resorts that provide good value while meeting the user's quality expectations.
         Consider:
         - Mid-range lift pass prices
         - Mix of accommodation options
         - Reasonable equipment rental costs
         - Balanced food and drink prices
         - Good quality-to-price ratio for facilities`

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
1. LOCATION REQUIREMENT: ${answers.countries?.includes("Anywhere in Europe")
     ? "User is open to any European resort that matches their preferences. ONLY suggest resorts from European countries."
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

4. DIVERSE SUGGESTIONS: While maintaining focus on established resorts, provide:
   ${answers.countries?.includes("Anywhere in Europe")
     ? isBudgetFriendly
       ? `- First resort MUST be from Bulgaria, Serbia, or Poland
          - Second resort MUST be from another budget-friendly country listed above
          - Third resort MUST also be from the budget-friendly countries list`
       : `- Three different resorts with distinct characteristics
          - Mix of resort sizes and atmospheres
          - Variety of terrain types`
     : `- Three different resorts from ${answers.countries?.join(', ')}, prioritizing the most affordable options`}

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

Please provide exactly three resort recommendations in valid JSON format.
${pricingGuidance}
... (rest of your existing prompt) ...`
}

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
        additional_info: answers.additionalInfo,
        pricing_sensitivity: answers.pricingSensitivity
      }])
      .select()

    if (questionnaireError) {
      throw new Error(`Error saving questionnaire: ${questionnaireError.details || questionnaireError.message}`)
    }

    // Only save the best match (first resort)
    const bestMatch = resorts[0]
    const questionnaireId = questionnaireData[0].id
    
    // Calculate price tag based on six day pass price
    let priceTag = "Unknown"
    if (bestMatch.pricing?.sixDayPass) {
      const price = parseFloat(bestMatch.pricing.sixDayPass.replace(/[€$£]/g, ''))
      if (price <= 200) {
        priceTag = "Budget"
      } else if (price <= 300) {
        priceTag = "Mid-Range"
      } else {
        priceTag = "Premium"
      }
    }

    console.log('Saving resort with price tag:', priceTag)
    console.log('Six day pass price:', bestMatch.pricing?.sixDayPass)
    
    const { error: resortError } = await supabase
      .from('resort_recommendations')
      .insert([{
        questionnaire_id: questionnaireId,
        name: bestMatch.name,
        location: bestMatch.location,
        country: bestMatch.country,
        difficulty: bestMatch.difficulty,
        runs: bestMatch.runs,
        ski_area: bestMatch.skiArea,
        number_of_lifts: bestMatch.numberOfLifts,
        village_altitude: bestMatch.villageAltitude,
        ski_range: bestMatch.skiRange,
        nightlife: bestMatch.nightlife,
        highlights: bestMatch.highlights,
        explanation: bestMatch.explanation,
        daily_pass_price: bestMatch.pricing?.dailyPass,
        six_day_pass_price: bestMatch.pricing?.sixDayPass,
        match_tag: 'Best Match',
        price_tag: priceTag  // Make sure this matches your column name exactly
      }])

    if (resortError) {
      console.error('Error saving resort:', resortError)
      throw new Error(`Error saving resort: ${resortError.details || resortError.message}`)
    }
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

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
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
          text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 transition-all duration-300 
          hover:shadow-blue-400/30 hover:shadow-xl"
        >
          <Filter className="w-4 h-4" />
          Refine Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refine Your Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Group Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Group Type</Label>
            <RadioGroup value={tempAnswers.groupType} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, groupType: value }))}>
              {['Couple', 'Group of friends', 'Family with children', 'Family without children', 'Mixed group family & friends'].map((option) => (
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

          {/* Add Pricing Sensitivity section before Sport Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Budget Preference</Label>
            <RadioGroup 
              value={tempAnswers.pricingSensitivity} 
              onValueChange={(value) => setTempAnswers(prev => ({ ...prev, pricingSensitivity: value }))}
            >
              {[
                'Very important - I\'d prefer destinations known for lower overall costs',
                'Not important - I\'ll find suitable accommodation in any destination',
                'Looking specifically for luxury destinations'
              ].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`pricing-${option}`} />
                  <Label htmlFor={`pricing-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Sport Type */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Sport Type</Label>
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
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Preferred Countries</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Anywhere in Europe',
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
              ].map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country}`}
                    checked={tempAnswers.countries.includes(country)}
                    onCheckedChange={(checked) => {
                      let newCountries: string[];
                      if (country === 'Anywhere in Europe') {
                        newCountries = checked ? ['Anywhere in Europe'] : [];
                      } else {
                        if (checked) {
                          newCountries = [
                            ...tempAnswers.countries.filter(c => c !== 'Anywhere in Europe'),
                            country
                          ];
                        } else {
                          newCountries = tempAnswers.countries.filter(c => c !== country);
                          if (newCountries.length === 0) {
                            newCountries = ['Anywhere in Europe'];
                          }
                        }
                      }
                      setTempAnswers(prev => ({ ...prev, countries: newCountries }));
                    }}
                  />
                  <Label htmlFor={`country-${country}`}>{country}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Skiing Level */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Skiing Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {['First timers', 'Beginners', 'Intermediates', 'Advanced'].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={tempAnswers.skiingLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      setTempAnswers(prev => ({
                        ...prev,
                        skiingLevels: checked 
                          ? [...prev.skiingLevels, level]
                          : prev.skiingLevels.filter(l => l !== level)
                      }))
                    }}
                  />
                  <Label htmlFor={`level-${level}`}>{level}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Resort Size */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Resort Size</Label>
            <RadioGroup
              value={tempAnswers.slopePreferences[0]}
              onValueChange={(value) => {
                setTempAnswers(prev => ({
                  ...prev,
                  slopePreferences: [value]
                }))
              }}
            >
              {['Small and charming', 'Medium-sized resort', 'Large ski area', "I don't mind"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <RadioGroupItem value={size} id={`size-${size}`} />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Lessons Needed</Label>
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
            <Label className="text-lg font-semibold">Nightlife Importance</Label>
            <RadioGroup value={tempAnswers.nightlife} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, nightlife: value }))}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`nightlife-${option}`} />
                  <Label htmlFor={`nightlife-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Snow Park */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Snow Park Importance</Label>
            <RadioGroup value={tempAnswers.snowPark} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, snowPark: value }))}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`snowpark-${option}`} />
                  <Label htmlFor={`snowpark-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Off-Piste */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Off-Piste Importance</Label>
            <RadioGroup value={tempAnswers.offPiste} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, offPiste: value }))}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`offpiste-${option}`} />
                  <Label htmlFor={`offpiste-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Ski-in/Ski-out */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Ski-in/Ski-out Preference</Label>
            <RadioGroup value={tempAnswers.skiInSkiOut} onValueChange={(value) => setTempAnswers(prev => ({ ...prev, skiInSkiOut: value }))}>
              {['Yes, must have', 'Nice to have', "Don't care"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`skiinout-${option}`} />
                  <Label htmlFor={`skiinout-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Important Features */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Most Important Features (Pick up to 3)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Extensive ski area',
                'Less crowded slopes',
                'Close to the airport',
                'Family-friendly',
                'Peaceful atmosphere',
                'Scenic beauty',
                'Modern lift system',
                'Snow sure- High altitude resort'
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={tempAnswers.resortPreferences.includes(feature)}
                    onCheckedChange={(checked) => {
                      setTempAnswers(prev => ({
                        ...prev,
                        resortPreferences: checked
                          ? [...prev.resortPreferences, feature].slice(0, 3)
                          : prev.resortPreferences.filter(f => f !== feature)
                      }))
                    }}
                    disabled={
                      tempAnswers.resortPreferences.length >= 3 && 
                      !tempAnswers.resortPreferences.includes(feature)
                    }
                  />
                  <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Time */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">When do you want to go?</Label>
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

// Add this function to compare answers
const areAnswersEqual = (stored: StorageState['answers'], current: StorageState['answers']): boolean => {
  // Helper function to compare arrays regardless of order
  const compareArrays = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    const sorted1 = [...arr1].sort()
    const sorted2 = [...arr2].sort()
    return sorted1.every((item, index) => item === sorted2[index])
  }

  // Compare all relevant fields
  return (
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
    compareArrays(stored.slopePreferences, current.slopePreferences) &&
    compareArrays(stored.otherActivities, current.otherActivities) &&
    stored.lovedResorts === current.lovedResorts &&
    stored.travelTime === current.travelTime &&
    compareArrays(stored.travelMonth, current.travelMonth) &&
    stored.additionalInfo === current.additionalInfo
  )
}

// Update the getResortsFromStorage function to include answer comparison
const getResortsFromStorage = (currentAnswers: StorageState['answers']): Resort[] | null => {
  const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY)
  const savedQuestionnaire = localStorage.getItem('ski_questionnaire_data')
  
  if (!savedResults || !savedQuestionnaire) return null
  
  try {
    const { resorts } = JSON.parse(savedResults) as StoredResults
    const { answers: storedAnswers } = JSON.parse(savedQuestionnaire) as StorageState

    // Only return stored resorts if the answers match exactly
    if (areAnswersEqual(storedAnswers, currentAnswers)) {
      return resorts
    }
    
    // If answers don't match, return null to trigger new API call
    return null
  } catch (error) {
    console.error('Error parsing stored data:', error)
    return null
  }
}

// Update the interface to match your actual table structure
interface ValidationResort {
  resort_name: string
}

// Simplified validation function that only checks resort names
const validateAgainstDatabase = async (resorts: Resort[]): Promise<Resort[]> => {
  try {
    const { data: validationList, error } = await supabase
      .from('ski_resorts_validation_list')
      .select('resort_name')

    if (error) {
      console.error('Error fetching validation list:', error)
      return resorts
    }

    const fuseOptions = {
      includeScore: true,
      threshold: 0.3,  // 70% similarity
      keys: ['resort_name']
    }
    const fuse = new Fuse(validationList, fuseOptions)

    const validatedResorts = resorts.map(resort => {
      const matches = fuse.search(resort.name)
      const bestMatch = matches[0]
      
      if (bestMatch && bestMatch.score && bestMatch.score < 0.3) {
        // Create a new resort object with the exact name from the database
        return {
          ...resort,
          name: bestMatch.item.resort_name  // Use the exact name from database
        }
      }
      return null
    }).filter((resort): resort is Resort => resort !== null)

    console.log('Resorts after validation:', validatedResorts)
    return validatedResorts

  } catch (error) {
    console.error('Error in validation process:', error)
    return resorts
  }
}

// Add this function to track website clicks
const trackResortWebsiteClick = (resortName: string) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'resort_website_click', {
      resort_name: resortName,
      event_category: 'outbound_link',
      event_label: resortName,
    })
  }
}

export default function ResultsPage() {
  const [resorts, setResorts] = useState<Resort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingCards, setLoadingCards] = useState<{ [key: number]: boolean }>({})
  const [seenResorts, setSeenResorts] = useState<Set<string>>(new Set())
  const router = useRouter()

  const { complete } = useCompletion({
    api: '/api/chat',
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Check for questionnaire data first
        const savedData = localStorage.getItem('ski_questionnaire_data')
        if (!savedData) {
          router.push('/questionnaire')
          return
        }

        let parsedData: StorageState
        try {
          parsedData = JSON.parse(savedData)
          console.log('Parsed questionnaire data:', parsedData)
        } catch (e) {
          console.error('Error parsing localStorage data:', e)
          setError('Error loading your preferences. Please try again.')
          router.push('/questionnaire')
          return
        }

        const { answers } = parsedData

        // Check for stored results that match current answers
        const storedResorts = getResortsFromStorage(answers)
        if (storedResorts) {
          console.log('Using stored resort results - answers match exactly')
          setResorts(storedResorts)
          setIsLoading(false)
          return
        }

        // If no matching stored results, proceed with API call
        console.log('Fetching new results from API - answers have changed')
        try {
          const completion = await complete(constructPrompt(answers))
          console.log('Raw AI response:', completion)
          
          const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
          console.log('Cleaned AI response:', cleanedCompletion)
          
          let parsedResorts: Resort[]
          try {
            parsedResorts = JSON.parse(cleanedCompletion)
            console.log('Parsed resorts:', parsedResorts)
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
            throw new Error('Unable to process resort recommendations')
          }
          
          if (!Array.isArray(parsedResorts) || parsedResorts.length === 0) {
            console.error('Invalid or empty resorts array:', parsedResorts)
            throw new Error('No resort recommendations received')
          }

          const validatedResorts = validateResorts(parsedResorts, answers.countries)
          console.log('Validated resorts:', validatedResorts)
          
          if (validatedResorts.length === 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Using mock data as fallback')
              const validatedMockResorts = validateResorts(mockResorts, answers.countries)
              setResorts(validatedMockResorts)
              saveResortsToStorage(validatedMockResorts) // Save mock resorts
            } else {
              throw new Error('No resorts match your selected countries')
            }
          } else {
            setResorts(validatedResorts)
            saveResortsToStorage(validatedResorts) // Save real resorts
          }
          
          try {
            await saveToDatabase(answers, validatedResorts)
          } catch (dbError) {
            console.error('Database error:', dbError)
          }

        } catch (apiError) {
          console.error('API Error:', apiError)
          setError('Unable to get resort recommendations. Please try again.')
          
          if (process.env.NODE_ENV === 'development') {
            const validatedMockResorts = validateResorts(mockResorts, answers.countries)
            setResorts(validatedMockResorts)
            saveResortsToStorage(validatedMockResorts) // Save mock resorts
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [complete, router])

  const handleRemoveResort = async (index: number) => {
    trackResortRemoval(resorts[index].name)
    try {
      setLoadingCards(prev => ({ ...prev, [index]: true }))
      
      const currentResortNames = resorts.map(r => r.name)
      setSeenResorts(prev => new Set([...prev, resorts[index].name]))
      
      const savedData = localStorage.getItem('ski_questionnaire_data')
      if (!savedData) throw new Error('No saved preferences found')
      
      const { answers } = JSON.parse(savedData) as StorageState
      
      const excludeList = [...seenResorts, ...currentResortNames].join(', ')
      const modifiedPrompt = constructPrompt(answers) + `\nIMPORTANT: Do NOT suggest any of these resorts: ${excludeList}`
      
      const completion = await complete(modifiedPrompt)
      const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
      const parsedResorts = JSON.parse(cleanedCompletion)
      
      // Validate structure first
      let validatedResorts = validateResorts([parsedResorts[0]], answers.countries)
      
      // Then validate against database
      validatedResorts = await validateAgainstDatabase(validatedResorts)
      
      if (validatedResorts.length === 0) {
        throw new Error('No valid resort found in our database')
      }

      setResorts(prev => {
        const updated = [...prev]
        updated[index] = validatedResorts[0]
        saveResortsToStorage(updated)
        return updated
      })

    } catch (error) {
      setError('Failed to get new resort recommendation')
    } finally {
      setLoadingCards(prev => ({ ...prev, [index]: false }))
    }
  }

  // Update handlePreferenceUpdate to save changes
  const handlePreferenceUpdate = async (newAnswers: StorageState['answers']) => {
    trackSearchRefinement()
    try {
      setIsLoading(true)
      setError(null)

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
      saveResortsToStorage(validatedResorts) // Save new resorts
      
      await saveToDatabase(newAnswers, validatedResorts)

    } catch (error) {
      setError('Failed to update results. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Add tracking when resorts are viewed
  useEffect(() => {
    if (resorts.length > 0) {
      resorts.forEach(resort => {
        trackResortView(resort.name)
      })
    }
  }, [resorts])

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
          <p className="text-gray-600 mb-6">Based on your preferences, we&apos;ve found these amazing matches</p>
          {!isLoading && !error && (
            <div className="flex justify-center">
              <RefinementDialog 
                currentAnswers={JSON.parse(localStorage.getItem('ski_questionnaire_data') || '{}').answers}
                onUpdateAnswers={handlePreferenceUpdate}
              />
            </div>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative group">
          {resorts.map((resort, index) => (
            <div key={index} className="transition-all duration-300 group-hover:opacity-50 hover:!opacity-100">
              {loadingCards[index] ? (
                <LoadingCard />
              ) : (
                <ResortCard 
                  resort={resort} 
                  rank={index === 0 ? 'Best Match' : index === 1 ? 'Hidden Gem' : 'Local Favorite'} 
                  onRemove={() => handleRemoveResort(index)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
