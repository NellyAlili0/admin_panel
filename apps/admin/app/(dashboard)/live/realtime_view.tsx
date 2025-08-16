"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { User, Phone, Car, Users, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: -1.286, lng: 36.817 }; // Nairobi

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

interface Driver {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  vehicle_make: string;
  vehicle_model: string;
  registration_number: string;
  latitude: number;
  longitude: number;
  passenger_count: number;
}

const DriverTrackingMap = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [hoveredDriver, setHoveredDriver] = useState<Driver | null>(null);
  const router = useRouter();

  // const fetchDrivers = async (): Promise<Driver[]> => {
  //   const response = await fetch("/api/live");
  //   return await response.json();
  // };

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const liveDrivers = await fetchDrivers();
  //     setDrivers(liveDrivers);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);

  const handleMarkerClick = useCallback((driver: Driver) => {
    setHoveredDriver(driver);
  }, []);

  const handleViewProfile = (driver: Driver) => {
    router.push(`/driver/${driver.id}`);
  };

  const createCustomMarkerIcon = (passengerCount: number) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 60;
    canvas.height = 70;

    // Background circle
    ctx.fillStyle = passengerCount > 0 ? "#10B981" : "#6B7280";
    ctx.beginPath();
    ctx.arc(30, 35, 22, 0, 2 * Math.PI);
    ctx.fill();

    // Car body
    ctx.fillStyle = "white";
    ctx.fillRect(20, 28, 20, 12);

    // Passenger badge
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
          {drivers.map((driver) => (
            <Marker
              key={driver.id}
              position={{ lat: driver.latitude, lng: driver.longitude }}
              icon={{ url: createCustomMarkerIcon(driver.passenger_count) }}
              onClick={() => handleMarkerClick(driver)}
            />
          ))}

          {hoveredDriver && (
            <InfoWindow
              position={{
                lat: hoveredDriver.latitude,
                lng: hoveredDriver.longitude,
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
                      {hoveredDriver.first_name} {hoveredDriver.last_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {hoveredDriver.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{hoveredDriver.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>
                      {hoveredDriver.vehicle_make} {hoveredDriver.vehicle_model}{" "}
                      ({hoveredDriver.registration_number})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{hoveredDriver.passenger_count} passengers</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewProfile(hoveredDriver)}
                  className="w-full flex items-center justify-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Profile
                </button>
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
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Drivers:</span>
            <span className="font-medium">{drivers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Passengers:</span>
            <span className="font-medium">
              {drivers.reduce((sum, d) => sum + d.passenger_count, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverTrackingMap;
