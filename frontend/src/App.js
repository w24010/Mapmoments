import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import Auth from './pages/Auth';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import { Toaster } from '@/components/ui/sonner';

// Configure axios globally
// axios.defaults.withCredentials = true; // Temporarily disabled for testing

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <MapView token={token} logout={logout} user={user} setUser={setUser} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/auth"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <Auth setToken={setToken} setUser={setUser} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              token ? (
                <Profile token={token} logout={logout} user={user} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route
            path="/discover"
            element={
              token ? (
                <Discover token={token} logout={logout} />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;