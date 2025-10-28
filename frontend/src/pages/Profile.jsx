import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowLeft, Users, Heart, Search, UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = ({ token, logout, user }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userPins, setUserPins] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('pins');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userRes, pinsRes, friendsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/pins`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/friends`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/friends/requests`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setCurrentUser(userRes.data);
      const myPins = pinsRes.data.filter(pin => pin.user_id === userRes.data.id);
      setUserPins(myPins);
      setFriends(friendsRes.data);
      setFriendRequests(requestsRes.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get(`${API}/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(`${API}/friends/request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send request');
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      await axios.post(`${API}/friends/accept/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Friend request accepted!');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to accept request');
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
            <MapPin className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          </div>
          <div className="w-32"></div>
        </div>

        {/* User Info Card */}
        {currentUser && (
          <Card data-testid="user-info-card" className="glass border-white/20 p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{currentUser.username}</h2>
                <p className="text-slate-600 mb-4">{currentUser.email}</p>
                <div className="flex gap-6 text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">{userPins.length}</span>
                    <span>Pins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">{friends.length}</span>
                    <span>Friends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">
                      {userPins.reduce((sum, pin) => sum + (pin.likes?.length || 0), 0)}
                    </span>
                    <span>Likes</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            data-testid="pins-tab"
            onClick={() => setActiveTab('pins')}
            className={`glass rounded-xl px-6 py-3 ${
              activeTab === 'pins' ? 'bg-white/50' : ''
            }`}
            variant="ghost"
          >
            <MapPin className="w-5 h-5 mr-2" />
            My Pins
          </Button>
          <Button
            data-testid="friends-tab"
            onClick={() => setActiveTab('friends')}
            className={`glass rounded-xl px-6 py-3 ${
              activeTab === 'friends' ? 'bg-white/50' : ''
            }`}
            variant="ghost"
          >
            <Users className="w-5 h-5 mr-2" />
            Friends
            {friendRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'pins' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPins.length === 0 ? (
              <Card className="glass border-white/20 p-8 col-span-full text-center">
                <p className="text-slate-600">No pins yet. Click on the map to create your first pin!</p>
              </Card>
            ) : (
              userPins.map((pin) => (
                <Card key={pin.id} data-testid={`pin-card-${pin.id}`} className="glass border-white/20 p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{pin.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{pin.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="capitalize">{pin.privacy}</span>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {pin.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {pin.media_count || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <Card data-testid="friend-requests-card" className="glass border-white/20 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Friend Requests</h3>
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div key={request.id} data-testid={`friend-request-${request.id}`} className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {request.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{request.username}</p>
                          <p className="text-sm text-slate-600">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`accept-request-${request.id}`}
                          onClick={() => acceptFriendRequest(request.id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Search Users */}
            <Card data-testid="search-users-card" className="glass border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Find Friends</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  data-testid="search-users-input"
                  placeholder="Search by username or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="glass border-white/30"
                />
                <Button data-testid="search-button" onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div key={result.id} data-testid={`search-result-${result.id}`} className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {result.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{result.username}</p>
                          <p className="text-xs text-slate-600">{result.email}</p>
                        </div>
                      </div>
                      <Button
                        data-testid={`add-friend-${result.id}`}
                        onClick={() => sendFriendRequest(result.id)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Friends List */}
            <Card data-testid="friends-list-card" className="glass border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Friends ({friends.length})</h3>
              {friends.length === 0 ? (
                <p className="text-slate-600 text-center py-4">No friends yet. Start searching!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <div key={friend.id} data-testid={`friend-${friend.id}`} className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{friend.username}</p>
                        <p className="text-sm text-slate-600">{friend.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;