"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

// Dynamic import for analytics to avoid build issues
const useAnalyticsSafely = () => {
  const [analytics, setAnalytics] = useState<any>(null)
  
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { useAnalytics } = await import('@/hooks/useAnalytics')
        setAnalytics(useAnalytics())
      } catch (error) {
        console.warn('Analytics not available:', error)
        // Provide mock analytics functions
        setAnalytics({
          trackEmailSignup: () => {},
          trackFormSubmit: () => {},
          trackEvent: () => {},
          trackFeatureDiscovered: () => {}
        })
      }
    }
    
    loadAnalytics()
  }, [])
  
  return analytics
}

export default function ComingSoon() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const analytics = useAnalyticsSafely()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only track analytics if available
    if (analytics) {
      try {
        // Track email signup with both old and new methods
        analytics.trackEmailSignup(email, 'coming-soon-page')
        analytics.trackFormSubmit('email-signup', true)
        
        // Track custom event
        analytics.trackEvent('email_waitlist_signup', { 
          source: 'coming-soon-page',
          email_domain: email.split('@')[1],
          timestamp: new Date().toISOString()
        })
        
        // Track feature discovery if this is their first interaction
        analytics.trackFeatureDiscovered('email_waitlist', 'coming-soon-page')
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
    
    // TODO: Add email submission logic here
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex flex-col">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/60 border-b border-gray-200/30">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="Clarnote" 
                width={127}
                height={42}
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Clarnote
            <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-gray-700 mt-2">
              Your voice. Transformed into clarity.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-xl mx-auto font-light">
            AI assistant for your meetings. Transcribe, organize, remember.
          </p>
          
          {/* Email Signup */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-8 mb-12 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Be the first to know
            </h2>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                >
                  Notify me at launch
                </button>
              </form>
            ) : (
              <div className="py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">Thank you! We'll be in touch.</p>
              </div>
            )}
          </div>

          {/* Mobile App Preview */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-8 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mobile app coming soon
            </h3>
            
            {/* QR Code Placeholder */}
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1m-6-6v1m0 6h1m5-13a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Scan to get notified when our mobile app launches
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/40">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="Clarnote" 
                width={95}
                height={31}
                className="h-6 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2025 Clarnote. All rights reserved.
            </p>
            
          </div>
        </div>
      </footer>
    </div>
  )
} 