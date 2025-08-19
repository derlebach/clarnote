import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Waitlist Confirmed - Clarnote',
  description: 'You have successfully joined the Clarnote waitlist.',
  robots: 'noindex, nofollow',
}

export default async function WaitlistConfirmed({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; email?: string }>
}) {
  const params = await searchParams;
  const context = params.context || 'waitlist';
  const email = params.email;

  const contextName = context === 'integrations' ? 'Integrations' : 'API Early Access';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to the {contextName} waitlist! 🎉
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Your email has been confirmed and you're now officially on the list.
              {email && (
                <>
                  <br />
                  <span className="text-gray-500 dark:text-gray-400 text-base">
                    We'll send updates to {email}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What happens next?
            </h2>
            <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                We'll email you as soon as {context === 'integrations' ? 'integrations are' : 'the API is'} ready
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                You'll get early access before the public launch
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                No spam, just the important updates you want to hear
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-3 rounded-full">
              <Link href="/">Back to Homepage</Link>
            </Button>
            <Button variant="outline" asChild className="px-8 py-3 rounded-full">
              <Link href={context === 'integrations' ? '/integrations' : '/api-docs'}>
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 