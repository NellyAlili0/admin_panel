"use client"
// MapComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsService,
  DirectionsRenderer,
  Polyline
} from '@react-google-maps/api';

type LatLngLiteral = google.maps.LatLngLiteral;

const containerStyle = {
  width: '100%',
  height: '600px',
};

const center: LatLngLiteral = { lat: -1.2071700715827154, lng: 36.78596406330276 }; // Example: Nairobi

const origin: LatLngLiteral = { lat: -1.2071700715827154, lng: 36.78596406330276 };
const destination: LatLngLiteral = { lat: -1.2071700715827154, lng: 36.78596406330276 };

const MapComponent: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE', // Use env var
    libraries: ['places'],
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routePath, setRoutePath] = useState<LatLngLiteral[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Simulated driver path data
  useEffect(() => {
    const simulatedPath = [
        // simulate routes in Nairobi
      { lat: -1.2071700715827154, lng: 36.78596406330276 },
      { lat: -1.2071700715827154, lng: 36.78596406330276 }, // -1.2071700715827154, 36.78596406330276
      { lat: -1.2079849585101072, lng: 36.78698289824569 }, // -1.2079849585101072, 36.78698289824569
      { lat: -1.210240447837858, lng: 36.78934077339934 }, // -1.210240447837858, 36.78934077339934
      { lat: -1.2119284257774494, lng: 36.79110190242838 }, // -1.2119284257774494, 36.79110190242838
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < simulatedPath.length) {
        setRoutePath(prev => [...prev, simulatedPath[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10000); // Simulate receiving a new coordinate every second
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
          callback={res => {
            if (res !== null) {
              setDirections(res);
            } else {
              console.error('Directions request failed:', res);
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
            strokeColor: '#FF0000',
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
