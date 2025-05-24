"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";

interface RouteResponse {
  routes: {
    legs: {
      distance: {
        text: string;
      };
      duration: {
        text: string;
      };
    }[];
  }[];
}
export default function MapPreview({
  pickup_lat,
  pickup_lng,
  dropoff_lat,
  dropoff_lng,
}: {
  pickup_lat: string;
  pickup_lng: string;
  dropoff_lat: string;
  dropoff_lng: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual API key and start/end points
  const apiKey = "AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE"; // Best practice:  Use environment variables
  const startLocation = `${pickup_lat}, ${pickup_lng}`; // Example start
  const endLocation = `${dropoff_lat}, ${dropoff_lng}`; // Example end

  const initMap = useCallback(() => {
    if (!mapRef.current || !apiKey) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 43.6532, lng: -79.3832 }, // Default center (e.g., Toronto)
      zoom: 7,
    });
    setMap(newMap);

    const newDirectionsRenderer = new google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true, // Optionally hide default markers
    });
    setDirectionsRenderer(newDirectionsRenderer);
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) {
      setError(
        "Google Maps API key is missing.  Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable."
      );
      return;
    }

    // Load the Google Maps script
    if (!window.google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        initMap();
      };

      script.onerror = () => {
        setError("Failed to load Google Maps script.");
      };

      // Cleanup
      return () => {
        document.head.removeChild(script);
      };
    } else {
      // If google maps is already available, init map.
      initMap();
    }
  }, [apiKey, initMap]);

  useEffect(() => {
    if (!map || !directionsRenderer) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(response);
          // Extract distance and duration
          const route: RouteResponse = response as RouteResponse;
          if (
            route.routes &&
            route.routes.length > 0 &&
            route.routes[0].legs &&
            route.routes[0].legs.length > 0
          ) {
            const leg = route.routes[0].legs[0]; // Get the first leg of the route
            setRouteInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
            });
          } else {
            setError("Could not extract route information.");
          }
        } else {
          setError(`Directions request failed: ${status}`);
        }
      }
    );
  }, [map, directionsRenderer, startLocation, endLocation]);

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden border">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div
            ref={mapRef}
            className={cn(
              "w-full rounded-lg border border-gray-300",
              "shadow-lg"
            )}
            style={{ height: "260px" }} // Ensure map has a minimum height
          >
            {/* Map will be rendered here */}
          </div>
          {routeInfo && (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">
                Route Information:
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">Distance:</span>{" "}
                {routeInfo.distance}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Estimated Driving Time:</span>{" "}
                {routeInfo.duration}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
