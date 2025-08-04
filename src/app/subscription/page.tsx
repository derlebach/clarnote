"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProfileMenu from '@/components/ProfileMenu'

export default function Subscription() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4]">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/80 border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Clarnote</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
          <p className="text-xl text-gray-600">Unlock advanced features and unlimited meetings</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pro Plan</h2>
            <div className="text-4xl font-bold text-gray-900 mb-1">$5<span className="text-lg text-gray-600">/month</span></div>
            <p className="text-gray-600 mb-6">Cancel anytime</p>
            
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Unlimited meetings</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Advanced AI insights</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Export to multiple formats</span>
              </div>
            </div>
            
            <Button
              onClick={() => {
                // TODO: Integrate with Stripe checkout
                alert('Stripe integration coming soon!')
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 mb-4"
            >
              Start Pro Subscription
            </Button>
            
            <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 