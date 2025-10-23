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
      (r) =>
        r.parent_name?.toLowerCase().includes(q) ||
        r.parent?.toLowerCase().includes(q) ||
        r.student?.toLowerCase().includes(q)
    );
    setFiltered(result);
  };

  const handleClear = () => {
    setQuery("");
    setFiltered(data);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Search input + button */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search by parent name, email, or student name..."
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

      {/* Filtered table */}
      <GenTable
        title={query ? `Search Results (${filtered.length})` : "All Rides"}
        cols={["id", "status", "parent", "student"]}
        data={filtered}
        baseLink="/rides/"
        uniqueKey="id"
      />
    </div>
  );
}
