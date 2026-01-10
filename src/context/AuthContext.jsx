// Purpose: Auth state provider for login/logout flows.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the current user from the token stored in localStorage.
  const loadUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state on first render.
  useEffect(() => {
    loadUser();
  }, []);

  // Log in and persist the token for future requests.
  const login = async ({ email, password }) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Sign up with bot verification to keep accounts legit.
  const signup = async ({ fullName, email, password, challengeToken, challengeAnswer }) => {
    const data = await api.post('/auth/signup', {
      fullName,
      email,
      password,
      challengeToken,
      challengeAnswer
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Clear server session and local token.
  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore logout errors.
    }
    setToken(null);
    setUser(null);
  };

  // Render the UI for this view.
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
