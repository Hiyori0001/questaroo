"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import { MapPin, Compass, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Quest } from "@/data/quests"; // Assuming Quest interface is available

// Custom icon for quests
const questIcon = new Icon({
  iconUrl: "/placeholder.svg", // Using existing placeholder, ideally a custom map pin icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom icon for user's location
const userLocationIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>'),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface QuestMapProps {
  quests: Quest[];
  userLocation: LatLngExpression | null; // Pass userLocation as prop
  onLocationFound: (latlng: LatLngExpression) => void; // Callback for when location is found
  locationLoading: boolean; // Pass loading state
}

// Helper component to recenter map
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const QuestMap: React.FC<QuestMapProps> = ({ quests, userLocation, onLocationFound, locationLoading }) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([34.052235, -118.243683]); // Default to Los Angeles

  // Effect to set initial map center if user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latlng: LatLngExpression = [latitude, longitude];
          onLocationFound(latlng); // Call the callback
          toast.success("Your location has been found!");
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Failed to get your location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  return (
    <Card className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 flex flex-col rounded-lg shadow-inner border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
      <CardHeader className="p-4 pb-2 flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Interactive Quest Map
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={getUserLocation}
          disabled={locationLoading}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600"
        >
          {locationLoading ? (
            <Compass className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {locationLoading ? "Locating..." : "My Location"}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>You are here!</Popup>
            </Marker>
          )}
          {quests.map((quest) => {
            if (quest.latitude !== undefined && quest.longitude !== undefined) {
              const position: LatLngExpression = [quest.latitude, quest.longitude];
              return (
                <Marker key={quest.id} position={position} icon={questIcon}>
                  <Popup>
                    <Card className="w-64">
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-lg font-bold">{quest.title}</CardTitle>
                        <CardDescription className="text-sm">{quest.location}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{quest.description}</p>
                        <Link to={`/location-quests/${quest.id}`}>
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                            View Quest
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
          {userLocation && <RecenterAutomatically lat={(userLocation as [number, number])[0]} lng={(userLocation as [number, number])[1]} />}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default QuestMap;