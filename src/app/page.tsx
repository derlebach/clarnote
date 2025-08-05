"use client"

import { useState } from "react"
import Link from "next/link"
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function Home() {
  const [showAppModal, setShowAppModal] = useState(false)
  const analytics = useAnalytics()

  const handleGetAppClick = () => {
    analytics.trackButtonClick('get-app', 'hero-section')
    
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Auto-redirect mobile users to appropriate store
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isIOS) {
        analytics.trackAppDownload('ios')
        window.open('https://apps.apple.com', '_blank')
      } else if (isAndroid) {
        analytics.trackAppDownload('android')
        window.open('https://play.google.com/store', '_blank')
      } else {
        // Fallback for other mobile devices - show modal
        analytics.trackModalOpen('app-download')
        setShowAppModal(true)
      }
    } else {
      // Desktop users see the modal
      analytics.trackModalOpen('app-download')
      setShowAppModal(true)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4]">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/60 border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="Clarnote" 
                width={127}
                height={42}
                className="h-8 w-auto"
                priority
                unoptimized
              />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/auth/signin">
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                  Get started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            AI-Powered
            <span className="block">Meeting Assistant</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            Transform your meetings with automated transcription, intelligent summaries, and actionable insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
            <Link href="/auth/signup">
              <button 
                onClick={() => analytics.trackButtonClick('start-today', 'hero-section')}
                className="w-full sm:w-auto bg-gray-900 text-white font-medium px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                Start Today
              </button>
            </Link>
            <button 
              onClick={handleGetAppClick}
              className="w-full sm:w-auto border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-xl hover:border-gray-400 hover:bg-white/60 transition-all duration-200"
            >
              Get the App
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* How it Works - 3 Steps */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Three simple steps to transform your meetings into actionable insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1: Upload */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-white/80 border border-gray-200/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-gray-300/50 transition-colors">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Upload
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your audio or video files securely to our platform in seconds
            </p>
          </div>

          {/* Step 2: Process */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-white/80 border border-gray-200/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-gray-300/50 transition-colors">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Process
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our AI analyzes and transcribes your content with remarkable accuracy
            </p>
          </div>

          {/* Step 3: Get Insights */}
          <div className="text-center group">
            <div className="w-16 h-16 bg-white/80 border border-gray-200/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-gray-300/50 transition-colors">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Get Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Receive summaries, action items, and insights ready to share with your team
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why choose Clarnote
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Powerful features designed to make your meetings more productive
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Transcription
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Accurate transcriptions powered by advanced AI technology
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Summaries
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Intelligent summaries and key insights powered by advanced AI
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Action Items
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Automatically extract decisions and follow-ups from meetings
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Export & Share
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Export insights as PDF or share directly with your team
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-6.75 0L8.25 12l-2.25 2.25M3 15.75l3.75-3.75L3 8.25m12-3L21 8.25l-6 6.75" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multiple Formats
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Support for audio and video files in various formats
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white/60 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300/50 transition-colors">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5A2.25 2.25 0 0019.5 18v-7.5A2.25 2.25 0 0017.25 8.25H6.75A2.25 2.25 0 004.5 10.5v7.5A2.25 2.25 0 006.75 19.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enterprise-grade security with end-to-end encryption
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="bg-white/60 border border-gray-200/50 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to transform your meetings?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of teams using Clarnote to make their meetings more productive and actionable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <Link href="/auth/signup">
              <button 
                onClick={() => analytics.trackButtonClick('start-free-trial', 'final-cta')}
                className="w-full sm:w-auto bg-gray-900 text-white font-medium px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105"
              >
                Start Free Trial
              </button>
            </Link>
            <Link href="/demo">
              <button 
                onClick={() => analytics.trackButtonClick('schedule-demo', 'final-cta')}
                className="w-full sm:w-auto border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-xl hover:border-gray-400 hover:bg-white/60 transition-all duration-200"
              >
                Schedule Demo
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/40">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.svg" 
                alt="Clarnote" 
                width={95}
                height={31}
                className="h-6 w-auto"
                unoptimized
              />
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/support" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2024 Clarnote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* App Download Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Download Clarnote App</h2>
              <button 
                onClick={() => {
                  analytics.trackModalClose('app-download', 'close-button')
                  setShowAppModal(false)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-8 text-center">
                Get the Clarnote mobile app for the best meeting experience on the go.
              </p>

              {/* Download Options */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* iOS Section */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-4">iOS</h3>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1m-6-6v1m0 6h1m5-13a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>

                  {/* App Store Badge */}
                  <a 
                    href="https://apps.apple.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={() => analytics.trackAppDownload('ios')}
                  >
                    <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-xs">Download for</div>
                          <div className="text-sm font-semibold">iOS</div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Android Section */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-4">Android</h3>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1m-6-6v1m0 6h1m5-13a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>

                  {/* Google Play Badge */}
                  <a 
                    href="https://play.google.com/store" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={() => analytics.trackAppDownload('android')}
                  >
                    <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-xs">Download for</div>
                          <div className="text-sm font-semibold">Android</div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Coming Soon Notice */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Coming Soon!</span> The mobile app is currently in development. 
                  For now, enjoy the full experience at <span className="font-mono">clarnote.app</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
