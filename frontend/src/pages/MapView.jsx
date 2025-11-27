<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import {
  MapPin,
  Plus,
  Heart,
  MessageCircle,
  User,
  Search,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
=======
import React, { useState, useEffect, useRef } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { MapPin, Plus, Heart, MessageCircle, User, Search, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MapView = ({ token, logout, user, setUser }) => {
  const navigate = useNavigate();
  const [viewport, setViewport] = useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 10,
  });
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPin, setNewPin] = useState({ latitude: null, longitude: null });
  const [pinForm, setPinForm] = useState({
<<<<<<< HEAD
    title: "",
    description: "",
    privacy: "public",
=======
    title: '',
    description: '',
    privacy: 'public',
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pinMedia, setPinMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPins();
    fetchCurrentUser();
<<<<<<< HEAD

=======
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewport((prev) => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }));
        },
<<<<<<< HEAD
        (error) => console.log("Geolocation error:", error)
=======
        (error) => console.log('Geolocation error:', error)
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      );
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to fetch user:", error);
=======
      console.error('Failed to fetch user:', error);
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    }
  };

  const fetchPins = async () => {
    try {
      const response = await axios.get(`${API}/pins`, {
        headers: { Authorization: `Bearer ${token}` },
<<<<<<< HEAD
        params: { userId: user?.id }
      });
      setPins(response.data);
    } catch (error) {
      toast.error("Failed to load pins");
=======
      });
      setPins(response.data);
    } catch (error) {
      toast.error('Failed to load pins');
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    }
  };

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    setNewPin({ longitude: lng, latitude: lat });
    setShowCreateModal(true);
  };

  const handleCreatePin = async () => {
    if (!pinForm.title || !pinForm.description) {
<<<<<<< HEAD
      toast.error("Please fill in all fields");
=======
      toast.error('Please fill in all fields');
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
=======
      // Create pin
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      const pinData = {
        ...pinForm,
        latitude: newPin.latitude,
        longitude: newPin.longitude,
      };
<<<<<<< HEAD

=======
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      const response = await axios.post(`${API}/pins`, pinData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdPin = response.data;

<<<<<<< HEAD
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append("file", file);
          await axios.post(`${API}/pins/${createdPin.id}/media`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
=======
      // Upload media files
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await axios.post(`${API}/pins/${createdPin.id}/media`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
            },
          });
        }
      }

<<<<<<< HEAD
      toast.success("Pin created successfully!");
      setPinForm({ title: "", description: "", privacy: "public" });
