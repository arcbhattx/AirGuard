"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SafeZone {
  id: string | number;
  lat: number;
  lng: number;
  label: string;
  aqi?: number;
}

interface AQICircle {
  id: string | number;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  aqi: number;
}

interface MapContextType {
  center: { lat: number; lng: number };
  zoom: number;
  safeZones: SafeZone[];
  aqiCircles: AQICircle[];
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  panTo: (lat: number, lng: number) => void;
  setSafeZones: (zones: SafeZone[]) => void;
  setAQICircles: (circles: AQICircle[]) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [center, setCenter] = useState({ lat: 37.3022, lng: -120.4820 });
  const [zoom, setZoom] = useState(13);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [aqiCircles, setAQICircles] = useState<AQICircle[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("airguard_last_coords");
    if (saved) {
      try {
        setCenter(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved coords", e);
      }
    }
  }, []);

  const panTo = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    mapInstance?.panTo({ lat, lng });
    mapInstance?.setZoom(14);
  };

  return (
    <MapContext.Provider value={{ center, zoom, safeZones, aqiCircles, setCenter, setZoom, panTo, setSafeZones, setAQICircles }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}
