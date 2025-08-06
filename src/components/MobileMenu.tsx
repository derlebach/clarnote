'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50 mt-2">
            <nav className="flex flex-col p-4 space-y-3">
              <Link 
                href="/features" 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                About
              </Link>
              <hr className="my-2 border-gray-200" />
              <Link 
                href="/auth/signin" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 bg-black text-white rounded-lg text-center hover:bg-gray-900 transition-colors"
              >
                Start Today
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
} 