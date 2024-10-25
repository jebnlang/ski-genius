'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from 'react-day-picker'
// import Image from 'next/image'

interface Answers {
  groupComposition: string
  childrenAges: string[]
  skiingExperience: string[]
  resortPreferences: string[]
  terrainPreferences: string[]
  additionalActivities: string[]
  travelDates: {
    type: string
    dates: DateRange | undefined
    month: string
    season: string
  }
}

export default function Questionnaire() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    groupComposition: '',
    childrenAges: [],
    skiingExperience: [],
    resortPreferences: [],
    terrainPreferences: [],
    additionalActivities: [],
    travelDates: {
      type: '',
      dates: undefined,
      month: '',
      season: '',
    },
  })

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1)
    } else {
      console.log('Submitting answers:', answers)
      router.push('/processing')
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleAnswer = (question: keyof Answers, answer: string | string[] | { type: string; dates: DateRange | undefined; month: string; season: string }) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [question]: answer }))
  }

  const handleMaxThreeSelection = (question: 'resortPreferences' | 'terrainPreferences', value: string) => {
    setAnswers((prevAnswers) => {
      const currentSelection = prevAnswers[question]
      if (currentSelection.includes(value)) {
        return { ...prevAnswers, [question]: currentSelection.filter((item) => item !== value) }
      } else if (currentSelection.length < 3) {
        return { ...prevAnswers, [question]: [...currentSelection, value] }
      }
      return prevAnswers
    })
  }

  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Who will be joining you on the slopes?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('groupComposition', value)}>
              {['Solo traveler', 'Couple', 'Group of friends', 'Family with children', 'Family without children', 'Mixed group (family & friends)'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {answers.groupComposition === 'Family with children' && (
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
            <h2 className="text-2xl font-bold">What&apos;s your skill level on the slopes?</h2>
            <div className="space-y-2">
              {['First timer', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={answers.skiingExperience.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswer('skiingExperience', [...answers.skiingExperience, level])
                      } else {
                        handleAnswer('skiingExperience', answers.skiingExperience.filter((l) => l !== level))
                      }
                    }}
                  />
                  <Label htmlFor={level}>{level}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What matters most to you in a ski resort? (Select up to 3)</h2>
            <div className="space-y-2">
              {['Extensive ski area', 'Reliable snow conditions', 'Easy access/Short transfer', 'Lively après-ski scene', 'Family-friendly', 'Peaceful atmosphere', 'Modern lift system', 'Beginner-friendly slopes', 'Off-piste opportunities', 'High altitude resort'].map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={answers.resortPreferences.includes(preference)}
                    onCheckedChange={() => {
                      handleMaxThreeSelection('resortPreferences', preference)
                    }}
                    disabled={answers.resortPreferences.length >= 3 && !answers.resortPreferences.includes(preference)}
                  />
                  <Label htmlFor={preference}>{preference}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What kind of terrain do you prefer? (Select up to 3)</h2>
            <div className="space-y-2">
              {['Groomed runs', 'Powder runs', 'Tree runs', 'Steep challenging runs', 'Wide open runs', 'Moguls', 'Glacier skiing', 'Terrain parks'].map((terrain) => (
                <div key={terrain} className="flex items-center space-x-2">
                  <Checkbox
                    id={terrain}
                    checked={answers.terrainPreferences.includes(terrain)}
                    onCheckedChange={() => {
                      handleMaxThreeSelection('terrainPreferences', terrain)
                    }}
                    disabled={answers.terrainPreferences.length >= 3 && !answers.terrainPreferences.includes(terrain)}
                  />
                  <Label htmlFor={terrain}>{terrain}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Which additional winter activities interest you? (Select all that apply)</h2>
            <div className="space-y-2">
              {['Snowboarding', 'Cross-country skiing', 'Winter hiking', 'Spa/wellness facilities', 'Heliskiing', 'Cat skiing', 'Ski touring', 'Snowpark/Freestyle', 'Night skiing', 'Sledding/Toboganning'].map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={activity}
                    checked={answers.additionalActivities.includes(activity)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswer('additionalActivities', [...answers.additionalActivities, activity])
                      } else {
                        handleAnswer('additionalActivities', answers.additionalActivities.filter((a) => a !== activity))
                      }
                    }}
                  />
                  <Label htmlFor={activity}>{activity}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">When are you planning to hit the slopes?</h2>
            <RadioGroup onValueChange={(value) => handleAnswer('travelDates', { ...answers.travelDates, type: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific">I have specific dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month">I know the month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible">I&apos;m flexible</Label>
              </div>
            </RadioGroup>
            {answers.travelDates.type === 'specific' && (
              <div className="mt-4">
                <Calendar
                  mode="range"
                  selected={answers.travelDates.dates}
                  onSelect={(range) => 
                    handleAnswer('travelDates', { ...answers.travelDates, dates: range })
                  }
                  className="rounded-md border"
                />
              </div>
            )}
            {answers.travelDates.type === 'month' && (
              <RadioGroup onValueChange={(value) => handleAnswer('travelDates', { ...answers.travelDates, month: value })}>
                {['December 2024', 'January 2025', 'February 2025', 'March 2025', 'April 2025'].map((month) => (
                  <div key={month} className="flex items-center space-x-2">
                    <RadioGroupItem value={month} id={month} />
                    <Label htmlFor={month}>{month}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {answers.travelDates.type === 'flexible' && (
              <RadioGroup onValueChange={(value) => handleAnswer('travelDates', { ...answers.travelDates, season: value })}>
                {['Early Season (December)', 'Peak Winter (January-February)', 'Late Season (March-April)', 'Super Flexible (Show me all options)'].map((season) => (
                  <div key={season} className="flex items-center space-x-2">
                    <RadioGroupItem value={season} id={season} />
                    <Label htmlFor={season}>{season}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !answers.groupComposition || (answers.groupComposition === 'Family with children' && answers.childrenAges.length === 0)
      case 2:
        return answers.skiingExperience.length === 0
      case 3:
        return answers.resortPreferences.length === 0
      case 4:
        return answers.terrainPreferences.length === 0
      case 5:
        return answers.additionalActivities.length === 0
      case 6:
        return !answers.travelDates.type || 
               (answers.travelDates.type === 'specific' && !answers.travelDates.dates) ||
               (answers.travelDates.type === 'month' && !answers.travelDates.month) ||
               (answers.travelDates.type === 'flexible' && !answers.travelDates.season)
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Find Your Perfect Ski Resort</h1>
        {renderQuestion()}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button onClick={handlePrevious} className="outline">
              Previous
            </button>
          )}
          <Button 
            onClick={handleNext} 
            className="ml-auto"
            disabled={isNextDisabled()}
          >
            {isNextDisabled() ? 'Skip' : step < 6 ? 'Next' : 'Find Resorts'}
          </Button>
        </div>
      </div>
    </div>
  )
}
