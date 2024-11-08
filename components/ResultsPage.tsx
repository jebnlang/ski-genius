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
import { Textarea } from "@/components/ui/textarea"

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
  homepage_url?: string
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

// Update the BookingCTA component
const BookingCTA = ({ resort }: { resort: Resort }) => {
  return (
    <div className="flex-shrink-0 w-full md:w-48 flex items-center justify-center p-4 md:px-4 border-t md:border-t-0 md:border-l border-gray-200">
      <a
        href={resort.homepage_url || resort.website || `https://www.google.com/search?q=${encodeURIComponent(resort.name + ' ski resort')}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackResortWebsiteClick(resort.name);
        }}
        className="w-full bg-white bg-opacity-40 border border-white backdrop-blur-md
          hover:bg-opacity-60 text-gray-800 font-semibold 
          rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 
          hover:shadow-xl hover:-translate-y-1 hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          active:translate-y-0 text-sm flex items-center justify-center gap-2"
      >
        <span>Book Now</span>
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
    </div>
  );
};

// Update the ResortCard component
const ResortCard = ({ resort, rank, onRemove }: { resort: Resort, rank: string, onRemove: () => void }) => {
  return (
    <Card className="relative bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
      transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10
      flex flex-col md:flex-row min-h-[180px]">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 
          transition-colors z-20"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 p-3 md:p-4 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-1">
            <div className="flex flex-col sm:flex-row items-start gap-1 flex-1">
              <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm">
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

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-3 h-3 mr-1" /> 
            {resort.location}, {resort.country}
          </div>

          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100 mb-2">
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

          {resort.explanation && (
            <p className="text-sm text-gray-700 italic">{resort.explanation}</p>
          )}
        </div>

        <div className="flex-1 p-3 md:p-4 flex flex-col">
          <div className="space-y-2 flex-1">
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
        </div>
      </div>

      <BookingCTA resort={resort} />
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
      highlights: Array.isArray(resort.highlights),
      website: typeof resort.website === 'string'
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
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Where would you like to ski?</Label>
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
    stored.travelTime === current.travelTime && // Fixed: Compare as strings
    compareArrays(stored.travelMonth, current.travelMonth) &&
    stored.additionalInfo === current.additionalInfo
  )
}

// Update the getResortsFromStorage function
const getResortsFromStorage = async (currentAnswers: StorageState['answers']): Promise<Resort[] | null> => {
  const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY)
  const savedQuestionnaire = localStorage.getItem('ski_questionnaire_data')
  
  if (!savedResults || !savedQuestionnaire) return null
  
  try {
    const { resorts } = JSON.parse(savedResults) as StoredResults
    const { answers: storedAnswers } = JSON.parse(savedQuestionnaire) as StorageState

    // Only proceed with stored resorts if the answers match exactly
    if (areAnswersEqual(storedAnswers, currentAnswers)) {
      // Validate stored resorts against database
      const validatedResorts = await validateAgainstDatabase(resorts);
      return validatedResorts;
    }
    
    // If answers don't match, return null to trigger new API call
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

// Update the validateAgainstDatabase function
const validateAgainstDatabase = async (resorts: Resort[]): Promise<Resort[]> => {
  try {
    console.log('Starting database validation for resorts:', resorts.map(r => r.name));

    const { data: validationList, error } = await supabase
      .from('ski_resorts_validation_list')
      .select('resort_name, homepage_url');

    if (error) {
      console.error('Error fetching validation list:', error);
      return resorts;
    }

    if (!validationList || validationList.length === 0) {
      console.error('No validation data received from database');
      return resorts;
    }

    console.log(`Found ${validationList.length} resorts in validation list`);

    // Create maps for different types of matches
    const exactMatchMap = new Map(
      validationList.map(item => [item.resort_name.toLowerCase(), item])
    );

    const partialMatchMap = new Map(
      validationList.map(item => [item.resort_name.toLowerCase().replace(/[^a-z0-9]/g, ''), item])
    );

    const validatedResorts = await Promise.all(resorts.map(async (resort) => {
      const resortName = resort.name.toLowerCase();
      const cleanResortName = resortName.replace(/[^a-z0-9]/g, '');
      
      console.log(`\nValidating resort: ${resort.name}`);

      // Try exact match first
      const exactMatch = exactMatchMap.get(resortName);
      if (exactMatch) {
        console.log('Found exact match:', exactMatch);
        return {
          ...resort,
          name: exactMatch.resort_name,
          website: exactMatch.homepage_url
        };
      }

      // Try partial matches with cleaned names
      const partialMatch = Array.from(partialMatchMap.entries()).find(([key, value]) => 
        key.includes(cleanResortName) || cleanResortName.includes(key)
      );
      
      if (partialMatch) {
        console.log('Found partial match:', partialMatch[1]);
        return {
          ...resort,
          name: partialMatch[1].resort_name,
          website: partialMatch[1].homepage_url
        };
      }

      // Try fuzzy matching as a last resort
      const fuse = new Fuse(validationList, {
        keys: ['resort_name'],
        threshold: 0.3, // Lower threshold for stricter matching
        includeScore: true
      });

      const fuzzyMatches = fuse.search(resort.name);
      if (fuzzyMatches.length > 0 && fuzzyMatches[0].score && fuzzyMatches[0].score < 0.6) {
        console.log('Found fuzzy match:', fuzzyMatches[0].item);
        return {
          ...resort,
          name: fuzzyMatches[0].item.resort_name,
          website: fuzzyMatches[0].item.homepage_url
        };
      }

      // If no match found, try one final direct database query
      const { data: directMatch } = await supabase
        .from('ski_resorts_validation_list')
        .select('resort_name, homepage_url')
        .ilike('resort_name', `%${resort.name}%`)
        .limit(1)
        .single();

      if (directMatch) {
        console.log('Found direct database match:', directMatch);
        return {
          ...resort,
          name: directMatch.resort_name,
          website: directMatch.homepage_url
        };
      }

      console.log('No match found for:', resort.name);
      return {
        ...resort,
        website: `https://www.google.com/search?q=${encodeURIComponent(resort.name + ' ski resort')}`
      };
    }));

    // Log results for debugging
    validatedResorts.forEach(resort => {
      console.log(`Resort: ${resort.name}`);
      console.log(`Website: ${resort.website}`);
      console.log(`Is fallback URL: ${resort.website.includes('google.com')}`);
    });

    return validatedResorts;

  } catch (error) {
    console.error('Error in validation process:', error);
    return resorts;
  }
};

