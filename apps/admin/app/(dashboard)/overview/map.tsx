"use client";

// pages/driver-map.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "./mapstyles.css";


// Map container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Default center - update to your desired location. Use Nairobi cordinates as default
const defaultCenter = {
  lat: 1.2921,
  lng: 36.8219,
};

const defaultZoom = 12;
const exampleMapStyles = [
    {
        featureType: "poi",
        elementType: "geometry",
        stylers: [
            {
                color: "#eeeeee",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "labels.text",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [
            {
                color: "#9e9e9e",
            },
        ],
    },
];
export default function DriverMap() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Function to fetch driver data from API
  const fetchDriverData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/trip");

      if (!response.ok) {
        throw new Error(`Failed to fetch drivers: ${response.statusText}`);
      }

      const data = await response.json();
      setDrivers(data);
      if (data.length > 0 && mapRef.current) {
        const newBounds = new google.maps.LatLngBounds();
        
        // Add each driver location to bounds
        data.forEach((driver: any) => {
          newBounds.extend(new google.maps.LatLng(
            driver.location.lat,
            driver.location.lng
          ));
        });
        
        // Store the new bounds
        setBounds(newBounds);
        
        // If we have only one driver, set a reasonable zoom level
        if (data.length === 1) {
          const center = newBounds.getCenter();
          setMapCenter({
            lat: center.lat(),
            lng: center.lng()
          });
          setMapZoom(15); // Closer zoom for single driver
        } else {
          // Let the bounds determine the view
          mapRef.current.fitBounds(newBounds, 50);
        }
      } else if (data.length === 0) {
        // If no drivers, reset to default view
        setMapCenter(defaultCenter);
        setMapZoom(defaultZoom);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching driver data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error fetching driver data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup event source for streaming data when component mounts
  useEffect(() => {
    if (!isLoaded) return;

    // Fetch data immediately on load
    fetchDriverData();

    // Set up interval to fetch data every 5 seconds
    intervalRef.current = setInterval(fetchDriverData, 5000);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoaded, fetchDriverData]);

  // Handle map load
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // If we already have drivers when the map loads, fit bounds
    if (drivers.length > 0) {
      const newBounds = new google.maps.LatLngBounds();
      
      drivers.forEach((driver) => {
        newBounds.extend(new google.maps.LatLng(
          driver.location.lat,
          driver.location.lng
        ));
      });
      
      map.fitBounds(newBounds, 50);
      
      setBounds(newBounds);
    }
  };

  // Navigate to driver detail page
  const handleDriverClick = (driver: any) => {
    router.push(`/driver/${driver.id}`);
  };
  const resetMapView = useCallback(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, 50);
    } else if (mapRef.current) {
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(mapZoom);
    }
  }, [bounds, mapCenter, mapZoom]);

  if (!isLoaded) return <div className="loading">Loading Maps...</div>;

  return (
    <div className="mapContainer h-[400px]">
        <button 
          className="absolute top-2 right-2 z-10 bg-white text-black p-2 rounded-lg shadow-lg cursor-pointer"
          onClick={resetMapView}
          title="Reset map view to show all drivers"
        >
          Center Map
        </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          styles: exampleMapStyles,
        }}
      >
        {drivers.map((driver) => (
          <CustomMarker
            key={driver.id}
            driver={driver}
            onClick={() => setSelectedDriver(driver)}
            onMouseOver={() => setSelectedDriver(driver)}
            onMouseOut={() => {}}
          />
        ))}

        {selectedDriver && (
          <InfoWindow
            driver={selectedDriver}
            position={selectedDriver.location}
            onClose={() => setSelectedDriver(null)}
          />
        )}
      </GoogleMap>
    </div>
  );
}

// Custom marker component with driver info
interface CustomMarkerProps {
  driver: any;
  onClick: () => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

function CustomMarker({
  driver,
  onClick,
  onMouseOver,
  onMouseOut,
}: CustomMarkerProps) {
  return (
    <Marker
      position={driver.location}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#FFC107", // amber color
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF", // white
        scale: 12,
      }}
    />
  );
}

// Info window component for displaying driver details
interface InfoWindowProps {
  driver: any;
  position: { lat: number; lng: number };
  onClose: () => void;
}

function InfoWindow({ driver, position, onClose }: InfoWindowProps) {
    // add pulse animation to info window using tailwind
    // only pulse the border
    
    
  return (
    <div
      className="infoWindow"
      style={{
        position: "absolute",
        transform: "translate(-50%, -130%)",
        top: "80%",
        left: "50%",
        // left: position.lat,
        // top: position.lng,
      }}
    >
      <div className="">
      <div className="infoCard animate-none bg-amber-500 border-amber-500 border-2 text-white">
        <button className="closeButton" onClick={onClose}>
          ×
        </button>
        <h3 className="text-lg font-bold text-center text-white">{driver.name}</h3>
        <p className="text-white">
          <strong className="text-white">Vehicle:</strong> {driver.vehicle_name}
        </p>
        <p className="text-white">
          <strong className="text-white">Passengers:</strong> {driver.seat_count}
        </p>
        <button
          className="viewButton"
          onClick={() => (window.location.href = `/driver/${driver.id}`)}
        >
          View Details
        </button>
      </div>
      </div>
    </div>
  );
}
