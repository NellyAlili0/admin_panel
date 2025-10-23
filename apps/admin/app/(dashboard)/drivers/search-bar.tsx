"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GenTable from "@/components/tables";

export default function SearchBar({ data }: { data: any[] }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(data);

  const handleSearch = () => {
    const q = query.toLowerCase();
    const result = data.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
    );
    setFiltered(result);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Search controls */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>
        {query && (
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setFiltered(data);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Search Results */}
      <GenTable
        title={query ? `Search Results (${filtered.length})` : "All Drivers"}
        cols={["name", "email", "phone", "verified", "balance"]}
        data={filtered}
        baseLink="/drivers/"
        uniqueKey="email"
      />
    </div>
  );
}
