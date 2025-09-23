"use client";

import dynamic from "next/dynamic";
import { DailyRideDTO, DriverLocationDTO, StudentDTO } from "./types";

interface Props {
  students: StudentDTO[];
  active_rides: DailyRideDTO[];
  locations: DriverLocationDTO[];
}

// Dynamically import the map component with SSR disabled
const SchoolTrackingMap = dynamic(() => import("./SchoolTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-gray-700">
          Loading Live Tracking Map...
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Initializing GPS tracking system
        </div>
      </div>
    </div>
  ),
});

const SchoolTrackingMapWrapper = ({
  students,
  active_rides,
  locations,
}: Props) => {
  // Transform the data to ensure non-nullable fields have fallback values
  const transformedActiveRides: DailyRideDTO[] = active_rides.map((ride) => ({
    ...ride,
    driverName: ride.driverName || "Unknown Driver", // Provide fallback for null values
    driverPhone: ride.driverPhone || "No Phone", // Provide fallback for null values
  }));

  return (
    <SchoolTrackingMap
      students={students}
      active_rides={transformedActiveRides}
      locations={locations}
    />
  );
};

export default SchoolTrackingMapWrapper;
