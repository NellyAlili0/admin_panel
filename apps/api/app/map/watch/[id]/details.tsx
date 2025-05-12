"use client";
// MapComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsService,
  DirectionsRenderer,
  Polyline,
} from "@react-google-maps/api";

type LatLngLiteral = google.maps.LatLngLiteral;

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center: LatLngLiteral = {
  lat: -1.2071700715827154,
  lng: 36.78596406330276,
}; // Example: Nairobi

const origin: LatLngLiteral = {
  lat: -1.2071700715827154,
  lng: 36.78596406330276,
};
const destination: LatLngLiteral = {
  lat: -1.2071700715827154,
  lng: 36.78596406330276,
};

const MapComponent: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE", // Use env var
    libraries: ["places"],
  });

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [routePath, setRoutePath] = useState<LatLngLiteral[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Simulated driver path data
  useEffect(() => {
    const simulatedPath = [
      // simulate routes in Nairobi
      //   { lat: -1.2071700715827154, lng: 36.78596406330276 },
      //   { lat: -1.2071700715827154, lng: 36.78596406330276 }, // -1.2071700715827154, 36.78596406330276
      //   { lat: -1.2079849585101072, lng: 36.78698289824569 }, // -1.2079849585101072, 36.78698289824569
      //   { lat: -1.210240447837858, lng: 36.78934077339934 }, // -1.210240447837858, 36.78934077339934
      //   { lat: -1.2119284257774494, lng: 36.79110190242838 }, // -1.2119284257774494, 36.79110190242838
      { lat: -1.2013, lng: 36.7513 }, // Ruaka (Starting Point)
      { lat: -1.2012, lng: 36.752 },
      { lat: -1.2011, lng: 36.7527 },
      { lat: -1.201, lng: 36.7534 },
      { lat: -1.2009, lng: 36.7541 },
      { lat: -1.2008, lng: 36.7548 },
      { lat: -1.2007, lng: 36.7555 },
      { lat: -1.2006, lng: 36.7562 },
      { lat: -1.2005, lng: 36.7569 }, // Near Two Rivers Mall
      { lat: -1.2004, lng: 36.7576 },
      { lat: -1.2003, lng: 36.7583 },
      { lat: -1.2002, lng: 36.759 },
      { lat: -1.2001, lng: 36.7597 },
      { lat: -1.2, lng: 36.7604 },
      { lat: -1.1995, lng: 36.763 },
      { lat: -1.199, lng: 36.7656 },
      { lat: -1.1985, lng: 36.7682 },
      { lat: -1.198, lng: 36.7708 }, // Along Limuru Road
      { lat: -1.1975, lng: 36.7734 },
      { lat: -1.197, lng: 36.776 },
      { lat: -1.1965, lng: 36.7786 },
      { lat: -1.196, lng: 36.7812 },
      { lat: -1.1955, lng: 36.7838 }, // General Mathenge Drive Junction
      { lat: -1.205, lng: 36.784 },
      { lat: -1.21, lng: 36.785 },
      { lat: -1.215, lng: 36.7875 },
      { lat: -1.22, lng: 36.79 },
      { lat: -1.225, lng: 36.7925 },
      { lat: -1.23, lng: 36.795 }, // Westlands Area
      { lat: -1.235, lng: 36.7975 },
      { lat: -1.24, lng: 36.8 },
      { lat: -1.245, lng: 36.8025 },
      { lat: -1.25, lng: 36.805 },
      { lat: -1.255, lng: 36.8075 },
      { lat: -1.26, lng: 36.81 },
      { lat: -1.265, lng: 36.8125 }, // Museum Hill
      { lat: -1.27, lng: 36.815 },
      { lat: -1.272, lng: 36.817 }, //Nairobi CBD (Kenyatta Avenue)
      { lat: -1.274, lng: 36.819 },
      { lat: -1.276, lng: 36.821 },
      { lat: -1.278, lng: 36.823 },
      { lat: -1.28, lng: 36.825 },
      { lat: -1.281, lng: 36.823 },
      { lat: -1.282, lng: 36.821 },
      { lat: -1.2825, lng: 36.819 },
      { lat: -1.283, lng: 36.817 }, // Nairobi CBD (End Point)
      { lat: -1.2831, lng: 36.8168 },
      { lat: -1.2832, lng: 36.8167 },
      { lat: -1.2833, lng: 36.8166 },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < simulatedPath.length) {
        setRoutePath((prev) => [...prev, simulatedPath[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000); // Simulate receiving a new coordinate every second
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onMapLoad}
    >
      {/* Request directions once on mount */}
      {!directions && (
        <DirectionsService
          options={{
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          }}
          callback={(res) => {
            if (res !== null) {
              setDirections(res);
            } else {
              console.error("Directions request failed:", res);
            }
          }}
        />
      )}

      {/* Render the computed directions route */}
      {directions && <DirectionsRenderer directions={directions} />}

      {/* Render the live route from driver data */}
      {routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
};

export default MapComponent;
