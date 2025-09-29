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
      const zoneName = record.zone.name;
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
}

export default function SmartCardComponent({
  email,
  password,
}: SmartCardDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
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

  // Update URL when page changes
  const updateURL = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(page);
  };

  // Fetch
  const fetchData = useCallback(
    async (page: number, isAutoRefresh = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isAutoRefresh) setLoading(true);
      else setIsRefreshing(true);

      try {
        const res = await fetch("/api/smartcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            page,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errJson = await res.json();
          setError(errJson.error);
          setIsOnline(false);
        } else {
          const response = await res.json();
          const grouped = groupByZone(response.data.data);
          setRecords(grouped);

          if (response.data.last_page) setTotalPages(response.data.last_page);

          const zoneNames = Object.keys(grouped);
          if (zoneNames.length > 0 && !activeTab) {
            setActiveTab(zoneNames[0]);
          }

          setError(null);
          setIsOnline(true);
          setLastUpdated(new Date());
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Fetch error:", e);
          setError(e.message);
          setIsOnline(false);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeTab, email, password]
  );

  const handleManualRefresh = () => fetchData(currentPage, false);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && isOnline) {
      intervalRef.current = setInterval(() => {
        fetchData(currentPage, true);
      }, 30000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [autoRefresh, isOnline, currentPage, fetchData]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const urlPage = pageParam ? parseInt(pageParam, 10) : 1;
    if (urlPage !== currentPage) setCurrentPage(urlPage);
  }, [searchParams, currentPage]);

  useEffect(() => {
    const zoneNames = Object.keys(records);
    if (zoneNames.length > 0) {
      if (!activeTab || !zoneNames.includes(activeTab)) {
        setActiveTab(zoneNames[0]);
      }
    } else {
      setActiveTab("");
    }
  }, [records, activeTab]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoRefresh) fetchData(currentPage, true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentPage, autoRefresh, fetchData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  if (loading) return <Loading />;
  if (error && Object.keys(records).length === 0 && loading === false)
    return <NoData />;

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

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>

          {/* Manual refresh */}
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

          {/* Pagination Controls */}
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
          {zoneNames.length === 0 ? (
            <NoData />
          ) : (
            <Tabs
              value={activeTab || zoneNames[0]}
              onValueChange={setActiveTab}
              className="w-full"
              defaultValue={activeTab || zoneNames[0]}
            >
              {/* Tabs Header */}
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
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

              {/* Tabs Content */}
              {zoneNames.map((zone) => (
                <TabsContent key={zone} value={zone} className="space-y-4">
                  <div className="rounded-md border">
                    <GenTable
                      title={`${zone} Records`}
                      cols={[
                        "zone",
                        "user",
                        "time_in",
                        "time_out",
                        "code",
                        "status",
                      ]}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
