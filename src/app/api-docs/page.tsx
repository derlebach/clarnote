import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ApiPageClient from '@/components/waitlist/ApiPageClient'

export const metadata: Metadata = {
  title: 'API - Clarnote',
  description: 'Build world-class transcription into your product with the Clarnote API. 99%+ accuracy, multi-language, real-time streaming.',
}

export default function API() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ApiPageClient />
    </div>
  )
} 