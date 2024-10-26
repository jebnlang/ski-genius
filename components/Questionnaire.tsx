'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

const countries = [
  "Anywhere",
  "Austria", "Switzerland", "France", "Italy", "Germany", "Norway", "Sweden", "Bulgaria", 
  "Andorra", "Slovenia", "Spain", "Finland", "Czech Republic", "Poland", "Slovakia"
]

interface Answers {
  groupType: string
  childrenAges: string[]
  skiOrSnowboard: string
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

export default function Questionnaire() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    groupType: '',
    childrenAges: [],
    skiOrSnowboard: '',
    countries: [],
    skiingLevels: [],
    lessons: '',
    nightlife: '',
    snowPark: '',
    offPiste: '',
    skiInSkiOut: '',
    resortPreferences: [],
    slopePreferences: [],
    otherActivities: [],
    lovedResorts: '',
    travelTime: '',
    travelMonth: [],
    additionalInfo: ''
  })

  const handleNext = () => {
    if (step < 15) {
      setStep(step + 1)
    } else {
      console.log('Submitting answers:', answers)
      router.push('/processing')
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleAnswer = (question: keyof Answers, answer: string | string[]) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: question === 'countries' 
        ? Array.isArray(answer) 
          ? answer 
          : typeof answer === 'string' 
            ? [...(prevAnswers.countries || []), answer].filter((c, i, arr) => arr.indexOf(c) === i)
            : []
        : answer
    }))
  }

  const handleMaxThreeSelection = (question: 'resortPreferences' | 'slopePreferences', value: string) => {
    setAnswers((prevAnswers) => {
      const currentSelection = prevAnswers[question] || [];
      if (currentSelection.includes(value)) {
        return { ...prevAnswers, [question]: currentSelection.filter((item) => item !== value) }
      } else if (currentSelection.length < 3) {
        return { ...prevAnswers, [question]: [...currentSelection, value] }
      }
      return prevAnswers
    })
  }

  const isQuestionAnswered = () => {
    switch (step) {
      case 1:
        return !!answers.groupType
      case 2:
        return !!answers.skiOrSnowboard
      case 3:
        return answers.countries.length > 0
      case 4:
        return answers.skiingLevels.length > 0
      case 5:
        return !!answers.lessons
      case 6:
        return !!answers.nightlife
      case 7:
        return !!answers.snowPark
      case 8:
        return !!answers.offPiste
      case 9:
        return !!answers.skiInSkiOut
      case 10:
        return answers.resortPreferences.length > 0
      case 11:
        return answers.slopePreferences.length > 0
      case 12:
        return answers.otherActivities.length > 0
      case 13:
        return !!answers.lovedResorts
      case 14:
        return !!answers.travelTime && (answers.travelTime === 'flexible' || answers.travelMonth.length > 0)
      case 15:
        return !!answers.additionalInfo
      default:
        return false
    }
  }

  const CountryAutocomplete = () => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
  
    const filteredCountries = search === "" 
      ? countries 
      : countries.filter((country) => 
          country.toLowerCase().includes(search.toLowerCase())
        )
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {answers.countries?.length > 0
              ? answers.countries.join(", ")
              : "Select countries..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search countries..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => {
                  const isSelected = answers.countries?.includes(country) ?? false;
                  return (
                    <CommandItem
                      key={country}
                      onSelect={() => {
                        setAnswers(prev => {
                          const currentCountries = prev.countries ?? [];
                          
                          if (country === "Anywhere") {
                            return {
                              ...prev,
                              countries: currentCountries.includes("Anywhere") ? [] : ["Anywhere"]
                            };
                          }
                          
                          let newCountries = [...currentCountries];
                          if (isSelected) {
                            newCountries = newCountries.filter(c => c !== country);
                          } else {
                            newCountries = newCountries.filter(c => c !== "Anywhere");
                            if (!newCountries.includes(country)) {
                              newCountries.push(country);
                            }
                          }
                          
                          return {
                            ...prev,
                            countries: newCountries
                          };
                        });
                        setSearch("")
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {country}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Select your group type</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('groupType', value)}>
              {['Couple', 'Group of friends', 'Family with children', 'Family without children', 'Mixed group family & friends'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {answers.groupType === 'Family with children' && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">What are the ages of the children?</h3>
                <div className="space-y-2">
                  {['Under 5', '5-12', '13-17'].map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <Checkbox
                        id={age}
                        checked={answers.childrenAges.includes(age)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleAnswer('childrenAges', [...answers.childrenAges, age])
                          } else {
                            handleAnswer('childrenAges', answers.childrenAges.filter((a) => a !== age))
                          }
                        }}
                      />
                      <Label htmlFor={age}>{age}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Are you skiers or snowboarders?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('skiOrSnowboard', value)}>
              {['Skiers', 'Snowboarders', 'Mixed'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Where would you like to ski? Pick any countries you like!</h2>
            <CountryAutocomplete />
            {answers.countries && answers.countries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {answers.countries.map((country) => (
                  <div key={country} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center">
                    {country}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => handleAnswer('countries', (answers.countries || []).filter(c => c !== country))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. What are the skiing levels in your group?</h2>
            <div className="space-y-2">
              {['First timers', 'Beginners', 'Intermediates', 'Advanced'].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={answers.skiingLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswer('skiingLevels', [...answers.skiingLevels, level])
                      } else {
                        handleAnswer('skiingLevels', answers.skiingLevels.filter((l) => l !== level))
                      }
                    }}
                  />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Would anyone in your group like ski or snowboard lessons?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('lessons', value)}>
              {['Yes', 'No'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. How important is nightlife and après-ski?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('nightlife', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Is having a snow park important?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('snowPark', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. How important is having off-piste possibilities?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('offPiste', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
        case 9:
          return (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">9. Do you prefer ski-in/ski-out resorts?</h2>
              <RadioGroup onValueChange={(value) => handleAnswer('skiInSkiOut', value)}>
                {['Yes, must have', 'Nice to have', "Don&apos;t care"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
      case 10:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">10. What's most important to you in a resort? Pick up to 3 things!</h2>
            <div className="space-y-2">
              {['Extensive ski area', 'Less crowded slopes', 'Close to the airport', 'Family-friendly', 'Peaceful atmosphere', 'Scenic beauty', 'Modern lift system', 'Snow sure- High altitude resort'].map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={answers.resortPreferences.includes(preference)}
                    onCheckedChange={() => handleMaxThreeSelection('resortPreferences', preference)}
                    disabled={answers.resortPreferences.length >= 3 && !answers.resortPreferences.includes(preference)}
                  />
                  <Label htmlFor={preference}>{preference}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 11:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">11. What kind of slopes do you like best? Pick up to 3!</h2>
            <div className="space-y-2">
              {['Groomed runs', 'Tree runs', 'Wide open runs', 'Glacier skiing', 'Steep challenging runs'].map((slope) => (
                <div key={slope} className="flex items-center space-x-2">
                  <Checkbox
                    id={slope}
                    checked={answers.slopePreferences.includes(slope)}
                    onCheckedChange={() => handleMaxThreeSelection('slopePreferences', slope)}
                    disabled={answers.slopePreferences.length >= 3 && !answers.slopePreferences.includes(slope)}
                  />
                  <Label htmlFor={slope}>{slope}</Label>
                </div>
              ))}
            </div>
          </div>
        )
        case 12:
          return (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">12. Besides skiing, what other activities would you like to try?</h2>
              <div className="space-y-2">
                {["Spa/wellness facilities", "Great food scene", "Cross-country skiing", "Winter hiking", "Heli Skiing", "Cat skiing", "Ski touring", "Night skiing", "Sledding/Toboganning"].map((activity) => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox
                      id={activity}
                      checked={answers.otherActivities.includes(activity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleAnswer('otherActivities', [...answers.otherActivities, activity])
                        } else {
                          handleAnswer('otherActivities', answers.otherActivities.filter((a) => a !== activity))
                        }
                      }}
                    />
                    <Label htmlFor={activity}>{activity}</Label>
                  </div>
                ))}
              </div>
            </div>
          )
          case 13:
            return (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">13. Have you visited any ski resorts you loved? We&apos;ll find more like them!</h2>
                <Input
                  placeholder="Enter resorts"
                  value={answers.lovedResorts}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswer('lovedResorts', e.target.value)}
                />
              </div>
            )      
            case 14:
              return (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">14. When do you want to go skiing?</h2>
                  <RadioGroup onValueChange={(value) => handleAnswer('travelTime', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" />
                      <Label htmlFor="month">I know the month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible">I&apos;m flexible</Label>
                    </div>
                  </RadioGroup>
                  {/* ... (rest of case 14 remains unchanged) */}
                </div>
              )
      case 15:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">15. Is there anything else you'd like to tell us about your perfect ski trip?</h2>
            <Textarea
              placeholder="Tell us more..."
              value={answers.additionalInfo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswer('additionalInfo', e.target.value)}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Find Your Perfect Ski Resort</h1>
        {renderQuestion()}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button onClick={handlePrevious} variant="outline">
              Previous
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            className="ml-auto"
            variant={isQuestionAnswered() ? "default" : "secondary"}
          >
            {isQuestionAnswered() ? (step < 15 ? 'Next' : 'Find Resorts') : 'Skip'}
          </Button>
        </div>
      </div>
    </div>
  )
}