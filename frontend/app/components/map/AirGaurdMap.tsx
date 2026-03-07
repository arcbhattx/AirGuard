"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Search, SlidersHorizontal } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initialCenter = {
  lat: 37.3022,
  lng: -120.4820,
};

const safeSpots = [
  { id: 1, lat: 37.305, lng: -120.48 },
  { id: 2, lat: 37.30, lng: -120.47 },
];

export default function AirGuardMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [filters, setFilters] = useState({
    aqi: true,
    wind: false,
    pm: true,
    fire: false,
  });
  const [timeWindow, setTimeWindow] = useState("Now / Real-Time");

  const onLoadMap = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchValue.trim() || !isLoaded) return;
    
    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        setCenter({ lat, lng });
        map?.panTo({ lat, lng });
        
        // Use bounds if available for better zoom level, otherwise default to 14
        if (results[0].geometry.viewport) {
          map?.fitBounds(results[0].geometry.viewport);
        } else {
          map?.setZoom(14);
        }
      } else {
        alert("Location not found. Please try another search.");
      }
      setIsSearching(false);
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#FBFBFF] dark:bg-[#121212] text-[#0B4F6C] dark:text-white transition-colors">
        <div className="animate-spin w-6 h-6 border-2 border-[#01BAEF] border-t-transparent rounded-full mr-3" />
        <span className="font-medium text-sm">Loading Map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      
      {/* Absolute Search Bar over the Map (Left) */}
      <div className="absolute top-6 left-6 z-10 w-full max-w-md">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center w-full h-12 rounded-2xl bg-white dark:bg-[#1A1A1A] shadow-lg shadow-[#0B4F6C]/10 dark:shadow-none border border-[#01BAEF]/10 dark:border-white/10 overflow-hidden transition-colors">
            <button 
              type="submit" 
              className="pl-4 text-[#01BAEF] dark:text-white transition-colors hover:scale-110 flex items-center justify-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin w-5 h-5 border-2 border-[#01BAEF] dark:border-white border-t-transparent rounded-full" />
              ) : (
                <Search size={20} />
              )}
            </button>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search address or zip code..."
              className="flex-1 h-full px-3 text-sm text-[#0B4F6C] dark:text-white bg-transparent outline-none placeholder-[#968E85] focus:outline-none transition-colors font-medium border-0 ring-0 focus:ring-0"
            />
          </div>
        </form>
      </div>

      {/* Filter Panel over the Map (Right) */}
      <div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4">
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md shadow-xl shadow-[#0B4F6C]/10 dark:shadow-none border border-[#01BAEF]/20 dark:border-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#0B4F6C] dark:text-white">
            <SlidersHorizontal size={18} />
            <h3 className="font-bold text-sm tracking-wide">Map Filters</h3>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] dark:text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Air Quality (AQI)</span>
              <input type="checkbox" checked={filters.aqi} onChange={(e) => setFilters({...filters, aqi: e.target.checked})} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] dark:text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Wind Patterns</span>
              <input type="checkbox" checked={filters.wind} onChange={(e) => setFilters({...filters, wind: e.target.checked})} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] dark:text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">PM 2.5 / Particulates</span>
              <input type="checkbox" checked={filters.pm} onChange={(e) => setFilters({...filters, pm: e.target.checked})} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] dark:text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Active Fire Status</span>
              <input type="checkbox" checked={filters.fire} onChange={(e) => setFilters({...filters, fire: e.target.checked})} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
          </div>

          <div className="w-full h-px bg-[#01BAEF]/10 dark:bg-white/10 my-4" />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#0B4F6C] dark:text-white uppercase tracking-wider">Time Window</span>
            <select 
              value={timeWindow} 
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full bg-[#FBFBFF] dark:bg-[#121212] border border-[#01BAEF]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-[#0B4F6C] dark:text-white focus:outline-none focus:border-[#01BAEF] transition-colors appearance-none cursor-pointer"
            >
              <option>Now / Real-Time</option>
              <option>Next 24 Hours (Forecast)</option>
              <option>Past 24 Hours (Historical)</option>
            </select>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoadMap}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {safeSpots.map((spot) => (
          <Marker key={spot.id} position={{ lat: spot.lat, lng: spot.lng }} />
        ))}
      </GoogleMap>
    </div>
  );
}