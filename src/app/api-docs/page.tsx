import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'API - Clarnote',
  description: 'Build world-class transcription into your product with the Clarnote API. 99%+ accuracy, multi-language, real-time streaming.',
}

export default function API() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            World-Class Transcription
            <br />
            <span className="text-blue-600">In Your Product</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Add 99%+ accurate transcription, smart speaker detection, and multi-language support to any application. The same engine that powers Clarnote, now available as an API.
          </p>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full">
            Request Early Access
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            API launching soon • Join 500+ developers on the waitlist
          </p>
        </div>
      </section>

      {/* Code Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Simple. Powerful. Fast.</h3>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X POST "https://api.clarnote.com/v1/transcribe" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@meeting.mp3" \\
  -F "language=auto" \\
  -F "speakers=true"

{
  "id": "trans_abc123",
  "status": "completed",
  "transcript": "Welcome everyone to today's meeting...",
  "speakers": [
    {
      "speaker": "Person 1",
      "text": "Welcome everyone to today's meeting.",
      "start": 0.0,
      "end": 2.5,
      "confidence": 0.98
    }
  ],
  "summary": "Team discussed Q1 goals and timeline...",
  "language": "en",
  "confidence": 0.97,
  "processing_time": 12.3
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why Clarnote API */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Clarnote API
            </h2>
            <p className="text-lg text-gray-600">
              Built by transcription experts, trusted by thousands of users
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">99%+ Accuracy</h3>
              <p className="text-gray-600">
                Industry-leading accuracy that exceeds human transcriptionists. Perfect for professional applications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Speaker Detection</h3>
              <p className="text-gray-600">
                Automatically identifies and separates multiple speakers with advanced AI algorithms.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">20+ Languages</h3>
              <p className="text-gray-600">
                Support for major world languages with the same high accuracy across all supported languages.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Streaming</h3>
              <p className="text-gray-600">
                Process audio in real-time with WebSocket streaming. Perfect for live applications and instant feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">
                SOC 2 compliant with end-to-end encryption. Your audio data is processed securely and never stored.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">99.9% Uptime</h3>
              <p className="text-gray-600">
                Built on enterprise infrastructure with global CDN and automatic failover for maximum reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Every Industry
            </h2>
            <p className="text-lg text-gray-600">
              From startups to enterprises, developers trust Clarnote API
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 Education Platforms</h3>
              <p className="text-gray-600 mb-4">
                Add live lecture transcription, automatic note-taking, and accessibility features to learning management systems.
              </p>
              <div className="text-sm text-gray-500">
                "Increased student engagement by 40% with real-time captions"
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🏥 Healthcare Apps</h3>
              <p className="text-gray-600 mb-4">
                Transcribe patient consultations, medical dictation, and telemedicine calls with HIPAA-compliant processing.
              </p>
              <div className="text-sm text-gray-500">
                "Saved doctors 2 hours per day on documentation"
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📞 Customer Support</h3>
              <p className="text-gray-600 mb-4">
                Analyze support calls, generate summaries, and extract action items automatically from customer conversations.
              </p>
              <div className="text-sm text-gray-500">
                "Improved resolution time by 35% with instant call summaries"
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎥 Media & Content</h3>
              <p className="text-gray-600 mb-4">
                Generate accurate subtitles, create searchable video libraries, and enable content accessibility at scale.
              </p>
              <div className="text-sm text-gray-500">
                "Processed 10,000+ hours of content with 99.8% accuracy"
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">💼 Business Tools</h3>
              <p className="text-gray-600 mb-4">
                Build meeting intelligence into productivity apps, CRMs, and project management platforms.
              </p>
              <div className="text-sm text-gray-500">
                "Integrated into 50+ business applications"
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔬 Research Platforms</h3>
              <p className="text-gray-600 mb-4">
                Transcribe interviews, focus groups, and research sessions with precise timestamps and speaker identification.
              </p>
              <div className="text-sm text-gray-500">
                "Accelerated research analysis by 60%"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Developer-First Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 RESTful API</h3>
              <p className="text-gray-600">
                Clean, intuitive REST endpoints with comprehensive documentation and interactive examples.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ WebSocket Streaming</h3>
              <p className="text-gray-600">
                Real-time transcription with low-latency WebSocket connections for live applications.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📦 Official SDKs</h3>
              <p className="text-gray-600">
                Native SDKs for Python, JavaScript, Go, and more. Get started in minutes, not hours.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Secure Authentication</h3>
              <p className="text-gray-600">
                API keys, OAuth 2.0, and webhook signatures. Enterprise-grade security built in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the Developer Waitlist
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be among the first to build with the world's most accurate transcription API. Early access includes free credits and priority support.
          </p>
          
          <form className="space-y-4 mb-8">
            <Input 
              type="email" 
              placeholder="your-email@company.com"
              className="bg-white/10 border-white/20 text-white placeholder-gray-300"
            />
            <Input 
              type="text" 
              placeholder="Tell us about your use case"
              className="bg-white/10 border-white/20 text-white placeholder-gray-300"
            />
            <Button type="submit" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full w-full sm:w-auto">
              Request Early Access
            </Button>
          </form>
          
          <p className="text-sm text-gray-400">
            API launching soon • Free tier available • No credit card required
          </p>
        </div>
      </section>
    </div>
  )
} 