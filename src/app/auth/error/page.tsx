'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthSignin':
        return 'Error occurred while trying to sign in with OAuth provider.'
      case 'OAuthCallback':
        return 'Error occurred while handling the OAuth callback.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.'
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.'
      case 'Callback':
        return 'Error occurred in the OAuth callback handler route.'
      case 'OAuthAccountNotLinked':
        return 'The email on this account is already linked with another account.'
      case 'EmailSignin':
        return 'The e-mail could not be sent.'
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Loading...
          </h2>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Clarnote Logo"
                  width={140}
                  height={32}
                  priority
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const textFallback = document.createElement('span');
                    textFallback.className = 'text-2xl font-bold text-gray-900 dark:text-white';
                    textFallback.textContent = 'Clarnote';
                    target.parentNode?.appendChild(textFallback);
                  }}
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Content with Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <ErrorContent />
      </Suspense>
    </div>
  )
} 