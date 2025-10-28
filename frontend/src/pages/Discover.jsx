import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, ArrowLeft, TrendingUp, Navigation, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Discover = ({ token, logout }) => {
  const navigate = useNavigate();
  const [trendingPins, setTrendingPins] = useState([]);
  const [nearbyPins, setNearbyPins] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    fetchTrending();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          fetchNearby(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          toast.error('Could not get your location');
        }
      );
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await axios.get(`${API}/discover/trending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrendingPins(response.data);
    } catch (error) {
      toast.error('Failed to load trending pins');
    }
  };

  const fetchNearby = async (lat, lng) => {
    try {
      const response = await axios.get(
        `${API}/discover/nearby?lat=${lat}&lng=${lng}&radius_km=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNearbyPins(response.data);
    } catch (error) {
      toast.error('Failed to load nearby pins');
    }
  };

  const handleLike = async (pinId) => {
    try {
      await axios.post(`${API}/pins/${pinId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the current tab
      if (activeTab === 'trending') {
        fetchTrending();
      } else {
        if (userLocation) {
          fetchNearby(userLocation.lat, userLocation.lng);
        }
      }
      toast.success('Pin liked!');
    } catch (error) {
      toast.error('Failed to like pin');
    }
  };

  const displayPins = activeTab === 'trending' ? trendingPins : nearbyPins;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            data-testid="back-to-map-button"
            onClick={() => navigate('/')}
            className="glass rounded-xl px-4 py-2"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Map
          </Button>
          <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3 shadow-xl">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800">Discover</h1>
          </div>
          <div className="w-32"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            data-testid="trending-tab"
            onClick={() => setActiveTab('trending')}
            className={`glass rounded-xl px-6 py-3 ${
              activeTab === 'trending' ? 'bg-white/50' : ''
            }`}
            variant="ghost"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Trending
          </Button>
          <Button
            data-testid="nearby-tab"
            onClick={() => setActiveTab('nearby')}
            className={`glass rounded-xl px-6 py-3 ${
              activeTab === 'nearby' ? 'bg-white/50' : ''
            }`}
            variant="ghost"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Nearby
          </Button>
        </div>

        {/* Pins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPins.length === 0 ? (
            <Card className="glass border-white/20 p-8 col-span-full text-center">
              <p className="text-slate-600">
                {activeTab === 'trending'
                  ? 'No trending pins yet. Be the first to create one!'
                  : 'No nearby pins found. Try exploring other areas!'}
              </p>
            </Card>
          ) : (
            displayPins.map((pin) => (
              <Card
                key={pin.id}
                data-testid={`discover-pin-${pin.id}`}
                className="glass border-white/20 p-5 hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-800 flex-1">{pin.title}</h3>
                  {pin.distance && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-semibold">
                      {pin.distance} km
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2">by @{pin.username}</p>
                <p className="text-slate-700 mb-4 line-clamp-3">{pin.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <button
                    data-testid={`like-pin-${pin.id}`}
                    onClick={() => handleLike(pin.id)}
                    className="flex items-center gap-2 text-slate-600 hover:text-red-500"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">{pin.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{pin.comments?.length || 0}</span>
                  </div>
                  {pin.media_count > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">{pin.media_count}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;