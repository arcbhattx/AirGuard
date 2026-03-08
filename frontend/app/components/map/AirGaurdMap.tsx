"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript, Polyline, Marker } from "@react-google-maps/api";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMap } from "@/app/hooks/MapContext";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: ("geometry")[] = ["geometry"];

// Colors matching the route colors in useChat.ts
const MARKER_COLORS = ["blue", "orange", "green", "purple", "red"];

export default function AirGuardMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: libraries,
  });

  const {
    center,
    panTo,
    directionsRoute,
    setMapInstance,
    customLocation,
    setCustomLocation,
    multiRoutes,
    safeLocationMarkers,
    selectedRouteIndex,
    setSelectedRouteIndex,
    mapInstance,
  } = useMap();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[] | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem("airguard_last_address");
    if (savedAddress) setSearchValue(savedAddress);
  }, []);

  const [filters, setFilters] = useState({
    aqi: true,
    wind: false,
    pm: true,
    fire: false,
  });
  const [timeWindow, setTimeWindow] = useState("Now / Real-Time");

  const onLoadMap = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapInstance(mapInstance);
  }, [setMapInstance]);

  // Handle marker click — select route and zoom to fit it
  const handleMarkerClick = useCallback((idx: number) => {
    setSelectedRouteIndex(idx);

    const route = multiRoutes[idx];
    const marker = safeLocationMarkers[idx];
    if (!route || !marker || !mapInstance) return;

    // Fit bounds to show the selected route from origin to destination
    const bounds = new window.google.maps.LatLngBounds();
    route.path.forEach((pt) => bounds.extend(pt));
    // also include user location
    if (customLocation) bounds.extend(customLocation);
    mapInstance.fitBounds(bounds, { top: 80, bottom: 40, left: 40, right: 340 });
  }, [multiRoutes, safeLocationMarkers, mapInstance, customLocation, setSelectedRouteIndex]);

  useEffect(() => {
    if (!directionsRoute || !isLoaded) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: directionsRoute.origin.lat, longitude: directionsRoute.origin.lng } } },
            destination: { location: { latLng: { latitude: directionsRoute.destination.lat, longitude: directionsRoute.destination.lng } } },
            travelMode: "DRIVE",
          }),
        });

        if (!response.ok) {
          if (response.status === 403) {
            console.warn("Google Routes API is disabled (403). Using free OSRM fallback.");
            try {
              const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${directionsRoute.origin.lng},${directionsRoute.origin.lat};${directionsRoute.destination.lng},${directionsRoute.destination.lat}?overview=full&geometries=polyline`;
              const osrmRes = await fetch(osrmUrl);
              const osrmData = await osrmRes.json();
              if (osrmData.code === "Ok" && osrmData.routes.length > 0) {
                const decodedPath = window.google.maps.geometry.encoding.decodePath(osrmData.routes[0].geometry);
                setRoutePath(decodedPath.map((p) => ({ lat: p.lat(), lng: p.lng() })));
                return;
              }
            } catch (osrmErr) {
              console.error("OSRM fallback failed", osrmErr);
            }
            setRoutePath([
              { lat: directionsRoute.origin.lat, lng: directionsRoute.origin.lng },
              { lat: directionsRoute.destination.lat, lng: directionsRoute.destination.lng },
            ]);
            return;
          }
          throw new Error(`Failed to fetch routes: ${response.status}`);
        }

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.routes[0].polyline.encodedPolyline);
          setRoutePath(decodedPath.map((p) => ({ lat: p.lat(), lng: p.lng() })));
        }
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    fetchRoute();
  }, [directionsRoute, isLoaded]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchValue.trim() || !isLoaded) return;

    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        address: searchValue,
        componentRestrictions: { administrativeArea: "CA", country: "US" },
      },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const formattedAddress = results[0].formatted_address;

          localStorage.setItem("airguard_last_address", formattedAddress);
          localStorage.setItem("airguard_last_coords", JSON.stringify({ lat, lng }));

          setCustomLocation({ lat, lng });
          panTo(lat, lng);

          if (results[0].geometry.viewport) {
            map?.fitBounds(results[0].geometry.viewport);
          } else {
            map?.setZoom(14);
          }
        } else {
          alert("Location not found in California. Please try another search.");
        }
        setIsSearching(false);
      }
    );
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
      {/* Search Bar */}
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

      {/* Filter Panel */}
      <div className="absolute top-6 right-6 z-10 w-80 flex flex-col gap-4">
        <div className="p-4 rounded-3xl bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md shadow-xl shadow-[#0B4F6C]/10 dark:shadow-none border border-[#01BAEF]/20 dark:border-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#0B4F6C] dark:text-white">
            <SlidersHorizontal size={18} />
            <h3 className="font-bold text-sm tracking-wide">Map Filters</h3>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Air Quality (AQI)</span>
              <input type="checkbox" checked={filters.aqi} onChange={(e) => setFilters({ ...filters, aqi: e.target.checked })} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Wind Patterns</span>
              <input type="checkbox" checked={filters.wind} onChange={(e) => setFilters({ ...filters, wind: e.target.checked })} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">PM 2.5 / Particulates</span>
              <input type="checkbox" checked={filters.pm} onChange={(e) => setFilters({ ...filters, pm: e.target.checked })} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-[#968E85] group-hover:text-[#01BAEF] dark:group-hover:text-white transition-colors">Active Fire Status</span>
              <input type="checkbox" checked={filters.fire} onChange={(e) => setFilters({ ...filters, fire: e.target.checked })} className="w-4 h-4 rounded border-[#01BAEF]/30 text-[#01BAEF] focus:ring-[#01BAEF]" />
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

      {/* Location Legend — shows when multi-markers are visible */}
      {safeLocationMarkers.length > 0 && (
        <div className="absolute bottom-20 left-6 z-10">
          <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md shadow-xl border border-[#01BAEF]/20 dark:border-white/10 max-w-xs">
            <h4 className="text-xs font-bold text-[#0B4F6C] dark:text-white uppercase tracking-wider mb-2">Safe Locations — Click to Select</h4>
            {safeLocationMarkers.map((marker, idx) => {
              const isSelected = selectedRouteIndex === idx;
              return (
                <button
                  key={`legend-${idx}`}
                  onClick={() => handleMarkerClick(idx)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-sm ${
                    isSelected
                      ? "bg-[#01BAEF]/15 border border-[#01BAEF]/40 font-bold"
                      : "hover:bg-[#01BAEF]/5"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: ["#01BAEF", "#FF6B35", "#7BC950"][idx] || "#01BAEF" }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[#0B4F6C] dark:text-white truncate">{marker.label}</span>
                  {marker.isOpen === true && <span className="ml-auto text-[10px] font-semibold text-green-600 shrink-0">OPEN</span>}
                  {marker.isOpen === false && <span className="ml-auto text-[10px] font-semibold text-red-500 shrink-0">CLOSED</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoadMap}
        onClick={(e) => {
          if (e.latLng) {
            setCustomLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* Single route (legacy fallback — only if no multi-routes) */}
        {routePath && multiRoutes.length === 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#01BAEF",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            }}
          />
        )}

        {/* Multiple routes — dim unselected, highlight selected */}
        {multiRoutes.map((route, idx) => {
          const isSelected = selectedRouteIndex === idx;
          const hasSelection = selectedRouteIndex !== null;
          return (
            <Polyline
              key={`route-${idx}`}
              path={route.path}
              options={{
                strokeColor: route.color,
                strokeWeight: isSelected ? 7 : hasSelection ? 3 : 4,
                strokeOpacity: isSelected ? 1.0 : hasSelection ? 0.25 : 0.6,
                zIndex: isSelected ? 100 : 1,
              }}
            />
          );
        })}

        {/* Safe location markers — clickable */}
        {safeLocationMarkers.map((marker, idx) => {
          const isSelected = selectedRouteIndex === idx;
          return (
            <Marker
              key={`safe-loc-${idx}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={`${idx + 1}. ${marker.label}${marker.isOpen === true ? " (OPEN)" : marker.isOpen === false ? " (CLOSED)" : ""}`}
              label={{
                text: `${idx + 1}`,
                color: "white",
                fontWeight: "bold",
                fontSize: isSelected ? "16px" : "14px",
              }}
              icon={{
                url: `http://maps.google.com/mapfiles/ms/icons/${MARKER_COLORS[idx % MARKER_COLORS.length]}-dot.png`,
                scaledSize: isSelected
                  ? new window.google.maps.Size(48, 48)
                  : new window.google.maps.Size(32, 32),
              }}
              onClick={() => handleMarkerClick(idx)}
              zIndex={isSelected ? 100 : 10}
            />
          );
        })}

        {/* Legacy single destination marker (only if no multi-markers) */}
        {directionsRoute && safeLocationMarkers.length === 0 && (
          <Marker
            position={directionsRoute.destination}
            title="Safe Location"
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
          />
        )}

        {/* User location pin with label */}
        {customLocation && (
          <Marker
            position={customLocation}
            title="Your Location"
            label={{
              text: "You",
              color: "white",
              fontWeight: "bold",
              fontSize: "12px",
              className: "map-user-label",
            }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            zIndex={200}
          />
        )}
      </GoogleMap>
    </div>
  );
}