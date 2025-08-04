"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProfileMenu from '@/components/ProfileMenu'

const sidebarSections = [
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'sessions', label: 'Sessions', icon: 'monitor' },
  { id: 'data', label: 'Data', icon: 'database' },
]

const icons = {
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  monitor: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  database: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
}

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('account')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editedEmail, setEditedEmail] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) {
      setEditedName(session.user.name)
    }
    if (session?.user?.email) {
      setEditedEmail(session.user.email)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f8f9] via-[#f2f3f5] to-[#eef1f4] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleNameSave = async () => {
    // TODO: Implement name update API call
    console.log('Saving name:', editedName)
    setIsEditingName(false)
  }

  const handleEmailSave = async () => {
    // TODO: Implement email update API call
    console.log('Saving email:', editedEmail)
    setIsEditingEmail(false)
  }

  const handleUpgradeToPro = () => {
    // TODO: Implement Stripe checkout or redirect to /subscription
    router.push('/subscription')
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
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
              <nav className="space-y-2">
                {sidebarSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {icons[section.icon as keyof typeof icons]}
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeSection === 'account' && (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">Account Settings</h1>
                
                {/* Full Name */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Full Name</label>
                  <div className="flex items-center space-x-4">
                    {isEditingName ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                        <Button
                          onClick={handleNameSave}
                          size="sm"
                          className="bg-gray-900 hover:bg-gray-800"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingName(false)
                            setEditedName(session?.user?.name || '')
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-gray-900 font-medium">{session.user.name}</span>
                        <Button
                          onClick={() => setIsEditingName(true)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Edit name
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
                  <div className="flex items-center space-x-4">
                    {isEditingEmail ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                        <Button
                          onClick={handleEmailSave}
                          size="sm"
                          className="bg-gray-900 hover:bg-gray-800"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingEmail(false)
                            setEditedEmail(session?.user?.email || '')
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-gray-900 font-medium">{session.user.email}</span>
                        <Button
                          onClick={() => setIsEditingEmail(true)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Update email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscription */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Subscription</label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium">Free Plan</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Current</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Basic features included</p>
                    </div>
                    <Button
                      onClick={handleUpgradeToPro}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <div className="text-center">
                        <div className="font-medium">Upgrade to Pro</div>
                        <div className="text-xs opacity-90">$5/month – cancel anytime</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Account Created */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Account Created</label>
                  <span className="text-gray-900">January 1, 2024</span>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">Security</h1>
                <p className="text-gray-600">Security settings will be available soon.</p>
              </div>
            )}

            {activeSection === 'sessions' && (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">Sessions</h1>
                <p className="text-gray-600">Session management will be available soon.</p>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8">Data</h1>
                <p className="text-gray-600">Data management options will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 