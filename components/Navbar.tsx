'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const Navbar = () => {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const handleResultsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const savedData = localStorage.getItem('ski_questionnaire_data')
    
    if (!savedData) {
      setShowDialog(true)
    } else {
      router.push('/results')
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Ski Resort Logo"
                width={500}
                height={160}
                style={{ 
                  width: '221px',
                  height: 'auto',
                }}
                priority
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/questionnaire"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Find Your Resort
                </Link>
                <a
                  href="/results"
                  onClick={handleResultsClick}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  Results
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dialog for users without questionnaire data */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-800">
              🎿 Hold Your Skis!
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 text-center space-y-4">
              Before we can show you the perfect ski resorts, we need to know a bit about your dream winter getaway!
              <Button 
                onClick={() => {
                  setShowDialog(false)
                  router.push('/questionnaire')
                }}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
              >
                Let&apos;s Find Your Perfect Resort! ⛷️
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Navbar