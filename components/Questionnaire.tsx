'use client'

import React, { useState, useEffect } from 'react'
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

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full bg-blue-100 rounded-full h-4 mb-6 relative overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-300 to-blue-500"
        style={{ width: `${progress}%` }}
      ></div>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`absolute top-0 h-full border-r border-blue-200 ${
            index <= currentStep ? 'border-opacity-0' : 'border-opacity-50'
          }`}
          style={{ left: `${(index / totalSteps) * 100}%` }}
        ></div>
      ))}
    </div>
  )
}

const QuestionNav = ({ currentStep, totalSteps, setStep, answers }: { 
  currentStep: number; 
  totalSteps: number; 
  setStep: (step: number) => void;
  answers: Answers;
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCurrentStep = stepNumber === currentStep;
          
          return (
            <button
              key={stepNumber}
              onClick={() => setStep(stepNumber)}
              className={`
                w-8 h-8 rounded-full text-sm font-medium
                ${isCurrentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-50 text-gray-600 hover:bg-blue-100'}
                transition-colors duration-200
              `}
            >
              {stepNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const getStoredAnswers = () => {
  if (typeof window !== 'undefined') {
    const savedAnswers = localStorage.getItem('questionnaireAnswers')
    if (savedAnswers) {
      try {
        return JSON.parse(savedAnswers)
      } catch (error) {
        console.error('Error parsing saved answers:', error)
        return null
      }
    }
  }
  return null
}

export default function Component() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 15
  const [answers, setAnswers] = useState<Answers>(() => {
    const savedAnswers = getStoredAnswers()
    return savedAnswers || {
      groupType: '',
      childrenAges: [],
      skiOrSnowboard: '',
      countries: ['Anywhere'],
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
    }
  })

  useEffect(() => {
    const saveAnswers = () => {
      try {
        localStorage.setItem('questionnaireAnswers', JSON.stringify(answers))
      } catch (error) {
        console.error('Error saving answers:', error)
      }
    }

    // Save answers immediately when they change
    saveAnswers()

    // Also save answers when the user leaves/refreshes the page
    window.addEventListener('beforeunload', saveAnswers)
    
    return () => {
      window.removeEventListener('beforeunload', saveAnswers)
    }
  }, [answers])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else if (isQuestionAnswered()) {
      console.log('Submitting answers:', answers)
      const encodedAnswers = encodeURIComponent(JSON.stringify(answers))
      router.push(`/results?answers=${encodedAnswers}`)
      localStorage.removeItem('questionnaireAnswers')
    } else {
      alert("Please answer the last question before finding resorts.")
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleAnswer = (question: keyof Answers, answer: string | string[]) => {
    setAnswers(prevAnswers => {
      const newAnswers = {
        ...prevAnswers,
        [question]: question === 'countries' 
          ? Array.isArray(answer) 
            ? answer 
            : typeof answer === 'string' 
              ? answer === 'Anywhere'
                ? ['Anywhere']
                : [...(prevAnswers.countries.filter(c => c !== 'Anywhere')), answer].filter((c, i, arr) => arr.indexOf(c) === i)
              : []
          : answer
      }
      
      // Save to localStorage immediately after state update
      try {
        localStorage.setItem('questionnaireAnswers', JSON.stringify(newAnswers))
      } catch (error) {
        console.error('Error saving answers:', error)
      }
      
      return newAnswers
    })
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
            className="w-full justify-between bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
          >
            {answers.countries?.length > 0
              ? answers.countries.join(", ")
              : "Anywhere"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-white border-gray-300" align="start">
          <Command>
            <CommandInput
              placeholder="Search countries..."
              className="text-gray-800 placeholder-gray-500"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="text-gray-500">No countries found.</CommandEmpty>
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
                      className="text-gray-800 hover:bg-gray-100"
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Select your group type</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('groupType', value)}>
              {['Couple', 'Group of friends', 'Family with children', 'Family without children', 'Mixed group family & friends'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {answers.groupType === 'Family with children' && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-800">What are the ages of the children?</h3>
                <div className="space-y-2 mt-2">
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
                        className="border-blue-500 text-blue-500"
                      />
                      <Label htmlFor={age} className="text-gray-800 hover:text-blue-500 transition-colors">{age}</Label>
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Are you skiers or snowboarders?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('skiOrSnowboard', value)}>
              {['Skiers', 'Snowboarders', 'Mixed'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Where would you like to ski? Pick any countries you like!</h2>
            <CountryAutocomplete />
            {answers.countries && answers.countries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {answers.countries.map((country) => (
                  <div key={country} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    {country}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2 text-blue-800 hover:text-blue-600"
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">What are the skiing levels in your group?</h2>
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
                    className="border-blue-500 text-blue-500"
                  />
                  
                  <Label htmlFor={level} className="text-gray-800 hover:text-blue-500 transition-colors">{level}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Would anyone in your group like ski or snowboard lessons?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('lessons', value)}>
              {['Yes', 'No'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How important is nightlife and après-ski?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('nightlife', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Is having a snow park important?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('snowPark', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How important is having off-piste possibilities?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('offPiste', value)}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Do you prefer ski-in/ski-out resorts?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('skiInSkiOut', value)}>
              {['Yes, must have', 'Nice to have', "Don't care"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 10:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">What&apos;s most important to you in a resort? Pick up to 3 things!</h2>
            <div className="space-y-2">
              {['Extensive ski area', 'Less crowded slopes', 'Close to the airport', 'Family-friendly', 'Peaceful atmosphere', 'Scenic beauty', 'Modern lift system', 'Snow sure- High altitude resort'].map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={answers.resortPreferences.includes(preference)}
                    onCheckedChange={() => handleMaxThreeSelection('resortPreferences', preference)}
                    disabled={answers.resortPreferences.length >= 3 && !answers.resortPreferences.includes(preference)}
                    className="border-blue-500 text-blue-500"
                  />
                  <Label htmlFor={preference} className="text-gray-800 hover:text-blue-500 transition-colors">{preference}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 11:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">What kind of slopes do you like best? Pick up to 3!</h2>
            <div className="space-y-2">
              {['Groomed runs', 'Tree runs', 'Wide open runs', 'Glacier skiing', 'Steep challenging runs'].map((slope) => (
                <div key={slope} className="flex items-center space-x-2">
                  <Checkbox
                    id={slope}
                    checked={answers.slopePreferences.includes(slope)}
                    onCheckedChange={() => handleMaxThreeSelection('slopePreferences', slope)}
                    disabled={answers.slopePreferences.length >= 3 && !answers.slopePreferences.includes(slope)}
                    className="border-blue-500 text-blue-500"
                  />
                  <Label htmlFor={slope} className="text-gray-800 hover:text-blue-500 transition-colors">{slope}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 12:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Besides skiing, what other activities would you like to try?</h2>
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
                    className="border-blue-500 text-blue-500"
                  />
                  <Label htmlFor={activity} className="text-gray-800 hover:text-blue-500 transition-colors">{activity}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 13:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Have you visited any ski resorts you loved? We&apos;ll find more like them!</h2>
            <Input
              placeholder="Enter resorts"
              value={answers.lovedResorts}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswer('lovedResorts', e.target.value)}
              className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )      
      case 14:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">When do you want to go skiing?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('travelTime', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" className="border-blue-500 text-blue-500" />
                <Label htmlFor="month" className="text-gray-800 hover:text-blue-500 transition-colors">I know the month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="flexible" className="border-blue-500 text-blue-500" />
                <Label htmlFor="flexible" className="text-gray-800 hover:text-blue-500 transition-colors">I&apos;m flexible</Label>
              </div>
            </RadioGroup>
            {answers.travelTime === 'month' && (
              <div className="mt-4 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Select the month(s)</h3>
                {['December', 'January', 'February', 'March', 'April'].map((month) => (
                  <div key={month} className="flex items-center space-x-2">
                    <Checkbox
                      id={month}
                      checked={answers.travelMonth.includes(month)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleAnswer('travelMonth', [...answers.travelMonth, month])
                        } else {
                          handleAnswer('travelMonth', answers.travelMonth.filter((m) => m !== month))
                        }
                      }}
                      className="border-blue-500 text-blue-500"
                    />
                    <Label htmlFor={month} className="text-gray-800 hover:text-blue-500 transition-colors">{month}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 15:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Is there anything else you&apos;d like to tell us about your perfect ski trip?</h2>
            <Textarea
              placeholder="Tell us more..."
              value={answers.additionalInfo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswer('additionalInfo', e.target.value)}
              className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/ski-pattern.svg')] bg-repeat opacity-10"></div>
      <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snow-texture-NRGzCHAZXYXOZQVXZXXXXXXXXXXX.png')] bg-repeat animate-snow"></div>
      <div className="bg-white bg-opacity-40 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-white backdrop-blur-md relative z-10">
        <ProgressBar currentStep={step} totalSteps={totalSteps} />
        <QuestionNav 
          currentStep={step} 
          totalSteps={totalSteps} 
          setStep={setStep} 
          answers={answers}
        />
        {renderQuestion()}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button 
              onClick={handlePrevious} 
              variant="outline"
              className="bg-white bg-opacity-50 text-gray-800 border-gray-300 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 ease-in-out rounded-full px-6 py-2 shadow-md backdrop-blur-sm"
            >
              Previous
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            className={`ml-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-200 ease-in-out rounded-full px-6 py-2 shadow-md ${
              isQuestionAnswered() ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {isQuestionAnswered() ? (step < totalSteps ? 'Next' : 'Find Resorts') : 'Skip'}
          </Button>
        </div>
      </div>
    </div>
  )
}