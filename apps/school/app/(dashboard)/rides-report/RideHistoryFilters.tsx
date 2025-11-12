"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import GenTable from "@/components/tables";

// interface RideData {
//   id: number;
//   student: string;
//   driver: string;
//   scheduled_time: string;
//   embark_time: string;
//   disembark_time: string;
//   pickup_location: string;
//   dropoff_location: string;
//   status: string;
//   vehicle_registration_number: string;
//   kind: string; // "Pickup" or "Dropoff"
// }
export interface RideData {
  id: number;
  student: string;
  driver: string;
  vehicle_registration_number: string;
  scheduled_time: string;
  embark_time: string;
  disembark_time: string;
  kind: string;
  status: string;
  pickup_location?: string | null;
  dropoff_location?: string | null;
}

interface RideHistoryFiltersProps {
  data: RideData[];
}

export default function RideHistoryFilters({ data }: RideHistoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");

  // Get unique statuses for the filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(data.map((ride) => ride.status));
    return Array.from(statuses).sort();
  }, [data]);

  // Filter data based on search, status, and kind
  const filteredData = useMemo(() => {
    return data.filter((ride) => {
      // Search filter - check student, driver, and locations
      const matchesSearch =
        searchQuery === "" ||
        ride.student?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.driver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.pickup_location
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        ride.dropoff_location
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || ride.status === statusFilter;

      // Kind filter (Pickup/Dropoff)
      const matchesKind = kindFilter === "all" || ride.kind === kindFilter;

      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [data, searchQuery, statusFilter, kindFilter]);

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, driver, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Kind Filter (Pickup/Dropoff) */}
        <div className="w-full sm:w-[180px]">
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Pickup">Pickup</SelectItem>
              <SelectItem value="Dropoff">Dropoff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} rides
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <GenTable
          title="Ride History"
          cols={[
            "kind",
            "student",
            "driver",
            "scheduled_time",
            "embark_time",
            "disembark_time",
            // "pickup_location",
            // "dropoff_location",
            "status",
          ]}
          data={filteredData}
          baseLink=""
          uniqueKey=""
        />
      </div>
    </div>
  );
}
