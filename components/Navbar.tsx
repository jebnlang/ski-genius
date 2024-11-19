'use client'

import { useState, useEffect } from 'react'
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
import { Menu } from 'lucide-react'
import { withClickTracking } from '@/components/withClickTracking';
import { trackEnhancedEvent } from '@/utils/enhanced-analytics';

const Navbar = () => {
  const [showDialog, setShowDialog] = useState(false)
  const [hasViewedResults, setHasViewedResults] = useState(false)
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if user has viewed results
  useEffect(() => {
    const hasViewed = localStorage.getItem('has_viewed_results')
    setHasViewedResults(!!hasViewed)
  }, [])

  const handleResultsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const savedData = localStorage.getItem('ski_questionnaire_data')
    
    if (!savedData) {
      setShowDialog(true)
    } else {
      router.push('/results')
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/#' + sectionId)
    }
  }

  const handleNavigation = (path: string, label: string) => {
    trackEnhancedEvent('navigation', 'Navigation', {
      label: label,
      page_path: path,
      element_type: 'nav_link'
    });
    router.push(path);
  };

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
                  width: '188px',
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
                  onClick={() => handleNavigation('/questionnaire', 'Find Your Resort')}
                  data-tracking-label="nav_questionnaire"
                >
                  Find Your Resort
                </Link>
                {hasViewedResults && (
                  <a
                    href="/results"
                    onClick={handleResultsClick}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  >
                    Results
                  </a>
                )}
                <button
                  onClick={() => scrollToSection('recent-recommendations')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Recent Recommendations
                </button>
                <button
                  onClick={() => scrollToSection('top-resorts')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Top Resorts
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                <Link
                  href="/questionnaire"
                  className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Your Resort
                </Link>
                {hasViewedResults && (
                  <a
                    href="/results"
                    onClick={(e) => {
                      handleResultsClick(e)
                      setMobileMenuOpen(false)
                    }}
                    className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Results
                  </a>
                )}
                <button
                  onClick={() => {
                    scrollToSection('recent-recommendations')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  Recent Recommendations
                </button>
                <button
                  onClick={() => {
                    scrollToSection('top-resorts')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  Top Resorts
                </button>
              </div>
            </div>
          )}
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

// Wrap the component with click tracking
export default withClickTracking(Navbar, 'Navigation');