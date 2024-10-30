'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { countries } from "@/lib/countries-data"

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

const defaultAnswers: Answers = {
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

const useQuestionnaireState = () => {
  const [answers, setAnswers] = useState<Answers>(defaultAnswers)
  
  // Move localStorage logic into a useEffect
  useEffect(() => {
    // Try to load saved answers from localStorage after component mounts
    const saved = localStorage.getItem('answers')
    if (saved) {
      try {
        const parsedAnswers = JSON.parse(saved)
        setAnswers(parsedAnswers)
      } catch (e) {
        console.error('Error parsing saved answers:', e)
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('answers')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const updateAnswers = (updates: Partial<Answers>) => {
    const newAnswers = { ...answers, ...updates }
    setAnswers(newAnswers)
    localStorage.setItem('answers', JSON.stringify(newAnswers))
  }

  return [answers, updateAnswers] as const
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

const QuestionNav = ({ currentStep, totalSteps, setStep }: { 
  currentStep: number; 
  totalSteps: number; 
  setStep: (step: number) => void;
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

const CountryAutocomplete = () => {
  const [answers, updateAnswers] = useQuestionnaireState()

  const handleSelect = (countryName: string) => {
    let newCountries: string[]
    
    if (countryName === "Anywhere") {
      newCountries = ["Anywhere"]
    } else {
      let currentSelection = answers.countries.filter(c => c !== "Anywhere")
      
      if (currentSelection.includes(countryName)) {
        currentSelection = currentSelection.filter(c => c !== countryName)
      } else {
        currentSelection = [...currentSelection, countryName]
      }

      newCountries = currentSelection.length === 0 ? ["Anywhere"] : currentSelection
    }

    updateAnswers({ countries: newCountries })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {countries.map((country) => (
          <Button
            key={country.id}
            variant={answers.countries.includes(country.name) ? "default" : "outline"}
            className={cn(
              "justify-start",
              answers.countries.includes(country.name) && "bg-blue-500 text-white"
            )}
            onClick={() => handleSelect(country.name)}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                answers.countries.includes(country.name) ? "opacity-100" : "opacity-0"
              )}
            />
            {country.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default function Component() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 15
  const [answers, updateAnswers] = useQuestionnaireState()

  const isQuestionAnswered = () => {
    switch (step) {
      case 1: return !!answers.groupType
      case 2: return !!answers.skiOrSnowboard
      case 3: return answers.countries && answers.countries.length > 0 && answers.countries[0] !== ''
      case 4: return answers.skiingLevels.length > 0
      case 5: return answers.slopePreferences.length > 0
      case 6: return !!answers.lessons
      case 7: return !!answers.nightlife
      case 8: return !!answers.snowPark
      case 9: return !!answers.offPiste
      case 10: return !!answers.skiInSkiOut
      case 11: return answers.resortPreferences.length > 0
      case 12: return answers.otherActivities.length > 0
      case 13: return !!answers.lovedResorts
      case 14: return !!answers.travelTime && (answers.travelTime === 'flexible' || answers.travelMonth.length > 0)
      case 15: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else if (isQuestionAnswered()) {
      const encodedAnswers = encodeURIComponent(JSON.stringify(answers))
      localStorage.removeItem('answers')
      router.push(`/results?answers=${encodedAnswers}`)
    } else {
      alert("Please answer the last question before finding resorts.")
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Modify the renderQuestion function to ensure consistent handling of answers
  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Select your group type</h2>
            <RadioGroup value={answers.groupType} onValueChange={(value) => updateAnswers({ groupType: value })}>
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
                          const newAges = checked
                            ? [...answers.childrenAges, age]
                            : answers.childrenAges.filter((a) => a !== age);
                          updateAnswers({ childrenAges: newAges });
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
            <RadioGroup value={answers.skiOrSnowboard} onValueChange={(value) => updateAnswers({ skiOrSnowboard: value })}>
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
                      const newLevels = checked
                        ? [...answers.skiingLevels, level]
                        : answers.skiingLevels.filter((l) => l !== level);
                      updateAnswers({ skiingLevels: newLevels });
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How big would you like your ski resort to be?</h2>
            <RadioGroup value={answers.slopePreferences[0]} onValueChange={(value) => updateAnswers({ slopePreferences: [value] })}>
              {['Small and charming', 'Medium-sized resort', 'Large ski area', "I don't mind"].map((option) => (
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Would anyone in your group like ski or snowboard lessons?</h2>
            <RadioGroup value={answers.lessons} onValueChange={(value) => updateAnswers({ lessons: value })}>
              {['Yes', 'No'].map((option) => (
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How important is nightlife and après-ski?</h2>
            <RadioGroup value={answers.nightlife} onValueChange={(value) => updateAnswers({ nightlife: value })}>
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Is having a snow park important?</h2>
            <RadioGroup value={answers.snowPark} onValueChange={(value) => updateAnswers({ snowPark: value })}>
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">How important is having off-piste possibilities?</h2>
            <RadioGroup value={answers.offPiste} onValueChange={(value) => updateAnswers({ offPiste: value })}>
              {['Very important', 'Somewhat important', 'Not important'].map((option) => (
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Do you prefer ski-in/ski-out resorts?</h2>
            <RadioGroup value={answers.skiInSkiOut} onValueChange={(value) => updateAnswers({ skiInSkiOut: value })}>
              {['Yes, must have', 'Nice to have', "Don't care"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} className="border-blue-500 text-blue-500" />
                  <Label htmlFor={option} className="text-gray-800 hover:text-blue-500 transition-colors">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 11:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">What&apos;s most important to you in a resort? Pick up to 3 things!</h2>
            <div className="space-y-2">
              {['Extensive ski area', 'Less crowded slopes', 'Close to the airport', 'Family-friendly', 'Peaceful atmosphere', 'Scenic beauty', 'Modern lift system', 'Snow sure- High altitude resort'].map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={answers.resortPreferences.includes(preference)}
                    onCheckedChange={(checked) => {
                      if (checked && answers.resortPreferences.length < 3) {
                        updateAnswers({ resortPreferences: [...answers.resortPreferences, preference] })
                      } else if (!checked) {
                        updateAnswers({ resortPreferences: answers.resortPreferences.filter(p => p !== preference) })
                      }
                    }}
                    disabled={answers.resortPreferences.length >= 3 && !answers.resortPreferences.includes(preference)}
                    className="border-blue-500 text-blue-500"
                  />
                  <Label htmlFor={preference} className="text-gray-800 hover:text-blue-500 transition-colors">{preference}</Label>
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
                        updateAnswers({ otherActivities: [...answers.otherActivities, activity] })
                      } else {
                        updateAnswers({ otherActivities: answers.otherActivities.filter((a) => a !== activity) })
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswers({ lovedResorts: e.target.value })}
              className="bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )      
      case 14:
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">When do you want to go skiing?</h2>
            <RadioGroup onValueChange={(value) => updateAnswers({ travelTime: value })}>
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
                          updateAnswers({ travelMonth: [...answers.travelMonth, month] })
                        } else {
                          updateAnswers({ travelMonth: answers.travelMonth.filter((m) => m !== month) })
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAnswers({ additionalInfo: e.target.value })}
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