"use client";

import { useEffect, useState } from "react";
import SchoolTrackingMapWrapper from "./SchoolTrackingMapWrapper";

export default function Live({ schoolId }: { schoolId: number }) {
  const [data, setData] = useState({
    students: [],
    active_rides: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/live-tracking?schoolId=${schoolId}`, {
        cache: "no-store",
      });
      const result = await res.json();

      if (result.success) {
        setData({
          students: result.students ?? [],
          active_rides: result.activeRides ?? [],
          locations: result.locations ?? [],
        });
      } else {
        setError("Failed to load tracking data");
      }
    } catch (err) {
      console.error("Failed to load live tracking data:", err);
      setError("Failed to connect to tracking service");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initially + every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-2">
            Error Loading Live Tracking
          </div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <SchoolTrackingMapWrapper
        students={data.students}
        active_rides={data.active_rides}
        locations={data.locations}
      />
    </div>
  );
}
