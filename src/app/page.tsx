"use client"

import { useState } from "react"
import Link from "next/link"
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import MobileMenu from "@/components/MobileMenu"
import Navbar from '@/components/Navbar';

export default function Home() {
  const [showAppModal, setShowAppModal] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [footerLogoError, setFooterLogoError] = useState(false)
  const analytics = useAnalytics()

  const handleGetAppClick = () => {
    analytics.trackButtonClick('get-app', 'hero-section')
    
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
      window.location.href = 'https://apps.apple.com';
    } else if (navigator.userAgent.match(/Android/)) {
      window.location.href = 'https://play.google.com';
    } else {
      setShowAppModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4]">
      <Navbar />
      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              The World's Most Accurate
              <span className="block bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent">
                AI Meeting Assistant
              </span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Powered by our breakthrough transcription engine, Clarnote delivers transcripts so precise and polished they feel better than human. Transform every meeting into insights, action items, and shareable knowledge in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-full">
                  Start Free Trial
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-50 px-8 py-6 text-lg rounded-full"
                onClick={handleGetAppClick}
              >
                Get the App
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required · Join thousands of teams already using Clarnote
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload</h3>
              <p className="text-gray-600">Drop in your audio or video — any format, any language.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transcribe</h3>
              <p className="text-gray-600">Our world-class AI engine captures every word with 99.9% accuracy, separates speakers, and formats perfectly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Act</h3>
              <p className="text-gray-600">Get clean transcripts, instant summaries, and action items you can trust.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Smart Transcription</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🚀</span>
                  <div>
                    <p className="font-semibold">Unmatched Accuracy</p>
                    <p className="text-gray-600">99.9% word-level precision, even in noisy environments.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🗣️</span>
                  <div>
                    <p className="font-semibold">Speaker Intelligence</p>
                    <p className="text-gray-600">Identifies, separates, and labels multiple voices.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🌍</span>
                  <div>
                    <p className="font-semibold">20+ Languages</p>
                    <p className="text-gray-600">Same flawless quality across English, Spanish, French, German, and more.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">AI Summaries & Action Items</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">Executive summaries in seconds</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">Auto-extracted decisions & deadlines</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">Follow-up emails drafted instantly</p>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Share & Export Anywhere</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">One-click PDF, DOCX, or SRT export</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">Shareable meeting links</p>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-3">•</span>
                  <p className="text-gray-700">Integration-ready API</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Meetings?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who never miss important details
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
                Start Free Trial
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
              onClick={handleGetAppClick}
            >
              Get the App
            </Button>
          </div>
        </div>
      </section>

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
