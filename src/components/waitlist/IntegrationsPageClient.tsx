'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WaitlistModal from '@/components/waitlist/WaitlistModal';
import { useWaitlistModal } from '@/components/waitlist/useWaitlistModal';

export default function IntegrationsPageClient() {
  const { isOpen, context, source, openIntegrationsWaitlist, closeWaitlist } = useWaitlistModal();

  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Connect Everything
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Clarnote will soon integrate with every tool in your workflow. From calendars to CRMs, we're building the platform that connects your meetings to everything that matters.
          </p>
          <Button 
            size="lg" 
            className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full"
            onClick={() => openIntegrationsWaitlist('hero')}
          >
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
                Automatic meeting detection and transcription from Google Calendar, Outlook, and Apple Calendar
              </p>
              <div className="text-sm text-gray-500">
                Google Calendar • Outlook • Apple Calendar
              </div>
            </div>

            {/* Communication Tools */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Team Chat</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Share meeting summaries and action items directly to your team channels
              </p>
              <div className="text-sm text-gray-500">
                Slack • Microsoft Teams • Discord
              </div>
            </div>

            {/* Productivity Tools */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Note Taking</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sync meeting notes and transcripts with your favorite productivity apps
              </p>
              <div className="text-sm text-gray-500">
                Notion • Obsidian • Roam Research
              </div>
            </div>

            {/* CRM Integration */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">CRM Systems</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Automatically log meeting summaries and follow-ups to your customer records
              </p>
              <div className="text-sm text-gray-500">
                HubSpot • Salesforce • Pipedrive
              </div>
            </div>

            {/* Project Management */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Task Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Convert action items into tasks and track progress across your projects
              </p>
              <div className="text-sm text-gray-500">
                Asana • Trello • Jira • Linear
              </div>
            </div>

            {/* Video Platforms */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Video Platforms</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Native integrations with popular video conferencing platforms for seamless recording
              </p>
              <div className="text-sm text-gray-500">
                Zoom • Google Meet • Teams • WebEx
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Integrations Matter */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Integrations Matter
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Your meetings don't exist in isolation. They're part of a larger workflow that spans tools, teams, and timelines.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seamless Workflow</h3>
              <p className="text-gray-600">
                No more copy-pasting summaries or manually creating tasks. Your meeting insights flow directly into the tools you already use.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Centralized Knowledge</h3>
              <p className="text-gray-600">
                Build a searchable database of decisions, action items, and insights that lives where your team works.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated Follow-ups</h3>
              <p className="text-gray-600">
                Turn meeting outcomes into actionable next steps without the manual overhead.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Alignment</h3>
              <p className="text-gray-600">
                Keep everyone in the loop with automatic sharing to relevant channels and stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Help Shape Our Integrations
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're building integrations based on what you need most. Tell us which tools are essential to your workflow.
          </p>
          
          <form className="max-w-lg mx-auto mb-8">
            <div className="flex gap-4">
              <Input 
                type="text" 
                placeholder="Which integration would you love to see?"
                className="flex-1"
              />
              <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 px-6">
                Suggest
              </Button>
            </div>
          </form>
          
          <p className="text-sm text-gray-500">
            Join the waitlist to vote on integrations and get early access when they launch.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            The Future of Connected Meetings Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be first in line when integrations launch. Join the waitlist today.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg rounded-full"
            onClick={() => openIntegrationsWaitlist('footer')}
          >
            Join Waitlist
          </Button>
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