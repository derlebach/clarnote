import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Integrations - Clarnote',
  description: 'Connect Clarnote with your favorite tools. Coming soon: Calendar, Slack, Teams, Notion, CRM, and more.',
}

export default function Integrations() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Connect Everything
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Clarnote will soon integrate with every tool in your workflow. From calendars to CRMs, we're building the platform that connects your meetings to everything that matters.
          </p>
          <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full">
            Join the Waitlist
          </Button>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Integrations Coming Soon
            </h2>
            <p className="text-lg text-gray-600">
              We're building the most comprehensive integration platform for meeting intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Calendar Integration */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Calendar Sync</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Auto-transcribe scheduled meetings from Google Calendar, Outlook, and Apple Calendar. Never miss a meeting again.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Google Calendar</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Outlook</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Apple Calendar</span>
              </div>
            </div>

            {/* Collaboration Tools */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Team Collaboration</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Share transcripts instantly to Slack channels, Teams chats, and Notion pages. Keep everyone in the loop.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Slack</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Teams</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Notion</span>
              </div>
            </div>

            {/* Productivity Tools */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Task Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Auto-create tasks from action items in Asana, Jira, and Trello. Turn conversations into deliverables.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Asana</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Jira</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Trello</span>
              </div>
            </div>

            {/* CRM Integration */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">CRM & Sales</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sync client meetings to HubSpot and Salesforce. Capture every deal detail and follow-up automatically.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">HubSpot</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Salesforce</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Pipedrive</span>
              </div>
            </div>

            {/* Video Platforms */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Video Platforms</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Auto-join and transcribe Zoom, Google Meet, and Teams calls. Record everything, miss nothing.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Zoom</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Google Meet</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Teams</span>
              </div>
            </div>

            {/* Developer Tools */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Developer API</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Build custom integrations with our powerful API. Connect Clarnote to any tool in your stack.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">REST API</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Webhooks</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">SDKs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Integrations Matter */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Why Integrations Change Everything
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔄 Seamless Workflow</h3>
              <p className="text-gray-600">
                No more copy-pasting transcripts. Meeting insights flow directly into your existing tools and processes.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Instant Action</h3>
              <p className="text-gray-600">
                Action items become tasks, decisions update CRMs, and summaries reach the right channels automatically.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 Zero Context Loss</h3>
              <p className="text-gray-600">
                Every conversation connects to the broader project. Build institutional knowledge that never gets lost.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Scale Your Impact</h3>
              <p className="text-gray-600">
                Turn meeting intelligence into organizational intelligence. Make every conversation count across your entire company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Help Us Build What You Need
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Missing an integration? Tell us what you need most. The community's top requests get built first.
          </p>
          
          <form className="space-y-4 mb-8">
            <Input 
              type="text" 
              placeholder="What tool do you want to integrate with Clarnote?"
              className="text-center"
            />
            <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-full w-full sm:w-auto">
              Suggest Integration
            </Button>
          </form>
          
          <p className="text-sm text-gray-500">
            Join 2,847 professionals already on the integration waitlist
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            The Future of Connected Meetings Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be first in line when integrations launch. Join the waitlist today.
          </p>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg rounded-full">
            Join Waitlist
          </Button>
        </div>
      </section>
    </div>
  )
} 