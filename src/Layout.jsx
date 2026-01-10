import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Home, Building2, Heart, Tag, BarChart3, Settings, Menu, X, Sparkles } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const navItems = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Businesses', page: 'Businesses', icon: Building2 },
    { name: 'Favorites', page: 'Favorites', icon: Heart },
    { name: 'Deals', page: 'DealsHub', icon: Tag },
    { name: 'Reports', page: 'Reports', icon: BarChart3 },
    { name: 'Admin', page: 'AdminPanel', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <style>{`
        :root {
          --primary-blue: #1e40af;
          --primary-orange: #f97316;
          --primary-green: #059669;
          --text-dark: #1e293b;
          --text-light: #64748b;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-slate-900">Byte-Sized</div>
                <div className="text-xs text-blue-600 font-medium -mt-1">Business Boost</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">{user.full_name}</div>
                    <div className="text-xs text-slate-500">{user.role}</div>
                  </div>
                  <button
                    onClick={() => base44.auth.logout()}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {user ? (
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">Byte-Sized Business Boost</div>
                  <div className="text-xs text-blue-400">Powered by LocalLift AI</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Discover and support amazing local businesses in your community.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div>About Us</div>
                <div>Contact</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support Local</h3>
              <p className="text-slate-400 text-sm">
                Every review, bookmark, and visit helps local businesses thrive. Thank you for supporting your community!
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
            © 2024 Byte-Sized Business Boost. Built for FBLA.
          </div>
        </div>
      </footer>
    </div>
  );
}