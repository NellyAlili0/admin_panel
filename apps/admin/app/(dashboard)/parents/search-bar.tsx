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
      (p) =>
        p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
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
          placeholder="Search by name or email..."
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

      {/* Search Results */}
      <GenTable
        title={query ? `Search Results (${filtered.length})` : "All Parents"}
        cols={[
          "name",
          "email",
          "phone_number",
          "is_kyc_verified",
          "wallet_balance",
        ]}
        data={filtered}
        baseLink="/parents/"
        uniqueKey="id"
      />
    </div>
  );
}
