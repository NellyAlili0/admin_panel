"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import io from "socket.io-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  DailyRideDTO,
  DriverLocationDTO,
  DriverMarkerData,
  StudentDTO,
} from "./types";

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function to safely convert UTC timestamps to Nairobi time
const formatTimestampToNairobi = (timestamp: any): string => {
  if (!timestamp) return "Not Available";

  try {
    const nairobiTime = dayjs.utc(timestamp).tz("Africa/Nairobi");
    if (!nairobiTime.isValid()) {
      return "Invalid Date";
    }
    return nairobiTime.format("DD/MM/YYYY HH:mm:ss");
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Error formatting date";
  }
};

// Helper function to calculate time difference in a human-readable format
const getTimeDifference = (timestamp: any): string => {
  if (!timestamp) return "Unknown";

  try {
    const timestampInNairobi = dayjs.utc(timestamp).tz("Africa/Nairobi");
    const nowInNairobi = dayjs().tz("Africa/Nairobi");
    const diffMins = nowInNairobi.diff(timestampInNairobi, "minute");

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } catch (error) {
    console.error("Error calculating time difference:", error);
    return "Unknown";
  }
};

// Custom marker icon for vehicles - fixed to handle SSR
const createVehicleIcon = (isActive = true) => {
  if (typeof window === "undefined") return undefined;

  // Check if Google Maps API is loaded before using constructors.
  if (!window.google?.maps) return undefined;

  return {
    url: "/car-marker.svg",
    scaledSize: new window.google.maps.Size(50, 50),
    anchor: new window.google.maps.Point(25, 25),
  };
};

interface Props {
  students: StudentDTO[];
  active_rides: DailyRideDTO[];
  locations: DriverLocationDTO[];
  googleMapsLibraries?: ("places" | "geometry" | "drawing" | "visualization")[];
}

