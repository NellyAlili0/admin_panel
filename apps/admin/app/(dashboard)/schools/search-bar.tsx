"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import GenTable from "@/components/tables";

interface School {
  id: number;
  name: string;
  location: string;
  url: string;
  students: number;
}

export function SchoolSearch({ data }: { data: School[] }) {
  const [query, setQuery] = useState("");

  // Filter data reactively
  const filteredData = useMemo(() => {
    const lower = query.toLowerCase();
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.location.toLowerCase().includes(lower) ||
        s.url.toLowerCase().includes(lower)
    );
  }, [query, data]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search schools by name, location, or URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Table */}
      <GenTable
        title="All Schools"
        cols={["id", "name", "location", "students", "url"]}
        data={filteredData}
        baseLink="/schools/"
        uniqueKey="id"
      />

      {filteredData.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          No schools match your search.
        </p>
      )}
    </div>
  );
}
