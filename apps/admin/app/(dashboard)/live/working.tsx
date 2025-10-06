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

const createVehicleIcon = (isActive = true) => {
  if (typeof window === "undefined") return undefined;
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
  const [isClient, setIsClient] = useState(false);

  const BACKEND_URL = "https://zidallie-backend.onrender.com";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyA7dadlEnMc9mu1baJMBE0k-wUiZPCP1OA",
    libraries: googleMapsLibraries,
  });

  const center = useMemo(() => ({ lat: -1.2921, lng: 36.8219 }), []);

  useEffect(() => {
    if (!isClient) return;

    const nairobiTime = dayjs().tz("Africa/Nairobi");
    const hour = nairobiTime.hour();
    setRideKind(hour < 14 ? "morning" : "evening");
  }, [isClient]);

  // Build driver markers - now reactive to prop changes
  useEffect(() => {
    if (!isClient || !active_rides.length || !locations.length) {
      console.log("⏳ Waiting for data...", {
        isClient,
        activeRidesCount: active_rides.length,
        locationsCount: locations.length,
      });
      return;
    }

    const driverMap = new Map<number, DriverMarkerData>();

    active_rides.forEach((ride) => {
      const driverId = ride.driverId;
      const location = locations.find((loc) => loc.driverId === driverId);

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

      const driverData = driverMap.get(driverId);
      if (driverData) {
        driverData.students.push(ride.studentName);
      }
    });

    const newDrivers = Array.from(driverMap.values());
    console.log(`🎯 Built driver markers for ${newDrivers.length} drivers`);
    setDrivers(newDrivers);
  }, [active_rides, locations, isClient]);

  const driverIds = useMemo(() => drivers.map((d) => d.driverId), [drivers]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!isClient || driverIds.length === 0) {
      return;
    }

    console.log(
      `🔌 Connecting socket to track drivers: ${driverIds.join(", ")}`
    );

    const newSocket = io(BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    newSocket.onAny((eventName, ...args) => {
      console.log(`🔍 Socket Event: ${eventName}`, args);
      setDebugInfo(
        (prev) =>
          `${prev}\n[${new Date().toLocaleTimeString()}] ${eventName}: ${JSON.stringify(args).substring(0, 100)}`
      );
    });

    newSocket.on("connect", () => {
      console.log("✅ Admin tracking socket connected:", newSocket.id);
      setConnectionStatus("connected");
      setRetryCount(0);
      setDebugInfo(
        (prev) =>
          `${prev}\n[${new Date().toLocaleTimeString()}] Connected: ${newSocket.id}`
      );

      driverIds.forEach((driverId, index) => {
        console.log(
          `📡 [${index + 1}/${driverIds.length}] Joining driver channel: ${driverId}`
        );
        newSocket.emit("joinDriver", Number(driverId));
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setConnectionStatus("disconnected");
      setRetryCount((prev) => prev + 1);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") {
        setTimeout(() => newSocket.connect(), 1000);
      }
    });

    newSocket.on("locationBroadcast", (payload: any) => {
      console.log("📡 Location update received:", payload);

      setDrivers((prev) => {
        const driverExists = prev.find(
          (d) => d.driverId === Number(payload.driverId)
        );
        if (!driverExists) {
          console.warn(
            `❌ Driver ${payload.driverId} not found in current drivers list`
          );
          return prev;
        }

        return prev.map((driver) =>
          driver.driverId === Number(payload.driverId)
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

    setSocket(newSocket);

    return () => {
      console.log("🔌 Disconnecting socket");
      newSocket.disconnect();
    };
  }, [driverIds, isClient]);

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
            <div className="text-xs text-gray-500 max-w-xs">
              {/* <div>Socket ID: {socket?.id || "Not connected"}</div> */}
              <div>
                Drivers: {driverIds.length > 0 ? driverIds.join(", ") : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-32 left-4 z-10 bg-black text-green-400 p-2 rounded text-xs max-w-md max-h-40 overflow-y-auto font-mono">
          <div className="font-bold mb-1">Debug Info:</div>
          <pre className="whitespace-pre-wrap">
            {debugInfo.split("\n").slice(-10).join("\n")}
          </pre>
        </div>
      )}

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
