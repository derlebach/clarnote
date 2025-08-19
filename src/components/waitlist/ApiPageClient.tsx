'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WaitlistModal from '@/components/waitlist/WaitlistModal';
import { useWaitlistModal } from '@/components/waitlist/useWaitlistModal';

export default function ApiPageClient() {
  const { isOpen, context, source, openApiWaitlist, closeWaitlist } = useWaitlistModal();

  return (
    <>
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
          <Button 
            size="lg" 
            className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full"
            onClick={() => openApiWaitlist('hero')}
          >
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
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@meeting.mp3" \\
  -F "language=auto" \\
  -F "speakers=true"`}
            </pre>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-xs mb-2">Response:</p>
              <pre className="text-blue-400 text-sm">
{`{
  "id": "txn_abc123",
  "status": "completed",
  "transcript": [
    {
      "speaker": "Speaker 1",
      "text": "Let's review the Q4 numbers...",
      "start": 0.0,
      "end": 2.8
    },
    {
      "speaker": "Speaker 2", 
      "text": "Revenue is up 23% from last quarter.",
      "start": 3.1,
      "end": 5.9
    }
  ],
  "summary": "Discussion of Q4 financial performance...",
  "action_items": [
    "Schedule follow-up meeting for budget review"
  ],
  "language": "en",
  "confidence": 0.97
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Why Clarnote API */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Clarnote API?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The same world-class transcription engine that powers our app, now available for developers to integrate anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">99%+ Accuracy</h3>
              <p className="text-gray-600 text-sm">Industry-leading transcription accuracy across all languages and environments</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Speakers</h3>
              <p className="text-gray-600 text-sm">Automatic speaker detection and labeling with advanced diarization</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">20+ Languages</h3>
              <p className="text-gray-600 text-sm">Multi-language support with consistent quality across all supported languages</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Real-time streaming and batch processing with sub-second response times</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Every Use Case
            </h2>
            <p className="text-xl text-gray-600">
              From startups to enterprises, developers trust Clarnote API to power their transcription needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎥 Video Platforms</h3>
              <p className="text-gray-600 mb-4">
                Add automatic captions and transcripts to video content. Perfect for education, media, and conferencing platforms.
              </p>
              <div className="text-sm text-gray-500">
                Zoom, Loom, Riverside, custom video apps
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📞 Customer Support</h3>
              <p className="text-gray-600 mb-4">
                Transcribe support calls for quality assurance, training, and compliance. Extract insights from customer conversations.
              </p>
              <div className="text-sm text-gray-500">
                Call centers, CRM systems, helpdesk tools
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎙️ Podcast & Media</h3>
              <p className="text-gray-600 mb-4">
                Generate searchable transcripts for podcasts, interviews, and media content. Improve accessibility and SEO.
              </p>
              <div className="text-sm text-gray-500">
                Podcast platforms, media companies, content creators
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🏥 Healthcare & Legal</h3>
              <p className="text-gray-600 mb-4">
                Accurate transcription for medical consultations, legal proceedings, and compliance documentation.
              </p>
              <div className="text-sm text-gray-500">
                EMR systems, legal tech, compliance tools
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 Education & Training</h3>
              <p className="text-gray-600 mb-4">
                Transcribe lectures, training sessions, and educational content. Make learning more accessible and searchable.
              </p>
              <div className="text-sm text-gray-500">
                LMS platforms, online courses, corporate training
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔧 Custom Applications</h3>
              <p className="text-gray-600 mb-4">
                Build voice-enabled applications, meeting assistants, and productivity tools with our flexible API.
              </p>
              <div className="text-sm text-gray-500">
                SaaS products, mobile apps, voice interfaces
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Developer-First Experience
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Built by developers, for developers. Get up and running in minutes with our intuitive API.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Simple Integration</h3>
              <p className="text-gray-600 text-sm">
                RESTful API with clear documentation. Upload audio, get transcripts. It's that simple.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Real-time Streaming</h3>
              <p className="text-gray-600 text-sm">
                WebSocket support for live transcription. Perfect for real-time applications and live events.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Flexible SDKs</h3>
              <p className="text-gray-600 text-sm">
                Official SDKs for Python, Node.js, and more. Get started faster with your favorite language.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Rich Metadata</h3>
              <p className="text-gray-600 text-sm">
                Timestamps, confidence scores, speaker labels, and more. Get the full context, not just text.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Enterprise Security</h3>
              <p className="text-gray-600 text-sm">
                SOC 2 compliant with end-to-end encryption. Your data stays secure and private.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Scalable Infrastructure</h3>
              <p className="text-gray-600 text-sm">
                Auto-scaling infrastructure handles everything from prototype to production workloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Get Early Access
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 500+ developers already building with Clarnote API
          </p>
          
          <form className="max-w-lg mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="your@email.com"
                className="bg-white/10 border-white/20 text-white placeholder-gray-300"
              />
              <Input 
                type="text" 
                placeholder="Tell us about your use case"
                className="bg-white/10 border-white/20 text-white placeholder-gray-300"
              />
              <Button 
                type="button" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full w-full sm:w-auto"
                onClick={() => openApiWaitlist('footer')}
              >
                Request Early Access
              </Button>
            </div>
          </form>
          
          <p className="text-sm text-gray-400">
            API launching soon • Free tier available • No credit card required
          </p>
        </div>
      </section>

      {/* Waitlist Modal */}
      {context && (
        <WaitlistModal
          isOpen={isOpen}
          onClose={closeWaitlist}
          context={context}
          source={source}
        />
      )}
    </>
  );
} 