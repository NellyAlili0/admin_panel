"use client";

import React, { Suspense } from "react";
import { DailyRideDTO, DriverLocationDTO, StudentDTO } from "./types";

interface Props {
  students: StudentDTO[];
  active_rides: DailyRideDTO[];
  locations: DriverLocationDTO[];
}

// Use React.lazy for proper lazy loading
const SchoolTrackingMap = React.lazy(() => import("./SchoolTrackingMap"));

const LoadingComponent = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-lg text-gray-700">Loading Live Tracking Map...</div>
      <div className="text-sm text-gray-500 mt-2">
        Initializing GPS tracking system
      </div>
    </div>
  </div>
);

// Fix: Move libraries array outside component to prevent reloading
const GOOGLE_MAPS_LIBRARIES: (
  | "places"
  | "geometry"
  | "drawing"
  | "visualization"
)[] = [];

export default function SchoolTrackingMapWrapper({
  students,
  active_rides,
  locations,
}: Props) {
  // Transform the data to ensure non-nullable fields have fallback values
  const transformedActiveRides: DailyRideDTO[] = active_rides.map((ride) => ({
    ...ride,
    driverName: ride.driverName || "Unknown Driver",
    driverPhone: ride.driverPhone || "No Phone",
  }));

  return (
    <Suspense fallback={<LoadingComponent />}>
      <SchoolTrackingMap
        students={students}
        active_rides={transformedActiveRides}
        locations={locations}
        googleMapsLibraries={GOOGLE_MAPS_LIBRARIES}
      />
    </Suspense>
  );
}
