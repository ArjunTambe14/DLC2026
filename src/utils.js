const pageRoutes = {
  Home: '/',
  Businesses: '/Businesses',
  BusinessDetail: '/BusinessDetail',
  Favorites: '/Favorites',
  DealsHub: '/DealsHub',
  Reports: '/Reports',
  AdminPanel: '/AdminPanel'
};

export function createPageUrl(page) {
  if (!page) return '/';

  const [pageName, queryString] = page.split('?');
  const base = pageRoutes[pageName] || `/${pageName}`;
  return queryString ? `${base}?${queryString}` : base;
}
