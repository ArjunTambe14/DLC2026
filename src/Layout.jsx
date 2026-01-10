import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Building2, Heart, Tag, BarChart3, Settings, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    window.location.href = createPageUrl('Home');
  };

  const navItems = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Businesses', page: 'Businesses', icon: Building2 },
    { name: 'Favorites', page: 'Favorites', icon: Heart },
    { name: 'Deals', page: 'DealsHub', icon: Tag },
    { name: 'Reports', page: 'Reports', icon: BarChart3 },
    { name: 'Admin', page: 'AdminPanel', icon: Settings }
  ].filter((item) => {
    if ((item.page === 'Reports' || item.page === 'AdminPanel') && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

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
                <div className="text-xl font-bold text-slate-900">StreetPulse</div>
                <div className="text-xs text-blue-600 font-medium -mt-1">Local Business Discovery</div>
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
                    <div className="font-medium text-slate-900">{user.fullName}</div>
                    <div className="text-xs text-slate-500">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to={createPageUrl('Auth')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
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
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to={createPageUrl('Auth')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign In
                </Link>
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
                <Sparkles className="w-6 h-6 text-blue-400" />
                <div className="font-bold text-lg">StreetPulse</div>
              </div>
              <p className="text-slate-400 text-sm">
                Discover and support amazing local businesses in your community.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to={createPageUrl('About')} className="block hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-white transition-colors">Contact</Link>
                <Link to={createPageUrl('Privacy')} className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl('Terms')} className="block hover:text-white transition-colors">Terms of Service</Link>
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
            © 2026 StreetPulse. Built for the FBLA Coding & Programming event.
          </div>
        </div>
      </footer>
    </div>
  );
}
