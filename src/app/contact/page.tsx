import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Contact — Clarnote',
  description: 'Get support for Clarnote at hello@clarnote.com. We typically respond within 24 hours.',
  robots: 'index, follow',
  openGraph: {
    title: 'Contact — Clarnote',
    description: 'Get support for Clarnote at hello@clarnote.com. We typically respond within 24 hours.',
    url: 'https://clarnote.com/contact',
    siteName: 'Clarnote',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact — Clarnote',
    description: 'Get support for Clarnote at hello@clarnote.com. We typically respond within 24 hours.',
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Clarnote",
  "url": "https://clarnote.com",
  "contactPoint": [{
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@clarnote.com",
    "areaServed": "Worldwide",
    "availableLanguage": ["en"],
    "hoursAvailable": "Mo-Fr 09:00-18:00"
  }]
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We're here to help you get the most out of Clarnote
            </p>
          </div>
        </section>

        {/* Support Card */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-10">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Support
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  For technical support, billing questions, or general inquiries
                </p>
                
                <div className="mb-6">
                  <a 
                    href="mailto:hello@clarnote.com"
                    className="inline-flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 shadow-sm"
                    aria-label="Send email to Clarnote support"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Support
                  </a>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We typically respond within 24 hours, Monday–Friday
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
              Company Information
            </h2>
            
            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Operated by
                </p>
                <p>DE Management Group s.r.o.</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Address
                </p>
                <p>
                  Klimentská 2066/19<br />
                  Nové Město<br />
                  110 00 Prague 1<br />
                  Czech Republic
                </p>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Company Registration Number
                </p>
                <p>07345771</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
} 