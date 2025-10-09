"use client";

import NoData from "@/components/NoData";
import { useEffect, useState, useRef, useCallback } from "react";
import GenTable from "@/components/SmartCardTable";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Database, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

function groupByZone(records: any[]) {
  return records.reduce(
    (acc, record) => {
      const zoneName = record.zone?.name || "Unknown Zone";
      if (!acc[zoneName]) {
        acc[zoneName] = [];
      }
      acc[zoneName].push(record);
      return acc;
    },
    {} as Record<string, any[]>
  );
}

interface SmartCardDashboardProps {
  email: string;
  password: string;
  tag: string;
}

export default function SmartCardComponent({
  email,
  password,
  tag,
}: SmartCardDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("");

  // Real-time update states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Update URL when page changes
  const updateURL = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL(page);
    },
    [updateURL]
  );

  // Fetch smart card data
  const fetchData = useCallback(
    async (page: number, isAutoRefresh = false) => {
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
        const res = await fetch("/api/smartcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            page,
            tag,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!isMountedRef.current) return;

        if (!res.ok) {
          const errJson = await res.json();
          setError(errJson.error || "Failed to fetch data");
          setIsOnline(false);

          // On initial load failure, still mark as complete so NoData shows
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        } else {
          const response = await res.json();

          // Check if data exists
          if (response.data && Array.isArray(response.data.data)) {
            const grouped = groupByZone(response.data.data);
            setRecords(grouped);

            if (response.data.last_page) {
              setTotalPages(response.data.last_page);
            }

            const zoneNames = Object.keys(grouped);
            if (zoneNames.length > 0 && !activeTab) {
              setActiveTab(zoneNames[0]);
            }

            setError(null);
          } else {
            setRecords({});
            setError("No data available");
          }

          setIsOnline(true);
          setLastUpdated(new Date());
          setInitialLoadComplete(true);
        }
      } catch (e: any) {
        if (e.name !== "AbortError" && isMountedRef.current) {
          console.error("Fetch error:", e);
          setError(e.message || "Network error");
          setIsOnline(false);

          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [activeTab, email, password, tag, initialLoadComplete]
  );

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    fetchData(currentPage, false);
  }, [currentPage, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && isOnline && initialLoadComplete) {
      intervalRef.current = setInterval(
        () => {
          fetchData(currentPage, true);
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
  }, [autoRefresh, isOnline, currentPage, fetchData, initialLoadComplete]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchData(currentPage);
  }, []); // Empty deps - only run on mount

  // Refetch when page changes (but not on initial mount)
  useEffect(() => {
    if (initialLoadComplete) {
      fetchData(currentPage);
    }
  }, [currentPage]);

  // Sync activeTab with available zones
  useEffect(() => {
    const zoneNames = Object.keys(records);
    if (
      zoneNames.length > 0 &&
      (!activeTab || !zoneNames.includes(activeTab))
    ) {
      setActiveTab(zoneNames[0]);
    }
  }, [records]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoRefresh && initialLoadComplete) {
        fetchData(currentPage, true);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentPage, autoRefresh, fetchData, initialLoadComplete]);

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
    return <Loading />;
  }

  // Show NoData only after initial load completes and no data exists
  if (initialLoadComplete && Object.keys(records).length === 0) {
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

  const zoneNames = Object.keys(records);

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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages}
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
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="px-3 py-1 text-sm">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab || zoneNames[0]}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex mb-4 items-center gap-2 flex-wrap">
              {zoneNames.map((zone) => (
                <TabsTrigger
                  key={zone}
                  value={zone}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  <span>{zone}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {zoneNames.map((zone) => (
              <TabsContent key={zone} value={zone} className="space-y-4">
                <div className="rounded-md border">
                  <GenTable
                    title={`${zone} Records`}
                    cols={["zone", "user", "time_in", "time_out", "status"]}
                    data={transformRecords(records[zone])}
                    baseLink=""
                    uniqueKey=""
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
