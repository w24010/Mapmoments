import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Configure axios to send credentials
// axios.defaults.withCredentials = true; // Temporarily disabled for testing
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API}/auth/login` : `${API}/auth/register`;
      const data = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      console.log('Sending request to:', endpoint);
      console.log('Request data:', data);
      
      const response = await axios.post(endpoint, data);
      console.log('Response:', response.data);
      
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      console.error('Auth error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      console.log('Guest login to:', `${API}/auth/guest`);
      const response = await axios.post(`${API}/auth/guest`);
      console.log('Guest response:', response.data);
      
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Welcome, Guest!');
    } catch (error) {
      console.error('Guest login error:', error);
      console.error('Guest error response:', error.response?.data);
      toast.error(error.response?.data?.detail || error.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card data-testid="auth-card" className="w-full max-w-md glass border-white/20 shadow-2xl relative z-10">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MapMoments
              </h1>
            </div>
          </div>

          <p className="text-center text-slate-600 mb-8 text-base">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to start sharing memories.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!isLogin}
                  className="glass border-white/30 focus:border-blue-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="glass border-white/30 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="glass border-white/30 focus:border-blue-400"
              />
            </div>

            <Button
              data-testid="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              data-testid="guest-login-button"
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-6 rounded-xl shadow-lg"
            >
              Continue as Guest
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;