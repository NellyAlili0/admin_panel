"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { User, Phone, Car, Users, Eye, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const GOOGLE_MAPS_API_KEY = "AIzaSyCSmmBwrPkYacuOtfp6Wtlg7QGbnq2aUFE";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

// Center as Nairobi Kenya
const center = {
  lat: -1.286,
  lng: 36.817,
};

const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#F5F5F5" }] }, // Light background
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#FFFFFF" }],
    }, // White stroke for text
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#525252" }],
    }, // Darker grey for text
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6A6A6A" }], // Slightly darker grey for locality
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6A6A6A" }], // Slightly darker grey for POI labels
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#D4EDDA" }], // Light green for parks
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#3C763D" }], // Dark green for park labels
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#E0E0E0" }], // Light grey for roads
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#D0D0D0" }], // Lighter grey stroke for roads
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7A7A7A" }], // Medium grey for road labels
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#C0C0C0" }], // Medium light grey for highways
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#B0B0B0" }], // Lighter grey stroke for highways
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4A4A4A" }], // Darker grey for highway labels
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#E8E8E8" }], // Light grey for transit
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6A6A6A" }], // Slightly darker grey for transit station labels
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#D0E0F0" }], // Light blue for water
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#5E7C9D" }], // Medium blue for water labels
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#FFFFFF" }], // White stroke for water labels
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
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

interface Driver {
  email: string;
  phone_number: string | null;
  name: string;
  vehicle_name: string;
  registration_number: string;
  lastLocation: { latitude: string; longitude: string };
  passengerCount: string;
}

const DriverTrackingMap = () => {
  const [drivers, setDrivers] = useState<any>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [hoveredDriver, setHoveredDriver] = useState<any>(null);

  const fetchDrivers = async () => {
    const response = await fetch("/api/live");
    const data = await response.json();
    return data;
  };

  // Simulate real-time driver movement
  useEffect(() => {
    const interval = setInterval(async () => {
      const drivers = await fetchDrivers();
      setDrivers(drivers);
      //   setDrivers((prevDrivers) =>
      //     prevDrivers.map((driver) => ({
      //       ...driver,
      //       longitude: driver.longitude + (Math.random() - 0.5) * 0.001,
      //       latitude: driver.latitude + (Math.random() - 0.5) * 0.001,
      //       passenger_count:
      //         Math.random() > 0.8
      //           ? Math.max(
      //               0,
      //               driver.passenger_count + (Math.random() > 0.5 ? 1 : -1)
      //             )
      //           : driver.passenger_count,
      //     }))
      //   );
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const router = useRouter();

  const handleMarkerClick = useCallback((driver) => {
    setSelectedDriver(driver);
  }, []);

  const handleMarkerMouseOver = useCallback((driver) => {
    setHoveredDriver(driver);
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    setHoveredDriver(null);
  }, []);

  const handleViewRide = (driver) => {
    router.push(`/driver/${driver.email}`);
  };

  const handleViewProfile = (driver) => {
    router.push(`/driver/${driver.email}`);
  };

  const createCustomMarkerIcon = (passengerCount) => {
    const canvas = document.createElement("canvas");
    const ctx: any = canvas.getContext("2d");
    canvas.width = 60;
    canvas.height = 70;

    // Draw car icon background circle
    ctx.fillStyle = passengerCount > 0 ? "#10B981" : "#6B7280";
    ctx.beginPath();
    ctx.arc(30, 35, 22, 0, 2 * Math.PI);
    ctx.fill();

    // Draw car icon (simplified car shape)
    ctx.fillStyle = "white";
    ctx.beginPath();
    // Car body
    ctx.roundRect(18, 28, 24, 14, 2);
    ctx.fill();

    // Car windows
    ctx.fillStyle = passengerCount > 0 ? "#10B981" : "#6B7280";
    ctx.beginPath();
    ctx.roundRect(20, 30, 8, 4, 1);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(32, 30, 8, 4, 1);
    ctx.fill();

    // Car wheels
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.arc(22, 42, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(38, 42, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw passenger count badge
    if (passengerCount > 0) {
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(45, 20, 10, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(passengerCount.toString(), 45, 25);
    }
    return canvas.toDataURL();
  };

  return (
    <div className="relative w-full h-[calc(100vh-10vh)]">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
        >
          {drivers.map((driver: any) => (
            <Marker
              key={driver.email}
              position={{
                lat: driver.lastLocation.latitude || 0,
                lng: driver.lastLocation.longitude || 0,
              }}
              icon={{
                url: createCustomMarkerIcon(driver.passengerCount),
                // scaledSize: new window.google.maps.Size(40, 50),
                // anchor: new window.google.maps.Point(20, 50),
              }}
              onClick={() => handleMarkerMouseOver(driver)}
              //   onMouseOver={() => handleMarkerMouseOver(driver)}
              //   onMouseOut={handleMarkerMouseOut}
            />
          ))}

          {hoveredDriver && (
            <InfoWindow
              position={{
                lat: hoveredDriver.lastLocation.latitude,
                lng: hoveredDriver.lastLocation.longitude,
              }}
              onCloseClick={() => setHoveredDriver(null)}
            >
              <div className="p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {hoveredDriver.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {hoveredDriver.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{hoveredDriver.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="w-4 h-4" />
                    <span>{hoveredDriver.registration_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hoveredDriver.passengerCount} passengers</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProfile(hoveredDriver)}
                    className="flex-1 flex items-center justify-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Profile
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Stats Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 min-w-64">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Driver Status
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Drivers:</span>
            <span className="text-sm font-medium">{drivers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Passengers:</span>
            <span className="text-sm font-medium">
              {drivers.reduce((sum, d) => sum + Number(d.passengerCount), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Drivers on Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {drivers.reduce((sum, d) => sum + Number(d.passengerCount), 0)}
            </div>
            <span className="text-xs text-gray-600">Passenger count badge</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverTrackingMap;
