// Purpose: Shared layout with navigation, footer, and accessibility toggles.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Building2, Heart, Tag, BarChart3, Settings, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'light';
  });
  const [dyslexicMode, setDyslexicMode] = useState(() => {
    return localStorage.getItem('dyslexicMode') === 'true';
  });
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';
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
    { name: 'Admin', page: 'Admin', icon: Settings }
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark');
    root.classList.toggle('font-dyslexic', dyslexicMode);
    localStorage.setItem('theme', theme);
    localStorage.setItem('dyslexicMode', String(dyslexicMode));
  }, [theme, dyslexicMode]);

  // Render the UI for this view.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-slate-900 px-4 py-2 rounded-lg shadow"
      >
        Skip to content
      </a>
      <style>{`
        :root {
          --primary-blue: #237ca7;
          --primary-orange: #f18316;
          --primary-navy: #02142c;
          --text-dark: #02142c;
          --text-light: #475569;
        }
      `}</style>

      {/* Header */}
      <header
        className={`backdrop-blur-lg sticky top-0 z-50 shadow-sm ${
          isDark
            ? 'bg-slate-950/90 border-b border-slate-800/60'
            : 'bg-white/80 border-b border-slate-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <img
                src="/src/pictures/Logo.png"
                alt="StreetPulse logo"
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-slate-900">StreetPulse</div>
                <div className={`text-xs font-medium -mt-1 ${isDark ? 'text-sky-300' : 'text-[#237ca7]'}`}>
                  Local Business Discovery
                </div>
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
                        ? (isDark ? 'bg-slate-800 text-slate-100' : 'bg-blue-100 text-blue-700')
                        : (isDark
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-pressed={theme === 'dark'}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
                >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  type="button"
                  onClick={() => setDyslexicMode((prev) => !prev)}
                  aria-pressed={dyslexicMode}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
                >
                  {dyslexicMode ? 'Standard text' : 'Dyslexic mode'}
                </button>
              </div>
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
                  className="px-4 py-2 bg-[#f18316] text-white rounded-lg font-medium hover:bg-[#d96f12] transition-colors shadow-sm whitespace-nowrap"
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
          <div className={`md:hidden border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
            <div className="px-4 py-3 space-y-1">
              <div className="grid gap-2 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-pressed={theme === 'dark'}
                  className="w-full text-left px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  type="button"
                  onClick={() => setDyslexicMode((prev) => !prev)}
                  aria-pressed={dyslexicMode}
                  className="w-full text-left px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {dyslexicMode ? 'Standard text' : 'Dyslexic mode'}
                </button>
              </div>
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
                        ? (isDark ? 'bg-slate-800 text-slate-100' : 'bg-blue-100 text-blue-700')
                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
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
                  className="w-full px-4 py-3 bg-[#f18316] text-white rounded-lg font-medium hover:bg-[#d96f12] whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#02142c] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#237ca7]" />
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
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-300">
            © 2026 StreetPulse. Built for the FBLA Coding & Programming event.
          </div>
        </div>
      </footer>
    </div>
  );
}
