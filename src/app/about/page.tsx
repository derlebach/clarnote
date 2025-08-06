import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import MobileMenu from '@/components/MobileMenu'

export const metadata: Metadata = {
  title: 'About - Clarnote | Every Meeting Has Value',
  description: 'Born from the frustration of lost insights and forgotten action items, Clarnote transforms how professionals handle meetings. Save 5+ hours weekly with AI-powered transcription.',
  keywords: 'about clarnote, meeting assistant, AI transcription, productivity tool, meeting notes',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Clarnote Logo"
                  width={140}
                  height={32}
                  priority
                  unoptimized
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-900 font-medium">
                About
              </Link>
            </div>
            
            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Start Today
              </Link>
            </div>
            
            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
            Every Meeting Has Value.<br />
            We Help You Capture It.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Born from the frustration of lost insights and forgotten action items, 
            Clarnote transforms how professionals handle meetings.
          </p>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                The Hidden Cost of Bad Meeting Notes
              </h2>
              <div className="space-y-4 text-gray-600 text-base sm:text-lg">
                <p>
                  The average professional spends <strong>31 hours per month</strong> in meetings. 
                  Yet 73% of meeting decisions are forgotten within a week.
                </p>
                <p>
                  Manual note-taking captures only 30% of what's discussed. Important context, 
                  tone, and nuances disappear the moment the meeting ends.
                </p>
                <p>
                  That's millions of valuable insights lost. Decisions unmade. Actions untaken. 
                  Opportunities missed.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              <h3 className="font-bold text-xl mb-4">Without Clarnote:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-lg">✗</span>
                  <span>5+ hours weekly on meeting documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-lg">✗</span>
                  <span>Key decisions lost in notebooks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-lg">✗</span>
                  <span>Follow-ups delayed by days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-lg">✗</span>
                  <span>Team misalignment from poor records</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Brilliantly Simple. Powerfully Effective.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-xl mb-3">Record Once</h3>
              <p className="text-gray-600">
                Upload any meeting recording. Audio or video. Any language. Any length.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-xl mb-3">AI Does the Heavy Lifting</h3>
              <p className="text-gray-600">
                Our AI transcribes, analyzes, and extracts what matters in seconds, not hours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-xl mb-3">Act with Confidence</h3>
              <p className="text-gray-600">
                Get clear summaries, action items, and follow-ups ready to share instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Transform Your Professional Life
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-3">Save 5+ Hours Weekly</h3>
              <p className="text-gray-600">
                Stop writing, start listening. Be fully present while AI captures everything.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-3">Never Miss Critical Details</h3>
              <p className="text-gray-600">
                Every decision, commitment, and insight preserved with perfect accuracy.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-3">Follow Up in Seconds</h3>
              <p className="text-gray-600">
                Professional summaries and action items ready to send before you leave the room.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-3">Build Institutional Knowledge</h3>
              <p className="text-gray-600">
                Searchable archive of every meeting. Find any discussion instantly.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-3">Improve Team Alignment</h3>
              <p className="text-gray-600">
                Everyone gets the same clear record. No more "that's not what I heard."
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-3">Look More Professional</h3>
              <p className="text-gray-600">
                Impress clients and colleagues with thorough, timely meeting documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
            Built for Professionals Who Value Their Time
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Trusted by consultants, project managers, sales teams, and executives 
            who refuse to let valuable insights slip away.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
            <div>
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-gray-600">Meetings Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">5hrs</div>
              <div className="text-gray-600">Saved Weekly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-8">
            To ensure no valuable insight is ever lost in a meeting again. 
            We believe better meeting documentation leads to better decisions, 
            stronger relationships, and more successful outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="bg-white text-black px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Today
            </Link>
            <Link 
              href="/features" 
              className="border border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              See Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 