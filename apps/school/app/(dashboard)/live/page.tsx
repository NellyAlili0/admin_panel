"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

type Driver = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const drivers: Driver[] = [
  { id: "1", name: "Driver A", lat: -1.2921, lng: 36.8219 }, // Nairobi
  { id: "2", name: "Driver B", lat: -1.3, lng: 36.8 },
  { id: "3", name: "Driver C", lat: -1.31, lng: 36.85 },
];

// Convert Lucide <Car /> to an inline SVG string
function carIconSvg() {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" 
         stroke="red" stroke-width="2" 
         stroke-linecap="round" stroke-linejoin="round" 
         class="lucide lucide-bus">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
      <circle cx="7" cy="18" r="2"/>
      <path d="M9 18h5"/>
      <circle cx="16" cy="18" r="2"/>
    </svg>
  `)}`,
    scaledSize: new google.maps.Size(40, 40), // marker size
    anchor: new google.maps.Point(20, 20), // center the icon
  };
}

function Live() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyA7dadlEnMc9mu1baJMBE0k-wUiZPCP1OA", // move to .env
  });

  const center = useMemo(() => ({ lat: -1.2921, lng: 36.8219 }), []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerClassName="w-full h-[100vh]" // full screen map
    >
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={{ lat: driver.lat, lng: driver.lng }}
          icon={carIconSvg()} // use Lucide Car as marker
        />
      ))}
    </GoogleMap>
  );
}

export default Live;
