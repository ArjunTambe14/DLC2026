import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg p-10 space-y-6">
          <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-600">
            StreetPulse respects your privacy. This policy explains what data we collect, how we use it,
            and the choices you have regarding your information.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Information We Collect</h2>
            <p className="text-slate-600">
              We collect account details (name, email), reviews you submit, favorites you save, and usage analytics
              that help improve the platform.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">How We Use Information</h2>
            <p className="text-slate-600">
              We use data to personalize your experience, maintain security, display trusted reviews, and measure
              local engagement trends for administrative insights.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your Choices</h2>
            <p className="text-slate-600">
              You can update your profile, remove favorites, and delete reviews. Contact us if you need to remove
              your account data.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Data Security</h2>
            <p className="text-slate-600">
              Passwords are hashed and access to admin tools is restricted by role-based controls.
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
