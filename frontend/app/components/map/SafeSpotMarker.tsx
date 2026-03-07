import { Marker } from "@react-google-maps/api";

export default function SafeSpotMarker({ lat, lng }: { lat: number; lng: number }) {
  return (
    <Marker
      position={{ lat, lng }}
      icon={{
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#01BAEF",
        fillOpacity: 1,
        strokeColor: "#0B4F6C",
        strokeWeight: 2,
      }}
    />
  );
}