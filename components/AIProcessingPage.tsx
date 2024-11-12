'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const funFacts = [
  "The word 'ski' comes from the Old Norse word 'skíð' meaning stick of wood.",
  "The first ski lift was invented in 1908 by Robert Winterhalder in Germany.",
  "Skiing was originally a mode of transport, used by ancient Nordic hunters.",
  "The first Winter Olympics featuring skiing was held in 1924 in Chamonix, France.",
  "Val Thorens is Europe's highest ski resort at 2,300m altitude.",
  "Zermatt, Switzerland offers skiing 365 days a year on its glacier.",
  "The longest ski run in Europe is 22km long, located in Alpe d'Huez.",
  "Courchevel was the first resort purpose-built for skiing in France.",
  "St. Moritz hosted the Winter Olympics twice: in 1928 and 1948.",
  "No two snowflakes are exactly alike due to their unique crystal formation.",
  "Fresh powder snow is 97% air, making it perfect for skiing.",
  "Snow appears white because of how light reflects off ice crystals.",
  "The Alps generate 40% of Europe's fresh water from snowmelt.",
  "Blue runs in Europe are equivalent to green runs in North America.",
  "The best time for perfect snow conditions is usually mid-morning.",
  "An average skier burns 400 calories per hour on the slopes.",
  "The speed record for skiing is 254 kilometers per hour.",
]

const CircularProgress = () => (
  <div className="inline-flex items-center justify-center w-16 h-16">
    <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
  </div>
)

export default function AIProcessingPage() {
  const router = useRouter()
  const [currentFact, setCurrentFact] = useState(funFacts[0])

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(prevFact => {
        const currentIndex = funFacts.indexOf(prevFact)
        const nextIndex = (currentIndex + 1) % funFacts.length
        return funFacts[nextIndex]
      })
    }, 2000)

    // Simulate processing time and then navigate to results
    const processingTimeout = setTimeout(() => {
      router.push('/results')
    }, 10000) // Navigate after 10 seconds

    return () => {
      clearInterval(factInterval)
      clearTimeout(processingTimeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Finding Your Perfect Ski Destinations</h1>
        <p className="text-xl mb-8">Analyzing your preferences...</p>

        <div className="mb-12 flex justify-center">
          <CircularProgress />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Did you know?</h2>
          <motion.p
            key={currentFact}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-lg"
          >
            {currentFact}
          </motion.p>
        
        </div>
      </div>
    </div>
  )
}