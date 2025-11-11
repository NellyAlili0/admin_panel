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

type CleanRecord = {
  id: string;
  code: string;
  zone: string;
  user: string;
  phone: string;
  time_in: string;
  time_out: string;
  status: string;
};

export function transformRecords(raw: RawRecord[]): CleanRecord[] {
  return raw.map((item) => ({
    id: item.id,
    code: item.code,
    zone: item.zone?.name || "",
    user: item.user?.name || "",
    phone: item.user?.phone || "",
    time_in: item.checkin_at,
    time_out: item.checkout_at,
    status: item.status,
  }));
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

  // Search/filter states
  const [searchZone, setSearchZone] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchTimeFrom, setSearchTimeFrom] = useState("");
  const [searchTimeTo, setSearchTimeTo] = useState("");

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
            fetchAll: true, // Tell the backend to fetch all pages
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

            // Wait before retrying (exponential backoff: 1s, 2s, 4s, 8s, 16s)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, currentRetry) * 1000)
            );

            if (isMountedRef.current) {
              return fetchAllData(isAutoRefresh, currentRetry + 1);
            }
          } else {
            // All retries exhausted
            setError(errorMessage);
            setIsOnline(false);
            setRetryCount(0);

            if (!initialLoadComplete) {
              setInitialLoadComplete(true);
            }
          }
        } else {
          const response = await res.json();

          // Check if data exists
          if (response.data && Array.isArray(response.data.data)) {
            setRecords(response.data.data);
            setTotalRecords(response.data.total || 0);
            setError(null);
            setRetryCount(0); // Reset retry count on success
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

          // Retry logic for network errors
          if (currentRetry < maxRetries) {
            console.log(
              `Retry attempt ${currentRetry + 1} of ${maxRetries} after error`
            );
            setRetryCount(currentRetry + 1);

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, currentRetry) * 1000)
            );

            if (isMountedRef.current) {
              return fetchAllData(isAutoRefresh, currentRetry + 1);
            }
          } else {
            // All retries exhausted
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

  // Filter records based on search criteria
  const filteredRecords = records.filter((record) => {
    const zone = record.zone?.name?.toLowerCase() || "";
    const user = record.user?.name?.toLowerCase() || "";
    const status = record.status?.toLowerCase() || "";
    const checkinTime = record.checkin_at ? new Date(record.checkin_at) : null;

    // Zone filter
    if (searchZone && !zone.includes(searchZone.toLowerCase())) {
      return false;
    }

    // User filter
    if (searchUser && !user.includes(searchUser.toLowerCase())) {
      return false;
    }

    // Status filter
    if (searchStatus && !status.includes(searchStatus.toLowerCase())) {
      return false;
    }

    // Time range filter
    if (searchTimeFrom && checkinTime) {
      const fromDate = new Date(searchTimeFrom);
      if (checkinTime < fromDate) {
        return false;
      }
    }

    if (searchTimeTo && checkinTime) {
      const toDate = new Date(searchTimeTo);
      if (checkinTime > toDate) {
        return false;
      }
    }

    return true;
  });

  // Reset all filters
  const handleResetFilters = () => {
    setSearchZone("");
    setSearchUser("");
    setSearchStatus("");
    setSearchTimeFrom("");
    setSearchTimeTo("");
  };

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

  // Initial fetch - only run once on mount
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
          Loading all smart card records...
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
            Smart Card Records
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground my-3">
            <span className="font-medium">Total Records: {totalRecords}</span>
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
          Refreshing all records...
          {retryCount > 0 && (
            <span className="ml-2 text-orange-600">
              (Retry {retryCount}/{maxRetries})
            </span>
          )}
        </div>
      )}

      {/* Search/Filter Section */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone</label>
              <input
                type="text"
                placeholder="Search by zone..."
                value={searchZone}
                onChange={(e) => setSearchZone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                type="text"
                placeholder="Search by status..."
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Time From
              </label>
              <input
                type="datetime-local"
                value={searchTimeFrom}
                onChange={(e) => setSearchTimeFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time To</label>
              <input
                type="datetime-local"
                value={searchTimeTo}
                onChange={(e) => setSearchTimeTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <GenTable
              title={`All Smart Card Records (${filteredRecords.length} total)`}
              cols={["zone", "user", "phone", "time_in", "time_out", "status"]}
              data={transformRecords(filteredRecords)}
              baseLink=""
              uniqueKey=""
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
