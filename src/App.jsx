// Purpose: Route map and layout wrapper for page navigation.
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Pages/Home.jsx';
import Businesses from './Pages/Businesses.jsx';
import BusinessDetail from './Pages/BusinessDetail.jsx';
import Favorites from './Pages/Favorites.jsx';
import DealsHub from './Pages/DealsHub.jsx';
import Reports from './Pages/Reports.jsx';
import Admin from './Pages/Admin.jsx';
import Auth from './Pages/Auth.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/Contact.jsx';
import Privacy from './Pages/Privacy.jsx';
import Terms from './Pages/Terms.jsx';

const pageNameByPath = {
  '/': 'Home',
  '/Businesses': 'Businesses',
  '/BusinessDetail': 'BusinessDetail',
  '/Favorites': 'Favorites',
  '/DealsHub': 'DealsHub',
  '/reports': 'Reports',
  '/admin': 'Admin',
  '/Auth': 'Auth',
  '/About': 'About',
  '/Contact': 'Contact',
  '/Privacy': 'Privacy',
  '/Terms': 'Terms'
};

function LayoutRoute({ children }) {
  const location = useLocation();
  const currentPageName = pageNameByPath[location.pathname] || 'Home';

  // Render the UI for this view.
  return (
    <Layout currentPageName={currentPageName}>
      {children}
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LayoutRoute>
            <Home />
          </LayoutRoute>
        }
      />
      <Route
        path="/Businesses"
        element={
          <LayoutRoute>
            <Businesses />
          </LayoutRoute>
        }
      />
      <Route
        path="/BusinessDetail"
        element={
          <LayoutRoute>
            <BusinessDetail />
          </LayoutRoute>
        }
      />
      <Route
        path="/Favorites"
        element={
          <LayoutRoute>
            <Favorites />
          </LayoutRoute>
        }
      />
      <Route
        path="/DealsHub"
        element={
          <LayoutRoute>
            <DealsHub />
          </LayoutRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <LayoutRoute>
            <Reports />
          </LayoutRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <LayoutRoute>
            <Admin />
          </LayoutRoute>
        }
      />
      <Route
        path="/Auth"
        element={
          <LayoutRoute>
            <Auth />
          </LayoutRoute>
        }
      />
      <Route
        path="/About"
        element={
          <LayoutRoute>
            <About />
          </LayoutRoute>
        }
      />
      <Route
        path="/Contact"
        element={
          <LayoutRoute>
            <Contact />
          </LayoutRoute>
        }
      />
      <Route
        path="/Privacy"
        element={
          <LayoutRoute>
            <Privacy />
          </LayoutRoute>
        }
      />
      <Route
        path="/Terms"
        element={
          <LayoutRoute>
            <Terms />
          </LayoutRoute>
        }
      />
    </Routes>
  );
}
