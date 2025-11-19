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
    title: "",
    description: "",
    privacy: "public",
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pinMedia, setPinMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPins();
    fetchCurrentUser();

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
        (error) => console.log("Geolocation error:", error)
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
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchPins = async () => {
    try {
      const response = await axios.get(`${API}/pins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPins(response.data);
    } catch (error) {
      toast.error("Failed to load pins");
    }
  };

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    setNewPin({ longitude: lng, latitude: lat });
    setShowCreateModal(true);
  };

  const handleCreatePin = async () => {
    if (!pinForm.title || !pinForm.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const pinData = {
        ...pinForm,
        latitude: newPin.latitude,
        longitude: newPin.longitude,
      };

      const response = await axios.post(`${API}/pins`, pinData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdPin = response.data;

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append("file", file);
          await axios.post(`${API}/pins/${createdPin.id}/media`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      toast.success("Pin created successfully!");
      setPinForm({ title: "", description: "", privacy: "public" });
      setMediaFiles([]);
      setShowCreateModal(false);
      fetchPins();
    } catch (error) {
      toast.error("Failed to create pin");
    } finally {
      setLoading(false);
    }
  };

  const handlePinClick = async (pin) => {
    setSelectedPin(pin);
    try {
      const response = await axios.get(`${API}/pins/${pin.id}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPinMedia(response.data);
    } catch (error) {
      console.error("Failed to load media:", error);
    }
  };

  const handleLike = async (pinId) => {
    try {
      await axios.post(
        `${API}/pins/${pinId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPins();
      if (selectedPin && selectedPin.id === pinId) {
        const updated = await axios.get(`${API}/pins/${pinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedPin(updated.data);
      }
    } catch (error) {
      toast.error("Failed to like pin");
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
            className="custom-popup"
          >
            <div className="p-4 min-w-[300px] max-w-[400px]">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {selectedPin.title}
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                by @{selectedPin.username}
              </p>
              <p className="text-slate-700 mb-4">{selectedPin.description}</p>

              {pinMedia.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {pinMedia.map((media) => (
                    <div key={media.id} className="rounded-lg overflow-hidden">
                      {media.media_type === "photo" ? (
                        <img
                          src={media.file_data}
                          alt={media.caption || "Pin media"}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <video
                          src={media.file_data}
                          className="w-full h-32 object-cover"
                          controls
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-slate-600">
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
              onClick={() => navigate("/discover")}
              className="glass rounded-xl px-4 py-2 hover:bg-white/30"
              variant="ghost"
            >
              <TrendingUp className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              className="glass rounded-xl px-4 py-2 hover:bg-white/30"
              variant="ghost"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
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
        <DialogContent className="glass border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Create New Pin
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Name this location"
                value={pinForm.title}
                onChange={(e) =>
                  setPinForm({ ...pinForm, title: e.target.value })
                }
                className="glass border-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Share your memory..."
                value={pinForm.description}
                onChange={(e) =>
                  setPinForm({ ...pinForm, description: e.target.value })
                }
                className="glass border-white/30 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select
                value={pinForm.privacy}
                onValueChange={(value) =>
                  setPinForm({ ...pinForm, privacy: value })
                }
              >
                <SelectTrigger className="glass border-white/30">
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
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                className="glass border-white/30"
              />
              {mediaFiles.length > 0 && (
                <p className="text-sm text-slate-600">
                  {mediaFiles.length} file(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setPinForm({ title: "", description: "", privacy: "public" });
                  setMediaFiles([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreatePin}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {loading ? "Creating..." : "Create Pin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;
