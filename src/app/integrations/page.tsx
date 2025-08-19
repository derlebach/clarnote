import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import IntegrationsPageClient from '@/components/waitlist/IntegrationsPageClient'

export const metadata: Metadata = {
  title: 'Integrations - Clarnote',
  description: 'Connect Clarnote with your favorite tools. Coming soon: Calendar, Slack, Teams, Notion, CRM, and more.',
}

export default function Integrations() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <IntegrationsPageClient />
    </div>
  )
} 