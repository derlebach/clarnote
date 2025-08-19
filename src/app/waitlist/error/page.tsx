import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Confirmation Error - Clarnote',
  description: 'There was an error confirming your waitlist signup.',
  robots: 'noindex, nofollow',
}

export default function WaitlistError({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const message = searchParams.message || 'Something went wrong';
  
  const getErrorDetails = (message: string) => {
    switch (message.toLowerCase()) {
      case 'invalid confirmation link':
        return {
          title: 'Invalid Confirmation Link',
          description: 'This confirmation link is not valid. Please check the link in your email or request a new one.',
        };
      case 'confirmation link expired or invalid':
      case 'confirmation link expired':
        return {
          title: 'Link Expired',
          description: 'This confirmation link has expired. Confirmation links are valid for 24 hours.',
        };
      default:
        return {
          title: 'Confirmation Error',
          description: 'There was an error confirming your waitlist signup. Please try again.',
        };
    }
  };
  
  const { title, description } = getErrorDetails(message);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What can you do?
            </h2>
            <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                Check your email for the most recent confirmation link
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                Try signing up for the waitlist again if the link has expired
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                Contact us at{' '}
                <a 
                  href="mailto:hello@clarnote.com" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  hello@clarnote.com
                </a>{' '}
                if you continue having issues
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-3 rounded-full">
              <Link href="/">Back to Homepage</Link>
            </Button>
            <Button variant="outline" asChild className="px-8 py-3 rounded-full">
              <Link href="/integrations">Try Again</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 