// First, add this interface near the top of the file with other interfaces
interface WindowWithGtag extends Window {
  gtag: (
    command: string,
    target: string,
    config?: {
      resort_name?: string;
      event_category?: string;
      event_label?: string;
      [key: string]: unknown;
    }
  ) => void;
}

// Then update the trackResortWebsiteClick function to use the proper typing
const trackResortWebsiteClick = (resortName: string) => {
  if (typeof window !== 'undefined') {
    window.gtag('event', 'resort_website_click', {
      resort_name: resortName,
      event_category: 'outbound_link',
      event_label: resortName,
    });
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
        const storedResorts = await getResortsFromStorage(answers)
        if (storedResorts) {
          console.log('Using stored resort results - answers match exactly')
          
          // Add URL validation even for stored results
          const validatedResorts = await validateAgainstDatabase(storedResorts)
          setResorts(validatedResorts)
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

          // Ensure URLs are fetched for new results
          const validatedResorts = await validateAgainstDatabase(parsedResorts)
          setResorts(validatedResorts)
          saveResortsToStorage(validatedResorts)
          
          try {
            await saveToDatabase(answers, validatedResorts)
          } catch (dbError) {
            console.error('Database error:', dbError)
          }

        } catch (apiError) {
          console.error('API Error:', apiError)
          setError('Unable to get resort recommendations. Please try again.')
          
          if (process.env.NODE_ENV === 'development') {
            const mockValidatedResorts = await validateAgainstDatabase(mockResorts)
            setResorts(mockValidatedResorts)
            saveResortsToStorage(mockValidatedResorts)
          }
        }
      } catch (error) {
        console.error('Fetch results error:', error)
        setError('An error occurred while loading results')
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Your Perfect Ski Destinations</h1>
          <p className="text-gray-600 mb-4">Based on your preferences, we&apos;ve found these amazing matches</p>
          {!isLoading && !error && (
            <div className="flex justify-center">
              <RefinementDialog 
                currentAnswers={JSON.parse(localStorage.getItem('ski_questionnaire_data') || '{}').answers}
                onUpdateAnswers={handlePreferenceUpdate}
              />
            </div>
          )}
        </div>
        
        <div className="grid gap-4 grid-cols-1 relative group">
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

// Add this helper function before the RefinementDialog component
const hasAdvancedSkiers = (skiingLevels: string[]): boolean => {
  return skiingLevels.some(level => 
    level === 'Intermediates' || level === 'Advanced'
  );
};