=======
      toast.success('Pin created successfully!');
      setPinForm({ title: '', description: '', privacy: 'public' });
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      setMediaFiles([]);
      setShowCreateModal(false);
      fetchPins();
    } catch (error) {
<<<<<<< HEAD
      toast.error("Failed to create pin");
=======
      toast.error('Failed to create pin');
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const [commentText, setCommentText] = useState("");  
  const [commentLoading, setCommentLoading] = useState(false);

  const handlePinClick = (pin) => {
    setSelectedPin(pin);
    setPinMedia(pin.media || []);
    setCommentText("");
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setCommentLoading(true);
    try {
      const response = await axios.post(
        `${API}/pins/${selectedPin.id}/comments`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add new comment to selected pin's comments
      setSelectedPin((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), response.data],
      }));
      setCommentText("");
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
=======
  const handlePinClick = async (pin) => {
    setSelectedPin(pin);
    // Fetch media for this pin
    try {
      const response = await axios.get(`${API}/pins/${pin.id}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPinMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    }
  };

  const handleLike = async (pinId) => {
    try {
<<<<<<< HEAD
      await axios.post(
        `${API}/pins/${pinId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
=======
      await axios.post(`${API}/pins/${pinId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
      fetchPins();
      if (selectedPin && selectedPin.id === pinId) {
        const updated = await axios.get(`${API}/pins/${pinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedPin(updated.data);
      }
    } catch (error) {
<<<<<<< HEAD
      toast.error("Failed to like pin");
=======
      toast.error('Failed to like pin');
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
    }
  };

  return (
    <div className="h-screen w-full relative">
      {/* Map */}
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
<<<<<<< HEAD
        style={{ width: "100%", height: "100%" }}
      >
        {/* ✅ SAFE MARKER RENDERING (prevents crash) */}
        {pins
          .filter(
            (p) =>
              typeof p.latitude === "number" &&
              typeof p.longitude === "number" &&
              p.latitude >= -90 &&
              p.latitude <= 90 &&
              p.longitude >= -180 &&
              p.longitude <= 180
          )
          .map((pin) => (
            <Marker
              key={pin.id}
              longitude={pin.longitude}
              latitude={pin.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handlePinClick(pin);
              }}
            >
              <div className="cursor-pointer transform hover:scale-110 transition-transform">
                <div className="relative">
                  <MapPin
                    className="w-10 h-10 text-red-500 drop-shadow-lg"
                    fill="currentColor"
                  />
                  {pin.media_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {pin.media_count}
                    </span>
                  )}
                </div>
              </div>
            </Marker>
          ))}

        {newPin.latitude && showCreateModal && (
          <Marker
            longitude={newPin.longitude}
            latitude={newPin.latitude}
            anchor="bottom"
          >
            <MapPin
              className="w-10 h-10 text-blue-500 animate-pulse"
              fill="currentColor"
            />
=======
        style={{ width: '100%', height: '100%' }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.longitude}
            latitude={pin.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handlePinClick(pin);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <div className="relative">
                <MapPin
                  className="w-10 h-10 text-red-500 drop-shadow-lg"
                  fill="currentColor"
                />
                {pin.media_count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pin.media_count}
                  </span>
                )}
              </div>
            </div>
          </Marker>
        ))}

        {newPin.latitude && showCreateModal && (
          <Marker longitude={newPin.longitude} latitude={newPin.latitude} anchor="bottom">
            <MapPin className="w-10 h-10 text-blue-500 animate-pulse" fill="currentColor" />
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
          </Marker>
        )}

        {selectedPin && (
          <Popup
            longitude={selectedPin.longitude}
            latitude={selectedPin.latitude}
            anchor="top"
            onClose={() => {
              setSelectedPin(null);
              setPinMedia([]);
            }}
<<<<<<< HEAD
            className="custom-popup flex items-center justify-center"
            offset={[0, -100]}
          >
            <div className="p-4 min-w-[360px] max-w-[520px] max-h-[400px] overflow-auto flex flex-col gap-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {selectedPin.title}
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                by @{selectedPin.username}
              </p>
              <p className="text-slate-700 mb-4">{selectedPin.description}</p>

              {selectedPin?.media?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {selectedPin.media.map((media) => {
                    let src = media.file_data;
                    // Ensure src is a full data url, prepend if needed
                    if (!src.startsWith("data:")) {
                      if (media.media_type === "photo") {
                        src = `data:image/jpeg;base64,${src}`;
                      } else if (media.media_type === "video") {
                        src = `data:video/mp4;base64,${src}`;
                      }
                    }
                    return (
                      <div
                        key={media.id}
                        className="rounded-lg overflow-hidden max-h-40"
                      >
                        {media.media_type === "photo" ? (
                          <img
                            src={src}
                            alt={media.caption || "Pin media"}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <video
                            src={src}
                            className="w-full h-40 object-cover"
                            controls
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3 text-slate-600">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(selectedPin.id)}
                    className="flex items-center gap-1 hover:text-red-500"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        selectedPin.likes?.includes(user?.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    <span>{selectedPin.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedPin.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Display Comments */}
                {selectedPin.comments && selectedPin.comments.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-semibold">Comments</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {selectedPin.comments.map((comment) => (
                        <div key={comment.id} className="bg-white/50 rounded-lg p-2 text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-slate-800">@{comment.username}</span>
                              <p className="text-slate-700 mt-1">{comment.text}</p>
                              <span className="text-xs text-slate-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {selectedPin.user_id === user?.id && (
                              <button
                                onClick={async () => {
                                  try {
                                    // Note: Backend needs endpoint to delete comment by ID
                                    await axios.delete(`${API}/pins/${selectedPin.id}/comments/${comment.id}`, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    setSelectedPin((prev) => ({
                                      ...prev,
                                      comments: prev.comments.filter(c => c.id !== comment.id),
                                    }));
                                    toast.success("Comment deleted");
                                  } catch (error) {
                                    toast.error("Failed to delete comment");
                                  }
                                }}
                                className="text-xs text-red-500 hover:underline ml-2"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPin.user_id === user?.id && (
                  <button
                    onClick={async () => {
                      try {
                        await axios.delete(`${API}/pins/${selectedPin.id}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        toast.success("Pin deleted successfully");
                        setSelectedPin(null);
                        fetchPins();
                      } catch (error) {
                        toast.error("Failed to delete pin");
                      }
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete Pin
                  </button>
                )}

                {/* Add comment form */}
                <div className="mt-4 w-full">
                  <Label htmlFor="comment">Add a Comment</Label>
                  <Textarea
                    id="comment"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="glass border-white/30 resize-none"
                    placeholder="Write your comment here..."
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={commentLoading}
                    className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    {commentLoading ? "Adding..." : "Add Comment"}
                  </Button>
=======
            className="custom-popup"
          >
            <div className="p-4 min-w-[300px] max-w-[400px]">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedPin.title}</h3>
              <p className="text-sm text-slate-600 mb-2">by @{selectedPin.username}</p>
              <p className="text-slate-700 mb-4">{selectedPin.description}</p>

              {pinMedia.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {pinMedia.map((media) => (
                    <div key={media.id} className="rounded-lg overflow-hidden">
                      {media.media_type === 'photo' ? (
                        <img
                          src={media.file_data}
                          alt={media.caption || 'Pin media'}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <video src={media.file_data} className="w-full h-32 object-cover" controls />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-slate-600">
                <button
                  data-testid={`like-pin-${selectedPin.id}`}
                  onClick={() => handleLike(selectedPin.id)}
                  className="flex items-center gap-1 hover:text-red-500"
                >
                  <Heart
                    className={`w-5 h-5 ${selectedPin.likes?.includes(user?.id) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{selectedPin.likes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedPin.comments?.length || 0}</span>
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3 shadow-xl">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">MapMoments</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
<<<<<<< HEAD
              onClick={() => navigate("/discover")}
=======
              data-testid="discover-button"
              onClick={() => navigate('/discover')}
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
              className="glass rounded-xl px-4 py-2 hover:bg-white/30"
              variant="ghost"
            >
              <TrendingUp className="w-5 h-5" />
            </Button>
            <Button
<<<<<<< HEAD
              onClick={() => navigate("/profile")}
=======
              data-testid="profile-button"
              onClick={() => navigate('/profile')}
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
              className="glass rounded-xl px-4 py-2 hover:bg-white/30"
              variant="ghost"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
<<<<<<< HEAD
=======
              data-testid="logout-button"
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
              onClick={logout}
              className="glass rounded-xl px-4 py-2 hover:bg-red-100/50"
              variant="ghost"
            >
              <LogOut className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Pin Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
<<<<<<< HEAD
        <DialogContent className="glass border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Create New Pin
            </DialogTitle>
          </DialogHeader>

=======
        <DialogContent data-testid="create-pin-modal" className="glass border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">Create New Pin</DialogTitle>
          </DialogHeader>
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
<<<<<<< HEAD
                placeholder="Name this location"
                value={pinForm.title}
                onChange={(e) =>
                  setPinForm({ ...pinForm, title: e.target.value })
                }
=======
                data-testid="pin-title-input"
                placeholder="Name this location"
                value={pinForm.title}
                onChange={(e) => setPinForm({ ...pinForm, title: e.target.value })}
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                className="glass border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
<<<<<<< HEAD
                placeholder="Share your memory..."
                value={pinForm.description}
                onChange={(e) =>
                  setPinForm({ ...pinForm, description: e.target.value })
                }
=======
                data-testid="pin-description-input"
                placeholder="Share your memory..."
                value={pinForm.description}
                onChange={(e) => setPinForm({ ...pinForm, description: e.target.value })}
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                className="glass border-white/30 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
<<<<<<< HEAD
              <Select
                value={pinForm.privacy}
                onValueChange={(value) =>
                  setPinForm({ ...pinForm, privacy: value })
                }
              >
                <SelectTrigger className="glass border-white/30">
=======
              <Select value={pinForm.privacy} onValueChange={(value) => setPinForm({ ...pinForm, privacy: value })}>
                <SelectTrigger data-testid="privacy-select" className="glass border-white/30">
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media">Upload Photos/Videos</Label>
              <Input
                id="media"
<<<<<<< HEAD
=======
                data-testid="media-upload-input"
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                className="glass border-white/30"
              />
              {mediaFiles.length > 0 && (
<<<<<<< HEAD
                <p className="text-sm text-slate-600">
                  {mediaFiles.length} file(s) selected
                </p>
=======
                <p className="text-sm text-slate-600">{mediaFiles.length} file(s) selected</p>
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
<<<<<<< HEAD
                onClick={() => {
                  setShowCreateModal(false);
                  setPinForm({ title: "", description: "", privacy: "public" });
=======
                data-testid="cancel-pin-button"
                onClick={() => {
                  setShowCreateModal(false);
                  setPinForm({ title: '', description: '', privacy: 'public' });
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                  setMediaFiles([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
<<<<<<< HEAD

              <Button
=======
              <Button
                data-testid="create-pin-button"
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
                onClick={handleCreatePin}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
<<<<<<< HEAD
                {loading ? "Creating..." : "Create Pin"}
=======
                {loading ? 'Creating...' : 'Create Pin'}
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

<<<<<<< HEAD
export default MapView;
=======
export default MapView;
>>>>>>> fd888746df7d9f0811970ac164b2638516f55fcb
