"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface RouteData {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

export interface SafeLocationMarker {
  lat: number;
  lng: number;
  label: string;
  isOpen: boolean | null;
  isRecommended: boolean;
}

export interface MultiRoute {
  path: google.maps.LatLngLiteral[];
  color: string;
  label: string;
  isRecommended: boolean;
}

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
  customLocation: { lat: number; lng: number } | null;
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  panTo: (lat: number, lng: number) => void;
  setSafeZones: (zones: SafeZone[]) => void;
  setAQICircles: (circles: AQICircle[]) => void;
  setCustomLocation: (location: { lat: number; lng: number } | null) => void;
  directionsRoute: RouteData | null;
  setDirectionsRoute: (route: RouteData | null) => void;
  multiRoutes: MultiRoute[];
  setMultiRoutes: (routes: MultiRoute[]) => void;
  safeLocationMarkers: SafeLocationMarker[];
  setSafeLocationMarkers: (markers: SafeLocationMarker[]) => void;
  selectedRouteIndex: number | null;
  setSelectedRouteIndex: (index: number | null) => void;
  mapInstance: google.maps.Map | null;
  setMapInstance: (map: google.maps.Map | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [center, setCenter] = useState({ lat: 37.3022, lng: -120.4820 });
  const [zoom, setZoom] = useState(13);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [aqiCircles, setAQICircles] = useState<AQICircle[]>([]);
  const [customLocation, setCustomLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [directionsRoute, setDirectionsRoute] = useState<RouteData | null>(null);
  const [multiRoutes, setMultiRoutes] = useState<MultiRoute[]>([]);
  const [safeLocationMarkers, setSafeLocationMarkers] = useState<SafeLocationMarker[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("airguard_last_coords");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCenter(parsed);
        setCustomLocation(parsed); // Restore pin location if available
      } catch (e) {
        console.error("Error loading saved coords", e);
      }
    }
  }, []);

  const panTo = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    if (mapInstance) {
      mapInstance.panTo({ lat, lng });
      mapInstance.setZoom(14);
    }
  };

  return (
    <MapContext.Provider value={{ center, zoom, safeZones, aqiCircles, customLocation, setCenter, setZoom, panTo, setSafeZones, setAQICircles, setCustomLocation, directionsRoute, setDirectionsRoute, multiRoutes, setMultiRoutes, safeLocationMarkers, setSafeLocationMarkers, selectedRouteIndex, setSelectedRouteIndex, mapInstance, setMapInstance }}>
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
