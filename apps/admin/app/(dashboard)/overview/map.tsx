"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import "./mapstyles.css";

// Define TypeScript interface for driver data based on /api/stream-drivers response
interface Driver {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  vehicle_id: string;
  vehicle_name: string;
  registration_number: string;
  seat_count: number;
  available_seats: number;
  location: {
    lat: number;
    lng: number;
  };
}

// Map container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Default center - Nairobi coordinates
const defaultCenter = {
  lat: -1.2921,
  lng: 36.8219,
};

const defaultZoom = 12;
const exampleMapStyles = [
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function DriverMap() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAK7GZUUFRWj5DB2xdSZWEXhY882UKY1sU",
  });

  // Function to fetch driver data from API
  // const fetchDriverData = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch("/api/stream-drivers");

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch drivers: ${response.statusText}`);
  //     }

  //     const data: Driver[] = await response.json();
  //     setDrivers(data);
  //     if (data.length > 0 && mapRef.current) {
  //       const newBounds = new google.maps.LatLngBounds();

  //       // Add each driver location to bounds
  //       data.forEach((driver) => {
  //         newBounds.extend(
  //           new google.maps.LatLng(driver.location.lat, driver.location.lng)
  //         );
  //       });

  //       // Store the new bounds
  //       setBounds(newBounds);

  //       // If we have only one driver, set a reasonable zoom level
  //       if (data.length === 1) {
  //         const center = newBounds.getCenter();
  //         setMapCenter({
  //           lat: center.lat(),
  //           lng: center.lng(),
  //         });
  //         setMapZoom(15); // Closer zoom for single driver
  //       } else {
  //         // Let the bounds determine the view
  //         mapRef.current.fitBounds(newBounds, 50);
  //       }
  //     } else if (data.length === 0) {
  //       // If no drivers, reset to default view
  //       setMapCenter(defaultCenter);
  //       setMapZoom(defaultZoom);
  //     }
  //     setError(null);
  //   } catch (err) {
  //     console.error("Error fetching driver data:", err);
  //     setError(
  //       err instanceof Error
  //         ? err.message
  //         : "Unknown error fetching driver data"
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  // Setup interval for fetching data when component mounts
  // useEffect(() => {
  //   if (!isLoaded) return;

  //   // Fetch data immediately on load
  //   fetchDriverData();

  //   // Set up interval to fetch data every 5 seconds
  //   intervalRef.current = setInterval(fetchDriverData, 5000);

  //   // Clean up interval on unmount
  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [isLoaded, fetchDriverData]);

  // Handle map load
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // If we already have drivers when the map loads, fit bounds
    if (drivers.length > 0) {
      const newBounds = new google.maps.LatLngBounds();

      drivers.forEach((driver) => {
        newBounds.extend(
          new google.maps.LatLng(driver.location.lat, driver.location.lng)
        );
      });

      map.fitBounds(newBounds, 50);
      setBounds(newBounds);
    }
  };

  // Navigate to driver detail page
  const handleDriverClick = (driver: Driver) => {
    router.push(`/drivers/${driver.id}`);
  };

  const resetMapView = useCallback(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, 50);
    } else if (mapRef.current) {
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(mapZoom);
    }
  }, [bounds, mapCenter, mapZoom]);

  // Handle API key loading errors
  // if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  //   return (
  //     <div className="error text-red-500 p-4">
  //       Error: Google Maps API key is missing. Please configure
  //       NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
  //     </div>
  //   );
  // }

  if (loadError) {
    return (
      <div className="error text-red-500 p-4">
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="loading">Loading Maps...</div>;
  }

  return (
    <div className="mapContainer h-[400px]">
      {error && <div className="error text-red-500 p-4">{error}</div>}
      {isLoading && <div className="loading">Fetching driver data...</div>}
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
          <Marker
            key={driver.id}
            position={driver.location}
            onClick={() => handleDriverClick(driver)}
            onMouseOver={() => setSelectedDriver(driver)}
            onMouseOut={() => setSelectedDriver(null)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#FFC107", // amber color
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF", // white
              scale: 12,
            }}
          />
        ))}

        {selectedDriver && (
          <InfoWindow
            position={selectedDriver.location}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="infoCard bg-amber-500 border-amber-500 border-2 text-white p-4 rounded-lg">
              <h3 className="text-lg font-bold text-center text-white">
                {selectedDriver.name}
              </h3>
              <p className="text-white">
                <strong className="text-white">Vehicle:</strong>{" "}
                {selectedDriver.vehicle_name}
              </p>
              <p className="text-white">
                <strong className="text-white">Passengers:</strong>{" "}
                {selectedDriver.seat_count - selectedDriver.available_seats}/
                {selectedDriver.seat_count}
              </p>
              <button
                className="viewButton bg-white text-amber-500 px-2 py-1 rounded mt-2"
                onClick={() => router.push(`/drivers/${selectedDriver.id}`)}
              >
                View Details
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
