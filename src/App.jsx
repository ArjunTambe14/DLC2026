import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Pages/Home.jsx';
import Businesses from './Pages/Businesses.jsx';
import BusinessDetail from './Pages/BusinessDetail.jsx';
import Favorites from './Pages/Favorites.jsx';
import DealsHub from './Pages/DealsHub.jsx';
import Reports from './Pages/Reports.jsx';
import AdminPanel from './Pages/AdminPanel.jsx';

const pageNameByPath = {
  '/': 'Home',
  '/Businesses': 'Businesses',
  '/BusinessDetail': 'BusinessDetail',
  '/Favorites': 'Favorites',
  '/DealsHub': 'DealsHub',
  '/Reports': 'Reports',
  '/AdminPanel': 'AdminPanel'
};

function LayoutRoute({ children }) {
  const location = useLocation();
  const currentPageName = pageNameByPath[location.pathname] || 'Home';

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
        path="/Reports"
        element={
          <LayoutRoute>
            <Reports />
          </LayoutRoute>
        }
      />
      <Route
        path="/AdminPanel"
        element={
          <LayoutRoute>
            <AdminPanel />
          </LayoutRoute>
        }
      />
    </Routes>
  );
}
