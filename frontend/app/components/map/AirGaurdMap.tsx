"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 37.3022,
  lng: -120.4820,
};

const safeSpots = [
  { id: 1, lat: 37.305, lng: -120.48 },
  { id: 2, lat: 37.30, lng: -120.47 },
];

export default function AirGuardMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#FBFBFF]">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
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