const SchoolTrackingMap = ({
  active_rides,
  locations,
  googleMapsLibraries = [],
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
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Client-side check to prevent SSR issues
  const [isClient, setIsClient] = useState(false);

  // const BACKEND_URL = "https://zidallie-backend.onrender.com";
  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Google Maps API with fixed libraries prop
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyA7dadlEnMc9mu1baJMBE0k-wUiZPCP1OA",
    libraries: googleMapsLibraries,
  });

  // Default map center (Nairobi coords)
  const center = useMemo(() => ({ lat: -1.2921, lng: 36.8219 }), []);

  // Determine ride kind by current time in Nairobi timezone
  useEffect(() => {
    if (!isClient) return;

    const nairobiTime = dayjs().tz("Africa/Nairobi");
    const hour = nairobiTime.hour();
    setRideKind(hour < 14 ? "morning" : "evening");
  }, [isClient]);

  // Build initial driver markers from props
  useEffect(() => {
    if (!isClient) return;

    const driverMap = new Map<number, DriverMarkerData>();

    active_rides.forEach((ride) => {
      const driverId = ride.driverId;
      const location = locations.find((loc) => loc.driverId === driverId);

      // If the driver isn't already added and we have a location, add them
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
      if (driverData) {
        driverData.students.push(ride.studentName);
      }
    });

    console.log(`🎯 Built driver markers for ${driverMap.size} drivers`);
    setDrivers(Array.from(driverMap.values()));
  }, [active_rides, locations, isClient]);

  const driverIds = useMemo(() => drivers.map((d) => d.driverId), [drivers]);

  // Enhanced Socket connection for real-time updates
  useEffect(() => {
    if (!isClient || driverIds.length === 0) {
      console.log(
        "❌ Early return - isClient:",
        isClient,
        "driverIds:",
        driverIds
      );
      return;
    }

    console.log(
      `🔌 Connecting socket to track drivers: ${driverIds.join(", ")}`
    );

    const connectSocket = () => {
      const newSocket = io(BACKEND_URL, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      // Enhanced debugging - log ALL socket events
      newSocket.onAny((eventName, ...args) => {
        console.log(`🔍 Socket Event: ${eventName}`, args);
        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] ${eventName}: ${JSON.stringify(args).substring(0, 100)}`
        );
      });

      // Connection successful
      newSocket.on("connect", () => {
        console.log("✅ Admin tracking socket connected:", newSocket.id);
        setConnectionStatus("connected");
        setRetryCount(0);
        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] Connected: ${newSocket.id}`
        );

        // Join driver channels with enhanced logging
        driverIds.forEach((driverId, index) => {
          const numericDriverId = Number(driverId);
          if (!isNaN(numericDriverId)) {
            console.log(
              `📡 [${index + 1}/${driverIds.length}] Joining driver channel: ${numericDriverId}`
            );
            newSocket.emit("joinDriver", numericDriverId);

            // Add acknowledgment callback
            newSocket.emit("joinDriver", numericDriverId, (response: any) => {
              console.log(`✅ Joined driver ${numericDriverId}:`, response);
            });
          } else {
            console.error("❌ Invalid driver ID:", driverId);
          }
        });

        // Test connection by emitting a test event
        setTimeout(() => {
          console.log("🧪 Testing socket connection...");
          newSocket.emit("ping", { test: true });
        }, 2000);
      });

      // Connection errors
      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
        setConnectionStatus("disconnected");
        setRetryCount((prev) => prev + 1);
        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] Connection Error: ${err.message}`
        );
      });

      // Server errors
      newSocket.on("error", (err) => {
        console.error("⚠️ Socket server error:", err);
        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] Server Error: ${JSON.stringify(err)}`
        );
      });

      // Disconnection
      newSocket.on("disconnect", (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
        setConnectionStatus("disconnected");
        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] Disconnected: ${reason}`
        );

        if (reason === "io server disconnect") {
          setTimeout(() => newSocket.connect(), 1000);
        }
      });

      // Enhanced location updates handler
      newSocket.on("locationBroadcast", (payload: any) => {
        console.log("location update");
        console.log("📡 Location update received:", {
          driverId: payload.driverId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          timestamp: payload.timestamp,
          fullPayload: payload,
        });

        setDebugInfo(
          (prev) =>
            `${prev}\n[${new Date().toLocaleTimeString()}] Location Update: Driver ${payload.driverId} at ${payload.latitude}, ${payload.longitude}`
        );

        setDrivers((prev) => {
          const driverExists = prev.find(
            (d) => d.driverId === payload.driverId
          );
          if (!driverExists) {
            console.warn(
              `❌ Driver ${payload.driverId} not found in current drivers list`
            );
            console.log(
              "Current drivers:",
              prev.map((d) => d.driverId)
            );
            return prev;
          }

          return prev.map((driver) =>
            driver.driverId === payload.driverId
              ? {
                  ...driver,
                  lat: parseFloat(payload.latitude),
                  lng: parseFloat(payload.longitude),
                  lastUpdate: payload.timestamp,
                }
              : driver
          );
        });
      });

      // Add more event listeners for debugging
      newSocket.on("pong", (data: any) => {
        console.log("🏓 Pong received:", data);
      });

      return newSocket;
    };

    const newSocket = connectSocket();
    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log("🔌 Disconnecting socket");
      newSocket.disconnect();
    };
  }, [driverIds, isClient]);

  // Fallback polling when socket is disconnected
  useEffect(() => {
    if (
      !isClient ||
      connectionStatus === "connected" ||
      driverIds.length === 0
    ) {
      return;
    }

    console.log("📡 Starting fallback polling...");

    const pollInterval = setInterval(async () => {
      console.log("📡 Polling driver locations (fallback)");

      try {
        const locationPromises = driverIds.map(async (driverId) => {
          const response = await fetch(
            `${BACKEND_URL}/api/v1/locations/driver/${driverId}/latest`
          );
          if (response.ok) {
            const locationData = await response.json();
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
  }, [connectionStatus, driverIds, isClient]);

  // Periodic refresh of ongoing rides (every 5 minutes)
  useEffect(() => {
    if (!isClient) return;

    const refreshInterval = setInterval(
      () => {
        console.log("🔄 Refreshing page to get latest ongoing rides");
        window.location.reload();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, [isClient]);

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

  // Don't render on server or if maps failed to load
  if (!isClient) {
    return null;
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-2">
            Failed to load Google Maps
          </div>
          <div className="text-sm text-gray-600">
            Please check your API key and internet connection
          </div>
        </div>
      </div>
    );
  }

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
                Live Student Tracking -{" "}
                {rideKind === "morning"
                  ? "Morning Drop-off"
                  : "Evening Pick-up"}
              </h1>
              <p className="text-sm text-gray-600">
                Tracking {drivers.length} ongoing {rideKind} rides
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current time:{" "}
                {dayjs().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm:ss")}{" "}
                (Nairobi)
              </p>
            </div>
            {/* Connection debug info */}
            <div className="text-xs text-gray-500 max-w-xs">
              <div>Socket ID: {socket?.id || "Not connected"}</div>
              <div>
                Drivers: {driverIds.length > 0 ? driverIds.join(", ") : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-32 left-4 z-10 bg-black text-green-400 p-2 rounded text-xs max-w-md max-h-40 overflow-y-auto font-mono">
          <div className="font-bold mb-1">Debug Info:</div>
          <pre className="whitespace-pre-wrap">
            {debugInfo.split("\n").slice(-10).join("\n")}
          </pre>
        </div>
      )}

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
            position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
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
                    {getTimeDifference(selectedDriver.lastUpdate)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Exact Time:</span>{" "}
                  <span className="text-xs text-gray-500">
                    {formatTimestampToNairobi(selectedDriver.lastUpdate)}
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
          {socket && (
            <div className="text-xs text-gray-400 mt-1">
              Socket: {socket.connected ? "Connected" : "Disconnected"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolTrackingMap;
