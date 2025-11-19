"use client";

import NoData from "@/components/NoData";
import { useEffect, useState, useRef, useCallback } from "react";
import GenTable from "@/components/SmartCardTable";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Wifi, WifiOff, Search, X } from "lucide-react";
import Loading from "@/components/ui/Loading";

type RawRecord = {
  id: string;
  code: string;
  zone: { id: string; name: string };
  iot: { id: string; name: string };
  status: string;
  checkin_at: string;
  checkout_at: string;
  created_at: string;
  user: { id: string; phone: string; name: string; names: string };
  user_type: string;
};

type StudentOverview = {
  id: string;
  user: string;
  phone: string;
  zone: string;
  time_in: string;
  time_out: string;
  status: string;
};

// Get latest check-in per student and remove duplicates
export function getStudentOverview(raw: RawRecord[]): StudentOverview[] {
  // Group records by user
  const userMap = new Map<string, RawRecord>();

  raw.forEach((record) => {
    const userId = record.user?.id;
    const userName = record.user?.name;

    if (!userId || !userName) return;

    // Check if we already have a record for this user
    const existing = userMap.get(userId);

    // Keep the record with the latest check-in time
    if (
      !existing ||
      new Date(record.checkin_at) > new Date(existing.checkin_at)
    ) {
      userMap.set(userId, record);
    }
  });

  // Convert to array and transform
  const overview = Array.from(userMap.values()).map((item) => ({
    id: item.user.id,
    user: item.user.name || "",
    phone: item.user.phone || "",
    zone: item.zone?.name || "",
    time_in: item.checkin_at,
    time_out: item.checkout_at,
    status: item.status,
  }));

  // Sort alphabetically by user name
  return overview.sort((a, b) => a.user.localeCompare(b.user));
}

interface SmartCardDashboardProps {
  email: string;
  password: string;
  tag: string;
}

export default function SmartCards({
  email,
  password,
  tag,
}: SmartCardDashboardProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Real-time update states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simplified search - only user name
  const [searchUser, setSearchUser] = useState("");

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // Fetch all data in a single request with retry logic
  const fetchAllData = useCallback(
    async (isAutoRefresh = false, currentRetry = 0) => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const res = await fetch("/api/smartcards/all-accesslogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            tag,
            fetchAll: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!isMountedRef.current) return;

        if (!res.ok) {
          const errJson = await res.json();
          const errorMessage = errJson.error || "Failed to fetch data";

          // Retry logic
          if (currentRetry < maxRetries) {
            console.log(`Retry attempt ${currentRetry + 1} of ${maxRetries}`);
            setRetryCount(currentRetry + 1);

            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, currentRetry) * 1000)
            );

            if (isMountedRef.current) {
              return fetchAllData(isAutoRefresh, currentRetry + 1);
            }
          } else {
            setError(errorMessage);
            setIsOnline(false);
            setRetryCount(0);

            if (!initialLoadComplete) {
              setInitialLoadComplete(true);
            }
          }
        } else {
          const response = await res.json();

          if (response.data && Array.isArray(response.data.data)) {
            setRecords(response.data.data);
            setTotalRecords(response.data.total || 0);
            setError(null);
            setRetryCount(0);
          } else {
            setRecords([]);
            setError("No data available");
          }

          setIsOnline(true);
          setLastUpdated(new Date());
          setInitialLoadComplete(true);
        }
      } catch (e: any) {
        if (e.name !== "AbortError" && isMountedRef.current) {
          console.error("Fetch error:", e);

          if (currentRetry < maxRetries) {
            console.log(
              `Retry attempt ${currentRetry + 1} of ${maxRetries} after error`
            );
            setRetryCount(currentRetry + 1);

            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, currentRetry) * 1000)
            );

            if (isMountedRef.current) {
              return fetchAllData(isAutoRefresh, currentRetry + 1);
            }
          } else {
            setError(e.message || "Network error");
            setIsOnline(false);
            setRetryCount(0);

            if (!initialLoadComplete) {
              setInitialLoadComplete(true);
            }
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [email, password, tag, initialLoadComplete]
  );

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    fetchAllData(false);
  }, [fetchAllData]);

  // Get student overview (deduplicated, latest check-in, sorted)
  const studentOverview = getStudentOverview(records);

  // Filter by user name only
  const filteredStudents = studentOverview.filter((student) => {
    if (
      searchUser &&
      !student.user.toLowerCase().includes(searchUser.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (autoRefresh && isOnline && initialLoadComplete) {
      intervalRef.current = setInterval(
        () => {
          fetchAllData(true);
        },
        2 * 60 * 1000
      );

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [autoRefresh, isOnline, fetchAllData, initialLoadComplete]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoRefresh && initialLoadComplete) {
        fetchAllData(true);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [autoRefresh, fetchAllData, initialLoadComplete]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Show loading only during initial load
  if (loading && !initialLoadComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loading />
        <p className="text-sm text-muted-foreground">
          Loading student overview...
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-orange-600">
            Retry attempt {retryCount} of {maxRetries}...
          </p>
        )}
      </div>
    );
  }

  // Show NoData only after initial load completes and no data exists
  if (initialLoadComplete && records.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            {
              href: "/smartcard-reports",
              label: "Smart Card Reports",
            },
          ]}
        />
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <NoData />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/smartcard-reports",
            label: "Smart Card Reports",
          },
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight my-4">
            Student Location Overview
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
            <span className="font-medium">
              Total Students: {studentOverview.length}
            </span>
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={isOnline ? "text-green-600" : "text-red-600"}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (2 min)
          </label>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {isRefreshing && (
        <div className="text-sm text-muted-foreground mb-2">
          Refreshing student data...
          {retryCount > 0 && (
            <span className="ml-2 text-orange-600">
              (Retry {retryCount}/{maxRetries})
            </span>
          )}
        </div>
      )}

      {/* Simplified Search Section - User Name Only */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Search Student</h2>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Student Name
              </label>
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {searchUser && (
              <button
                onClick={() => setSearchUser("")}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {studentOverview.length}{" "}
            students
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <GenTable
              title={`Current Student Locations (${filteredStudents.length} students)`}
              cols={["user", "zone", "time_in", "time_out", "status"]}
              data={filteredStudents}
              baseLink=""
              uniqueKey=""
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
