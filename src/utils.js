// Purpose: Centralized route helper for page links.
// Route lookup stays centralized to avoid hardcoding paths.
const pageRoutes = {
  Home: '/',
  Businesses: '/Businesses',
  BusinessDetail: '/BusinessDetail',
  Favorites: '/Favorites',
  DealsHub: '/DealsHub',
  Reports: '/reports',
  Admin: '/admin',
  Auth: '/Auth',
  About: '/About',
  Contact: '/Contact',
  Privacy: '/Privacy',
  Terms: '/Terms'
};

export function createPageUrl(page) {
  // Convert a page key into a URL while preserving query strings.
  if (!page) return '/';

  const [pageName, queryString] = page.split('?');
  const base = pageRoutes[pageName] || `/${pageName}`;
  return queryString ? `${base}?${queryString}` : base;
}
