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
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card className="relative bg-white bg-opacity-40 border border-white backdrop-blur-md text-gray-800 
      transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 
          transition-colors z-20"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2 flex-1">
            <CardTitle className="text-xl font-bold text-gray-800">{resort.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                {rank}
              </Badge>
              <TooltipProvider delayDuration={100}>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Badge 
                        variant="outline" 
                        className={`cursor-help transition-colors touch-manipulation ${getPricingBadgeStyle(resort.pricing?.sixDayPass)}`}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTooltip(!showTooltip);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {getPricingLabel(resort.pricing?.sixDayPass)}
                      </Badge>
                    </div>
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
          
          <div className="col-span-2 mt-2 bg-green-50 rounded-lg p-3 border border-green-100">
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
        </div>
      </CardContent>
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
    }
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
    }
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
    }
  }
]

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

    // Log which fields are invalid
    const invalidFields = Object.entries(requiredFields)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      console.error('Invalid fields for resort:', resort.name, invalidFields);
    }

    return Object.values(requiredFields).every(Boolean);
  };

  // Filter out invalid resorts
  const validResorts = resorts.map(resort => ({
    ...resort,
    // Ensure nightlife is one of the valid values
    nightlife: ['Vibrant', 'Moderate', 'Quiet'].includes(resort.nightlife) 
      ? resort.nightlife 
      : 'Moderate',
    // Ensure required fields exist
    pricing: resort.pricing || { dailyPass: 'N/A', sixDayPass: 'N/A' },
    snow_condition: resort.snow_condition || 'Packed',
    villageAltitude: resort.villageAltitude || 'N/A',
    skiRange: resort.skiRange || 'N/A',
    numberOfLifts: resort.numberOfLifts || 0
  })).filter(isValidResort);

  console.log('Valid resorts after basic validation:', validResorts);

  if (validResorts.length === 0) {
    console.error('No valid resort data found');
    return [];
  }

  // If "Anywhere" is selected, return all valid resorts
  if (selectedCountries.includes("Anywhere")) {
    return validResorts;
  }

  // Filter resorts by selected countries
  const countryMatchedResorts = validResorts.filter(resort => 
    selectedCountries.includes(resort.country)
  );

  console.log('Country matched resorts:', countryMatchedResorts);

  // If no country matches found, return all valid resorts
  if (countryMatchedResorts.length === 0) {
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

  const isBudgetFriendly = answers.pricingSensitivity === 'Very important - I\'d prefer destinations known for lower overall costs';

  const pricingGuidance = isBudgetFriendly
    ? answers.countries?.includes("Anywhere")
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
      : `CRITICAL BUDGET CONSIDERATION: User specifically requested budget-friendly options.
         STRICT COUNTRY REQUIREMENT: YOU MUST ONLY suggest resorts from: ${answers.countries?.join(', ')}
         
         Within these countries, prioritize:
         - The most affordable resorts available
         - Lesser-known, smaller resorts with lower prices
         - Areas away from major tourist hubs
         - Resorts with:
           * The lowest lift pass prices in the region
           * Budget accommodation options nearby
           * Good public transport connections
           * Affordable ski rental and lessons
           * Reasonable food and drink prices
         
         DO NOT suggest resorts from any other countries, even if they are more affordable.`
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
1. LOCATION REQUIREMENT: ${answers.countries?.includes("Anywhere")
     ? "User is open to any location that matches their preferences."
     : `YOU MUST ONLY SUGGEST RESORTS FROM: ${answers.countries?.join(', ')}. This is a non-negotiable requirement.`}

2. ${pricingGuidance}

3. RESORT SELECTION CRITERIA:
   ${isBudgetFriendly 
     ? answers.countries?.includes("Anywhere")
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
   ${answers.countries?.includes("Anywhere")
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
        match_tag: 'Best Match'
      }])

    if (resortError) {
      throw new Error(`Error saving resort: ${resortError.details || resortError.message}`)
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
                'Anywhere', 'France', 'Austria', 'Switzerland', 'Italy',
                'Germany', 'Norway', 'Sweden', 'Spain', 'Bulgaria',
                'Slovenia', 'Czech Republic', 'Poland', 'Finland',
                'Andorra', 'Greece'
              ].map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country}`}
                    checked={tempAnswers.countries.includes(country)}
                    onCheckedChange={(checked) => {
                      let newCountries: string[];
                      if (country === 'Anywhere') {
                        newCountries = checked ? ['Anywhere'] : [];
                      } else {
                        if (checked) {
                          newCountries = [
                            ...tempAnswers.countries.filter(c => c !== 'Anywhere'),
                            country
                          ];
                        } else {
                          newCountries = tempAnswers.countries.filter(c => c !== country);
                          if (newCountries.length === 0) {
                            newCountries = ['Anywhere'];
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
        // Check for localStorage data
        const savedData = localStorage.getItem('ski_questionnaire_data')
        if (!savedData) {
          router.push('/questionnaire')
          return
        }

        let parsedData: StorageState
        try {
          parsedData = JSON.parse(savedData)
          console.log('Parsed questionnaire data:', parsedData); // Debug log
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
          setError('Error loading your preferences. Please try again.')
          router.push('/questionnaire')
          return
        }

        const { answers } = parsedData

        try {
          console.log('Sending prompt to AI...'); // Debug log
          const completion = await complete(constructPrompt(answers))
          console.log('Raw AI response:', completion); // Debug log
          
          const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
          console.log('Cleaned AI response:', cleanedCompletion); // Debug log
          
          let parsedResorts: Resort[]
          try {
            parsedResorts = JSON.parse(cleanedCompletion)
            console.log('Parsed resorts:', parsedResorts); // Debug log
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError, '\nResponse was:', cleanedCompletion)
            throw new Error('Unable to process resort recommendations')
          }
          
          // Validate resort data
          if (!Array.isArray(parsedResorts) || parsedResorts.length === 0) {
            console.error('Invalid or empty resorts array:', parsedResorts);
            throw new Error('No resort recommendations received')
          }

          // Validate that resorts match selected countries
          const validatedResorts = validateResorts(parsedResorts, answers.countries)
          console.log('Validated resorts:', validatedResorts); // Debug log
          
          if (validatedResorts.length === 0) {
            // If no validated resorts, use mock data in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Using mock data as fallback');
              const validatedMockResorts = validateResorts(mockResorts, answers.countries)
              setResorts(validatedMockResorts)
            } else {
              throw new Error('No resorts match your selected countries')
            }
          } else {
            setResorts(validatedResorts)
          }
          
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

  const handleRemoveResort = async (index: number) => {
    try {
      setLoadingCards(prev => ({ ...prev, [index]: true }))
      
      // Get the current resort names to exclude
      const currentResortNames = resorts.map(r => r.name)
      
      // Add current resort to seen resorts
      setSeenResorts(prev => new Set([...prev, resorts[index].name]))
      
      // Get saved data for API call
      const savedData = localStorage.getItem('ski_questionnaire_data')
      if (!savedData) throw new Error('No saved preferences found')
      
      const { answers } = JSON.parse(savedData) as StorageState
      
      // Modify the prompt to exclude seen resorts
      const excludeList = [...seenResorts, ...currentResortNames].join(', ')
      const modifiedPrompt = constructPrompt(answers) + `\nIMPORTANT: Do NOT suggest any of these resorts: ${excludeList}`
      
      // Get new resort recommendation
      const completion = await complete(modifiedPrompt)
      const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
      const parsedResorts = JSON.parse(cleanedCompletion)
      
      // Validate and get first resort from response
      const validatedResorts = validateResorts([parsedResorts[0]], answers.countries)
      
      if (validatedResorts.length === 0) {
        throw new Error('No matching resort found')
      }

      // Update the resorts array with the new resort
      setResorts(prev => {
        const updated = [...prev]
        updated[index] = validatedResorts[0]
        return updated
      })

    } catch (error) {
      setError('Failed to get new resort recommendation')
    } finally {
      setLoadingCards(prev => ({ ...prev, [index]: false }))
    }
  }

  // Modify the ResultsPage component
  const handlePreferenceUpdate = async (newAnswers: StorageState['answers']) => {
    try {
      setIsLoading(true)
      setError(null)

      // Update localStorage
      const storageData: StorageState = {
        answers: newAnswers,
        lastUpdated: new Date().toISOString(),
        currentStep: 15 // Last step
      }
      localStorage.setItem('ski_questionnaire_data', JSON.stringify(storageData))

      // Get new results
      const completion = await complete(constructPrompt(newAnswers))
      const cleanedCompletion = completion?.replace(/```json\n?|```/g, '').trim() || '[]'
      const parsedResorts = JSON.parse(cleanedCompletion)
      const validatedResorts = validateResorts(parsedResorts, newAnswers.countries)

      setResorts(validatedResorts)
      
      // Save to database
      await saveToDatabase(newAnswers, validatedResorts)

    } catch (error) {
      setError('Failed to update results. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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