import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, ArrowLeft, Search as SearchIcon, Users, Image, Calendar, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Search = ({ token, logout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('locations');
  
  // Search results
  const [locationResults, setLocationResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [eventResults, setEventResults] = useState([]);
  
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);

    try {
      // Search all categories
      await Promise.all([
        searchLocations(),
        searchAlbums(),
        searchPeople(),
        searchEvents()
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async () => {
    try {
      // Use Mapbox Geocoding API
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            limit: 10
          }
        }
      );
      setLocationResults(response.data.features || []);
    } catch (error) {
      console.error('Location search error:', error);
      setLocationResults([]);
    }
  };

  const searchAlbums = async () => {
    try {
      const response = await axios.get(`${API}/pins/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlbumResults(response.data);
    } catch (error) {
      console.error('Album search error:', error);
      setAlbumResults([]);
    }
  };

  const searchPeople = async () => {
    try {
      const response = await axios.get(`${API}/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeopleResults(response.data);
    } catch (error) {
      console.error('People search error:', error);
      setPeopleResults([]);
    }
  };

  const searchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventResults(response.data);
    } catch (error) {
      console.error('Event search error:', error);
      setEventResults([]);
    }
  };

  const navigateToLocation = (location) => {
    const [lng, lat] = location.center;
    navigate(`/?lat=${lat}&lng=${lng}&zoom=14`);
  };

  const navigateToAlbum = (album) => {
    navigate(`/?pin=${album.id}`);
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(`${API}/friends/request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send request');
    }
  };

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
            <SearchIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800">Search</h1>
          </div>
          <div className="w-32"></div>
        </div>

        {/* Search Bar */}
        <Card data-testid="search-card" className="glass border-white/20 p-6 mb-8 shadow-xl">
          <div className="flex gap-3">
            <Input
              data-testid="global-search-input"
              placeholder="Search for locations, albums, people, or events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="glass border-white/30 text-lg"
            />
            <Button
              data-testid="search-submit-button"
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
            >
              {loading ? 'Searching...' : <SearchIcon className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass border-white/20 p-1 mb-6">
            <TabsTrigger value="locations" className="flex items-center gap-2" data-testid="locations-tab">
              <Navigation className="w-4 h-4" />
              Locations ({locationResults.length})
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center gap-2" data-testid="albums-tab">
              <Image className="w-4 h-4" />
              Albums ({albumResults.length})
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2" data-testid="people-tab">
              <Users className="w-4 h-4" />
              People ({peopleResults.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2" data-testid="events-tab">
              <Calendar className="w-4 h-4" />
              Events ({eventResults.length})
            </TabsTrigger>
          </TabsList>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <div className="space-y-3">
              {locationResults.length === 0 ? (
                <Card className="glass border-white/20 p-8 text-center">
                  <p className="text-slate-600">
                    {searchQuery ? 'No locations found. Try a different search.' : 'Search for places, cities, addresses...'}
                  </p>
                </Card>
              ) : (
                locationResults.map((location, index) => (
                  <Card
                    key={index}
                    data-testid={`location-result-${index}`}
                    className="glass border-white/20 p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigateToLocation(location)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{location.text}</h3>
                        <p className="text-sm text-slate-600">{location.place_name}</p>
                        {location.context && (
                          <p className="text-xs text-slate-500 mt-1">
                            {location.context.map(c => c.text).join(', ')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        View on Map
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {albumResults.length === 0 ? (
                <Card className="glass border-white/20 p-8 text-center col-span-full">
                  <p className="text-slate-600">
                    {searchQuery ? 'No albums found. Try a different search.' : 'Search for photo and video albums...'}
                  </p>
                </Card>
              ) : (
                albumResults.map((album) => (
                  <Card
                    key={album.id}
                    data-testid={`album-result-${album.id}`}
                    className="glass border-white/20 p-4 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigateToAlbum(album)}
                  >
                    <div className="relative mb-3">
                      <div className="w-full h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        {album.media_count > 0 ? (
                          <div className="text-white text-center">
                            <Image className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm font-semibold">{album.media_count} photos/videos</p>
                          </div>
                        ) : (
                          <MapPin className="w-12 h-12 text-white" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{album.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">by @{album.username}</p>
                    <p className="text-sm text-slate-700 line-clamp-2">{album.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
                      <span>❤️ {album.likes?.length || 0}</span>
                      <span>💬 {album.comments?.length || 0}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {peopleResults.length === 0 ? (
                <Card className="glass border-white/20 p-8 text-center col-span-full">
                  <p className="text-slate-600">
                    {searchQuery ? 'No people found. Try a different search.' : 'Search for users by name or email...'}
                  </p>
                </Card>
              ) : (
                peopleResults.map((person) => (
                  <Card
                    key={person.id}
                    data-testid={`person-result-${person.id}`}
                    className="glass border-white/20 p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                          {person.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{person.username}</h3>
                          <p className="text-sm text-slate-600">{person.email}</p>
                          <div className="flex gap-3 mt-1 text-xs text-slate-500">
                            <span>👥 {person.friends?.length || 0} friends</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        data-testid={`add-friend-${person.id}`}
                        onClick={() => sendFriendRequest(person.id)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Add Friend
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventResults.length === 0 ? (
                <Card className="glass border-white/20 p-8 text-center col-span-full">
                  <p className="text-slate-600">
                    {searchQuery ? 'No events found. Try a different search.' : 'Search for upcoming events...'}
                  </p>
                </Card>
              ) : (
                eventResults.map((event) => (
                  <Card
                    key={event.id}
                    data-testid={`event-result-${event.id}`}
                    className="glass border-white/20 p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{event.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2 mb-3">{event.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">by @{event.username}</span>
                      <span className="text-blue-600 font-semibold">{event.attendees?.length || 0} attending</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;