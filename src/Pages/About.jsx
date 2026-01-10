// Purpose: Project overview and mission.
import React from 'react';
import { Sparkles, HeartHandshake, MapPin } from 'lucide-react';

export default function About() {
  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">About StreetPulse</h1>
          </div>
          <p className="text-lg text-slate-600 mb-6">
            StreetPulse is a local-business discovery platform built to help communities find, support,
            and celebrate the small businesses that shape their neighborhoods.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6">
              <HeartHandshake className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Community First</h3>
              <p className="text-sm text-slate-600">
                We highlight trusted reviews and real stories so neighbors can find businesses that match their needs.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <MapPin className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Local Discovery</h3>
              <p className="text-sm text-slate-600">
                Category filters, open-now status, and deals make it easy to explore nearby options quickly.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <Sparkles className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Built for Impact</h3>
              <p className="text-sm text-slate-600">
                StreetPulse was created for the FBLA Coding & Programming event to showcase meaningful civic tech.
              </p>
            </div>
          </div>
          <div className="mt-8 text-sm text-slate-500">
            Questions or partnership ideas? Visit the Contact page to connect with us.
          </div>
        </div>
      </div>
    </div>
  );
}
