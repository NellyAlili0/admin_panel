"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";

// Map container styles - full page
const containerStyle = {
  width: "100%",
  height: "100vh",
};

// Sample coordinates (would come from your real-time data source)
// use details around Nairobi

// Map options for dark mode and minimalist design
const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
};

// Replace with your Google Maps API key
const API_KEY = "AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE";

const RealTimeDriverMap = ({
    pickupLocations,
    finalDestination,
    initialDriverLocation,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  const userInteractedRef = useRef(false);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  // Simulate driver movement
  const fetchCordinates = async () => {
    const response = await fetch("/api/location");
    const data = await response.json();
    return data;
  };
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      // Simulate some random movement
      const cordinates = await fetchCordinates();
      setDriverLocation({
        lat: cordinates.latitude,
        lng: cordinates.longitude,
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Get directions
  const fetchDirections = useCallback(() => {
    if (!isLoaded) return;

    const directionsService = new window.google.maps.DirectionsService();

    // Create waypoints from pickup locations
    const waypoints = pickupLocations.map((location) => ({
      location: new window.google.maps.LatLng(location.lat, location.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(
          driverLocation.lat,
          driverLocation.lng
        ),
        destination: new window.google.maps.LatLng(
          finalDestination.lat,
          finalDestination.lng
        ),
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [driverLocation, isLoaded]);

  // Fetch directions when driver location changes
  useEffect(() => {
    if (isLoaded) {
      fetchDirections();
    }
  }, [fetchDirections, isLoaded, driverLocation]);
  useEffect(() => {
    if (map && isAutoCenter && !userInteractedRef.current) {
    //   map.panTo(driverLocation);
    }
  }, [driverLocation, map, isAutoCenter]);

  const onLoad = useCallback((map) => {
    setMap(map);
    // Add listeners to detect when user interacts with map
    // map.addListener("dragstart", () => {
    //   userInteractedRef.current = true;
    //   setIsAutoCenter(false);
    //   setShowRecenterButton(true);
    // });

    // map.addListener("zoom_changed", () => {
    //   userInteractedRef.current = true;
    //   setIsAutoCenter(false);
    //   setShowRecenterButton(true);
    // });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

//   const handleRecenter = () => {
//     if (map) {
//       map.panTo(driverLocation);
//       map.setZoom(14); // Reset to default zoom level
//       setIsAutoCenter(true);
//       userInteractedRef.current = false;
//       setShowRecenterButton(false);
//     }
//   };

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  return isLoaded ? (
    <div className="w-full h-screen relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Driver marker with custom icon */}
        <Marker
          position={driverLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          }}
          title="Driver"
          onClick={() =>
            handleMarkerClick({ ...driverLocation, name: "Driver" })
          }
        />

        {/* Pickup location markers */}
        {pickupLocations.map((location, index) => (
          <Marker
            key={`pickup-${index}`}
            position={location}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#34A853",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
            title={location.name}
            onClick={() => handleMarkerClick(location)}
          />
        ))}
        {/* {showRecenterButton && (
          <div className="absolute bottom-6 right-6 bg-gray-800 bg-opacity-80 p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-gray-700">
            <button
              className="text-white flex items-center justify-center"
              onClick={handleRecenter}
              aria-label="Center on driver"
            >
              <Crosshair size={24} />
            </button>
          </div>
        )} */}

        {/* Final destination marker */}
        <Marker
          position={finalDestination}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#EA4335",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          }}
          title={finalDestination.name}
          onClick={() => handleMarkerClick(finalDestination)}
        />

        {/* Info window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-gray-900 font-medium p-1">
              {selectedMarker.name}
            </div>
          </InfoWindow>
        )}

        {/* Directions renderer */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#FBBC04",
                strokeWeight: 5,
                strokeOpacity: 0.7,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Navigation control */}
      <div className="absolute bottom-6 right-6 bg-gray-800 bg-opacity-70 p-4 rounded-full shadow-lg">
        <button
          className="text-white"
          onClick={() => map && map.panTo(driverLocation)}
          aria-label="Center on driver"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-6 left-6 bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-lg text-white">
        <div className="text-lg font-bold mb-2">Route Map</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Driver</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span> Passenger </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span> Destination</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      Loading Map...
    </div>
  );
};

export default RealTimeDriverMap;
