"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import io from "socket.io-client";
import {
  StudentDTO,
  DailyRideDTO,
  DriverLocationDTO,
  DriverMarkerData,
} from "./types";

// Custom marker icon for vehicles
const createVehicleIcon = (isActive = true) => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${isActive ? "#DC2626" : "#9CA3AF"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4l-5.16 1.86A1 1 0 0 0 2 13.85V17h3m14 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"/>
    </svg>
  `)}`,
  scaledSize: new window.google.maps.Size(32, 32),
  anchor: new window.google.maps.Point(16, 16),
});

interface Props {
  schoolId: number;
  students: StudentDTO[];
  active_rides: DailyRideDTO[];
  locations: DriverLocationDTO[];
  schoolName?: string;
}

const SchoolTrackingMap = ({
  schoolId,
  active_rides,
  locations,
  schoolName,
}: Props) => {
  const [drivers, setDrivers] = useState<DriverMarkerData[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverMarkerData | null>(
    null
  );
  const [socket, setSocket] = useState<any>(null);
  const [rideKind, setRideKind] = useState<"morning" | "evening">("morning");

  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [retryCount, setRetryCount] = useState(0);

  // Loads Google Maps API before rendering the map.
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyA7dadlEnMc9mu1baJMBE0k-wUiZPCP1OA",
  });

  // Default map center (Nairobi coords).
  // Memoized so it doesn't recalc on every render.
  const center = useMemo(() => ({ lat: -1.2921, lng: 36.8219 }), []);

  // Determine ride kind by time
  useEffect(() => {
    const hour = new Date().getHours();
    setRideKind(hour < 14 ? "morning" : "evening");
  }, []);

  // Build initial driver markers from props
  useEffect(() => {
    const driverMap = new Map<number, DriverMarkerData>();
    console.log(active_rides);

    active_rides.forEach((ride) => {
      const driverId = ride.driverId;
      const location = locations.find((loc) => loc.driverId === driverId);

      // if the driver isn't already added and we have a location add them
      if (!driverMap.has(driverId) && location) {
        driverMap.set(driverId, {
          driverId,
          name: ride.driverName,
          phone: ride.driverPhone,
          vehicleReg: ride.vehicleReg,
          lat: location.latitude,
          lng: location.longitude,
          lastUpdate: location.timestamp,
          students: [],
          status: "Ongoing",
        });
      }

      // Add student to the driver's student list
      const driverData = driverMap.get(driverId);
      console.log(driverData);
      console.log(ride.studentName);
      if (driverData) {
        driverData.students.push(ride.studentName);
      }
    });

    console.log(`🎯 Built driver markers for ${driverMap.size} drivers`);
    setDrivers(Array.from(driverMap.values()));
  }, [active_rides, locations]);

  const driverIds = useMemo(() => drivers.map((d) => d.driverId), [drivers]);

  useEffect(() => {
    if (driverIds.length === 0) {
      console.log("⚠️ No drivers to track");
      return;
    }

    console.log(
      `🔌 Connecting socket to track drivers: ${driverIds.join(", ")}`
    );

    const connectSocket = () => {
      const newSocket = io("https://zidallie-backend.onrender.com", {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection successful
      newSocket.on("connect", () => {
        console.log("✅ School tracking socket connected:", newSocket.id);
        setConnectionStatus("connected");
        setRetryCount(0);

        // Join all driver channels for location updates (this matches your backend)
        driverIds.forEach((driverId) => {
          const numericDriverId = Number(driverId);
          if (!isNaN(numericDriverId)) {
            newSocket.emit("joinDriver", numericDriverId);
            console.log(`📡 Joined driver channel: ${numericDriverId}`);
          }
        });
      });

      // Connection errors
      newSocket.on("connect_error", (err) => {
        console.error(
          "❌ School tracking socket connection error:",
          err.message
        );
        setConnectionStatus("disconnected");
        setRetryCount((prev) => prev + 1);
      });

      // Server errors
      newSocket.on("error", (err) => {
        console.error("⚠️ Socket server error:", err);
      });

      // Disconnection
      newSocket.on("disconnect", (reason) => {
        console.warn("⚠️ School tracking socket disconnected:", reason);
        setConnectionStatus("disconnected");

        if (reason === "io server disconnect") {
          setTimeout(() => newSocket.connect(), 1000);
        }
      });

      // Location updates (this matches your backend's locationBroadcast event)
      newSocket.on("locationBroadcast", (payload: any) => {
        console.log("📡 Location update received:", payload);

        setDrivers((prev) =>
          prev.map((driver) =>
            driver.driverId === payload.driverId
              ? {
                  ...driver,
                  lat: parseFloat(payload.latitude),
                  lng: parseFloat(payload.longitude),
                  lastUpdate: payload.timestamp,
                }
              : driver
          )
        );
      });

      return newSocket;
    };

    const newSocket = connectSocket();
    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log("🔌 Disconnecting school tracking socket");
      newSocket.disconnect();
    };
  }, [driverIds, schoolId]);

  // Fallback polling when socket is disconnected
  useEffect(() => {
    if (connectionStatus !== "connected" && driverIds.length > 0) {
      console.log("📡 Starting fallback polling...");

      const pollInterval = setInterval(async () => {
        console.log("📡 Polling driver locations (fallback)");

        try {
          // Poll each driver's latest location
          const locationPromises = driverIds.map(async (driverId) => {
            const response = await fetch(
              `https://zidallie-backend.onrender.com/api/v1/locations/driver/${driverId}/latest`
            );
            if (response.ok) {
              const locationData = await response.json();
              // Extract the needed data from the API response structure
              return {
                driverId: locationData.driver.id,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                timestamp: locationData.timestamp,
              };
            }
            return null;
          });

          const newLocations = await Promise.all(locationPromises);

          newLocations.forEach((location) => {
            if (location) {
              setDrivers((prev) =>
                prev.map((driver) =>
                  driver.driverId === location.driverId
                    ? {
                        ...driver,
                        lat: parseFloat(location.latitude),
                        lng: parseFloat(location.longitude),
                        lastUpdate: location.timestamp,
                      }
                    : driver
                )
              );
            }
          });
        } catch (error) {
          console.error("❌ Polling error:", error);
        }
      }, 30000);

      return () => clearInterval(pollInterval);
    }
  }, [connectionStatus, driverIds]);

  // Periodic refresh of ongoing rides (every 5 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        console.log("🔄 Refreshing page to get latest ongoing rides");
        window.location.reload();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const formatLastUpdate = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live Updates Active";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return retryCount > 0
          ? `Offline (Retrying ${retryCount}/5)`
          : "Offline";
      default:
        return "Unknown";
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading Map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Live Student Tracking - School {schoolName}
              </h1>
              <p className="text-sm text-gray-600">
                Tracking {drivers.length} ongoing {rideKind} rides
              </p>
            </div>
            {/* Connection debug info */}
            <div className="text-xs text-gray-500">
              Drivers: {driverIds.length > 0 ? driverIds.join(", ") : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        zoom={12}
        center={center}
        mapContainerClassName="w-full h-full"
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.driverId}
            position={{ lat: driver.lat, lng: driver.lng }}
            icon={createVehicleIcon(true)}
            onClick={() => setSelectedDriver(driver)}
          />
        ))}

        {selectedDriver && (
          <InfoWindow
            position={{
              lat: selectedDriver.lat,
              lng: selectedDriver.lng,
            }}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {selectedDriver.name}
              </h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  <span className="text-blue-600">{selectedDriver.phone}</span>
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span>{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {selectedDriver.vehicleReg}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Driver ID:</span>{" "}
                  <span className="text-gray-600">
                    {selectedDriver.driverId}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Update:</span>{" "}
                  <span className="text-gray-600">
                    {formatLastUpdate(selectedDriver.lastUpdate)}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">
                    Students ({selectedDriver.students.length}):
                  </span>
                  <div className="mt-1 max-h-20 overflow-y-auto">
                    {selectedDriver.students.map((s, idx) => (
                      <div key={idx} className="text-gray-600 text-xs">
                        • {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Enhanced Status indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}
            ></div>
            <span className="text-sm text-gray-600">
              {getConnectionStatusText()}
            </span>
          </div>
          {retryCount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Fallback polling active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolTrackingMap;
