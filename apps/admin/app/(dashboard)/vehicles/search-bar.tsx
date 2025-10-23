"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GenTable from "@/components/tables";

export default function SearchBar({ data }: { data: any[] }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(data);

  const handleSearch = () => {
    const q = query.toLowerCase();
    const result = data.filter(
      (v) =>
        v.Car.toLowerCase().includes(q) ||
        v.Plate.toLowerCase().includes(q) ||
        v.Driver.toLowerCase().includes(q)
    );
    setFiltered(result);
  };

  const handleClear = () => {
    setQuery("");
    setFiltered(data);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Search input */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search by car name, plate number, or driver..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>
        {query && (
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {/* Filtered Table */}
      <GenTable
        title={query ? `Search Results (${filtered.length})` : "All Vehicles"}
        cols={[
          "Driver",
          "Car",
          "Plate",
          "Type",
          "Model",
          "Available_Seats",
          "status",
        ]}
        data={filtered}
        baseLink="/vehicles/"
        uniqueKey="Plate"
      />
    </div>
  );
}
