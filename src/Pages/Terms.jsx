// Purpose: Terms of service copy.
import React from 'react';

export default function Terms() {
  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg p-10 space-y-6">
          <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-slate-600">
            By using StreetPulse, you agree to the following terms. Please read them carefully before using the
            platform.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Responsibilities</h2>
            <p className="text-slate-600">
              You are responsible for maintaining the confidentiality of your account credentials and for any
              activity under your account.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Community Guidelines</h2>
            <p className="text-slate-600">
              Reviews must be honest, respectful, and relevant. Spam, harassment, or fraudulent content will be
              removed by administrators.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Deals & Promotions</h2>
            <p className="text-slate-600">
              Deals are provided by businesses and may change without notice. Always verify terms with the business
              before redeeming an offer.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Limitation of Liability</h2>
            <p className="text-slate-600">
              StreetPulse is a discovery tool and does not guarantee service quality or outcomes. Use listings at
              your discretion.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Last updated: August 2026
          </p>
        </div>
      </div>
    </div>
  );
}
